import { env } from "cloudflare:workers";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const portfolio = await env.DB.prepare(
    `SELECT lp.slug,lp.headline,lp.bio,lp.updated_at AS updatedAt,
      p.display_name AS learnerName
     FROM learning_portfolios lp
     JOIN profiles p ON p.id=lp.user_id
     WHERE lp.slug=? AND lp.visibility='published' AND p.status='active'`,
  ).bind(slug).first<{
    slug: string;
    headline: string;
    bio: string;
    updatedAt: number;
    learnerName: string;
  }>();
  if (!portfolio) return Response.json({ error: "Portfolio not found." }, { status: 404 });

  const owner = await env.DB.prepare(
    "SELECT user_id AS userId FROM learning_portfolios WHERE slug=?",
  ).bind(slug).first<{ userId: string }>();
  if (!owner) return Response.json({ error: "Portfolio not found." }, { status: 404 });

  const [certificates, assessments, evidence] = await Promise.all([
    env.DB.prepare(
      `SELECT cert.code,cert.course_title AS courseTitle,
        cert.certificate_title AS title,cert.issued_at AS achievedAt,
        cert.expires_at AS expiresAt,s.name AS issuerName
       FROM portfolio_source_visibility psv
       JOIN certificates cert ON cert.code=psv.source_id AND cert.user_id=psv.user_id
       JOIN courses c ON c.id=cert.course_id
       JOIN schools s ON s.id=c.school_id
       WHERE psv.user_id=? AND psv.source_type='certificate' AND psv.visible=1
         AND cert.status='active' AND (cert.expires_at IS NULL OR cert.expires_at>?)
       ORDER BY cert.issued_at DESC`,
    ).bind(owner.userId, Date.now()).all(),
    env.DB.prepare(
      `SELECT q.id,q.title,l.title AS lessonTitle,c.title AS courseTitle,
        s.name AS issuerName,MAX(qa.submitted_at) AS achievedAt,
        CASE WHEN psv.show_score=1 THEN MAX(qa.score) ELSE NULL END AS score
       FROM portfolio_source_visibility psv
       JOIN quizzes q ON q.id=psv.source_id
       JOIN quiz_attempts qa ON qa.quiz_id=q.id AND qa.user_id=psv.user_id
       JOIN lessons l ON l.id=q.lesson_id
       JOIN courses c ON c.id=l.course_id
       JOIN schools s ON s.id=c.school_id
       WHERE psv.user_id=? AND psv.source_type='assessment' AND psv.visible=1
         AND qa.passed=1
       GROUP BY q.id,q.title,l.title,c.title,s.name,psv.show_score
       ORDER BY achievedAt DESC`,
    ).bind(owner.userId).all(),
    env.DB.prepare(
      `SELECT evidence_type AS evidenceType,title,description,skills,
        evidence_url AS evidenceUrl,achieved_at AS achievedAt
       FROM portfolio_evidence WHERE user_id=? AND visible=1
       ORDER BY sort_order,created_at DESC`,
    ).bind(owner.userId).all(),
  ]);
  return Response.json({
    portfolio,
    certificates: certificates.results,
    assessments: assessments.results,
    evidence: evidence.results,
    proofCount: certificates.results.length + assessments.results.length + evidence.results.length,
  }, { headers: { "cache-control": "no-store" } });
}
