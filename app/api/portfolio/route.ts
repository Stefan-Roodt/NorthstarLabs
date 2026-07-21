import { env } from "cloudflare:workers";
import { requireApiUser } from "../../../lib/server-auth";
import { ensureProfile } from "../../../lib/school-access";

const evidenceTypes = new Set(["project", "challenge", "skill", "feedback"]);
const sourceTypes = new Set(["certificate", "assessment"]);

function portfolioSlug(name: string) {
  const base = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 42) || "learner";
  return `${base}-${crypto.randomUUID().slice(0, 7)}`;
}

function cleanText(value: unknown, maximum: number) {
  return typeof value === "string" ? value.trim().slice(0, maximum) : "";
}

function cleanEvidenceUrl(value: unknown) {
  const text = cleanText(value, 500);
  if (!text) return null;
  try {
    const url = new URL(text);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

async function ensurePortfolio(user: NonNullable<Awaited<ReturnType<typeof requireApiUser>>>) {
  const profile = await ensureProfile(user);
  const existing = await env.DB.prepare(
    `SELECT user_id AS userId,slug,headline,bio,visibility,
      created_at AS createdAt,updated_at AS updatedAt
     FROM learning_portfolios WHERE user_id=?`,
  ).bind(user.id).first();
  if (existing) return existing;
  const now = Date.now();
  const displayName = profile?.displayName || user.email?.split("@")[0] || "Learner";
  await env.DB.prepare(
    `INSERT INTO learning_portfolios
      (user_id,slug,headline,bio,visibility,created_at,updated_at)
     VALUES (?,?,?,'','draft',?,?)`,
  ).bind(
    user.id,
    portfolioSlug(displayName),
    `${displayName}'s proof of learning`,
    now,
    now,
  ).run();
  return env.DB.prepare(
    `SELECT user_id AS userId,slug,headline,bio,visibility,
      created_at AS createdAt,updated_at AS updatedAt
     FROM learning_portfolios WHERE user_id=?`,
  ).bind(user.id).first();
}

async function privatePortfolio(user: NonNullable<Awaited<ReturnType<typeof requireApiUser>>>) {
  const portfolio = await ensurePortfolio(user);
  const [certificates, assessments, evidence] = await Promise.all([
    env.DB.prepare(
      `SELECT cert.code AS sourceId,cert.course_title AS courseTitle,
        cert.certificate_title AS title,cert.issued_at AS achievedAt,
        cert.status,cert.expires_at AS expiresAt,s.name AS issuerName,
        CASE WHEN cert.status='active' AND (cert.expires_at IS NULL OR cert.expires_at>?)
          THEN 1 ELSE 0 END AS valid,COALESCE(psv.visible,0) AS visible
       FROM certificates cert
       JOIN courses c ON c.id=cert.course_id
       JOIN schools s ON s.id=c.school_id
       LEFT JOIN portfolio_source_visibility psv
         ON psv.user_id=cert.user_id AND psv.source_type='certificate'
         AND psv.source_id=cert.code
       WHERE cert.user_id=?
       ORDER BY cert.issued_at DESC`,
    ).bind(Date.now(), user.id).all(),
    env.DB.prepare(
      `SELECT q.id AS sourceId,q.title,l.title AS lessonTitle,c.title AS courseTitle,
        s.name AS issuerName,MAX(qa.score) AS bestScore,
        MAX(qa.submitted_at) AS achievedAt,
        MAX(CASE WHEN qa.passed=1 THEN 1 ELSE 0 END) AS passed,
        COALESCE(psv.visible,0) AS visible,COALESCE(psv.show_score,0) AS showScore
       FROM quiz_attempts qa
       JOIN quizzes q ON q.id=qa.quiz_id
       JOIN lessons l ON l.id=q.lesson_id
       JOIN courses c ON c.id=l.course_id
       JOIN schools s ON s.id=c.school_id
       LEFT JOIN portfolio_source_visibility psv
         ON psv.user_id=qa.user_id AND psv.source_type='assessment'
         AND psv.source_id=q.id
       WHERE qa.user_id=?
       GROUP BY q.id,q.title,l.title,c.title,s.name,psv.visible,psv.show_score
       HAVING MAX(CASE WHEN qa.passed=1 THEN 1 ELSE 0 END)=1
       ORDER BY achievedAt DESC`,
    ).bind(user.id).all(),
    env.DB.prepare(
      `SELECT id,course_id AS courseId,evidence_type AS evidenceType,title,
        description,skills,evidence_url AS evidenceUrl,achieved_at AS achievedAt,
        visible,sort_order AS sortOrder,created_at AS createdAt,updated_at AS updatedAt
       FROM portfolio_evidence WHERE user_id=?
       ORDER BY sort_order,created_at DESC`,
    ).bind(user.id).all(),
  ]);
  return {
    portfolio,
    sharePath: `/portfolio/${String((portfolio as { slug?: string } | null)?.slug || "")}`,
    certificates: certificates.results,
    assessments: assessments.results,
    evidence: evidence.results,
  };
}

export async function GET(request: Request) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  return Response.json(await privatePortfolio(user), {
    headers: { "cache-control": "private, no-store" },
  });
}

export async function PATCH(request: Request) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  await ensurePortfolio(user);
  const body = await request.json() as {
    action?: string;
    headline?: string;
    bio?: string;
    visibility?: string;
    sourceType?: string;
    sourceId?: string;
    visible?: boolean;
    showScore?: boolean;
    id?: string;
    evidenceType?: string;
    title?: string;
    description?: string;
    skills?: string;
    evidenceUrl?: string;
    achievedAt?: number | null;
  };
  const now = Date.now();

  if (body.action === "profile") {
    const headline = cleanText(body.headline, 120);
    const bio = cleanText(body.bio, 700);
    const visibility = body.visibility === "published" ? "published" : "draft";
    if (headline.length < 3) {
      return Response.json({ error: "Add a clear portfolio headline." }, { status: 400 });
    }
    await env.DB.prepare(
      `UPDATE learning_portfolios SET headline=?,bio=?,visibility=?,updated_at=?
       WHERE user_id=?`,
    ).bind(headline, bio, visibility, now, user.id).run();
  } else if (body.action === "source") {
    const sourceType = cleanText(body.sourceType, 20);
    const sourceId = cleanText(body.sourceId, 100);
    if (!sourceTypes.has(sourceType) || !sourceId) {
      return Response.json({ error: "Choose valid learning evidence." }, { status: 400 });
    }
    const owned = sourceType === "certificate"
      ? await env.DB.prepare(
        `SELECT code,status,expires_at AS expiresAt
         FROM certificates WHERE code=? AND user_id=?`,
      ).bind(sourceId, user.id).first<{ code: string; status: string; expiresAt: number | null }>()
      : await env.DB.prepare(
        `SELECT qa.quiz_id FROM quiz_attempts qa
         WHERE qa.quiz_id=? AND qa.user_id=? AND qa.passed=1 LIMIT 1`,
      ).bind(sourceId, user.id).first();
    if (!owned) return Response.json({ error: "Learning evidence not found." }, { status: 404 });
    if (
      sourceType === "certificate" && body.visible && "status" in owned &&
      (owned.status !== "active" || Boolean(owned.expiresAt && owned.expiresAt <= now))
    ) {
      return Response.json({ error: "Only a currently valid certificate can be shared." }, { status: 400 });
    }
    await env.DB.prepare(
      `INSERT INTO portfolio_source_visibility
        (id,user_id,source_type,source_id,visible,show_score,created_at,updated_at)
       VALUES (?,?,?,?,?,?,?,?)
       ON CONFLICT(user_id,source_type,source_id) DO UPDATE SET
         visible=excluded.visible,show_score=excluded.show_score,updated_at=excluded.updated_at`,
    ).bind(
      crypto.randomUUID(), user.id, sourceType, sourceId,
      body.visible ? 1 : 0,
      sourceType === "assessment" && body.showScore ? 1 : 0,
      now, now,
    ).run();
  } else if (body.action === "evidence") {
    const id = cleanText(body.id, 100);
    const evidenceType = cleanText(body.evidenceType, 20);
    const title = cleanText(body.title, 120);
    if (!id || !evidenceTypes.has(evidenceType) || title.length < 3) {
      return Response.json({ error: "Add a title and choose a valid evidence type." }, { status: 400 });
    }
    const existing = await env.DB.prepare(
      "SELECT id FROM portfolio_evidence WHERE id=? AND user_id=?",
    ).bind(id, user.id).first();
    if (!existing) return Response.json({ error: "Evidence not found." }, { status: 404 });
    const evidenceUrl = cleanEvidenceUrl(body.evidenceUrl);
    if (cleanText(body.evidenceUrl, 500) && !evidenceUrl) {
      return Response.json({ error: "Use a complete http or https evidence link." }, { status: 400 });
    }
    await env.DB.prepare(
      `UPDATE portfolio_evidence SET evidence_type=?,title=?,description=?,skills=?,
        evidence_url=?,achieved_at=?,visible=?,updated_at=?
       WHERE id=? AND user_id=?`,
    ).bind(
      evidenceType, title, cleanText(body.description, 1200), cleanText(body.skills, 300),
      evidenceUrl, Number(body.achievedAt) || null, body.visible ? 1 : 0,
      now, id, user.id,
    ).run();
  } else {
    return Response.json({ error: "Choose a portfolio update." }, { status: 400 });
  }

  return Response.json({ saved: true, ...(await privatePortfolio(user)) });
}

export async function POST(request: Request) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  await ensurePortfolio(user);
  const body = await request.json() as {
    evidenceType?: string;
    title?: string;
    description?: string;
    skills?: string;
    evidenceUrl?: string;
    achievedAt?: number | null;
  };
  const evidenceType = cleanText(body.evidenceType, 20);
  const title = cleanText(body.title, 120);
  if (!evidenceTypes.has(evidenceType) || title.length < 3) {
    return Response.json({ error: "Add a title and choose a valid evidence type." }, { status: 400 });
  }
  const evidenceUrl = cleanEvidenceUrl(body.evidenceUrl);
  if (cleanText(body.evidenceUrl, 500) && !evidenceUrl) {
    return Response.json({ error: "Use a complete http or https evidence link." }, { status: 400 });
  }
  const now = Date.now();
  await env.DB.prepare(
    `INSERT INTO portfolio_evidence
      (id,user_id,course_id,evidence_type,title,description,skills,evidence_url,
       achieved_at,visible,sort_order,created_at,updated_at)
     VALUES (?,?,NULL,?,?,?,?,?,?,0,0,?,?)`,
  ).bind(
    crypto.randomUUID(), user.id, evidenceType, title,
    cleanText(body.description, 1200), cleanText(body.skills, 300), evidenceUrl,
    Number(body.achievedAt) || null, now, now,
  ).run();
  return Response.json({ saved: true, ...(await privatePortfolio(user)) });
}

export async function DELETE(request: Request) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json() as { id?: string };
  const id = cleanText(body.id, 100);
  if (!id) return Response.json({ error: "Evidence required." }, { status: 400 });
  await env.DB.prepare(
    "DELETE FROM portfolio_evidence WHERE id=? AND user_id=?",
  ).bind(id, user.id).run();
  return Response.json({ deleted: true, ...(await privatePortfolio(user)) });
}
