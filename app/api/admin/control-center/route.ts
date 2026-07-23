import { env } from "cloudflare:workers";
import { requireApiUser } from "../../../../lib/server-auth";
import {
  requestedSchoolId,
  requireCreatorSchool,
} from "../../../../lib/school-access";

type CountRow = Record<string, number | string | null>;

function number(value: unknown) {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function GET(request: Request) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const school = await requireCreatorSchool(user, requestedSchoolId(request));
  if (!school) return Response.json({ error: "Creator access required." }, { status: 403 });
  if (!["owner", "admin"].includes(school.memberRole)) {
    return Response.json(
      { error: "Academy owner or administrator access is required." },
      { status: 403 },
    );
  }

  const now = Date.now();
  const stalledBefore = now - 14 * 86_400_000;
  const recentBefore = now - 30 * 86_400_000;
  const [
    courseRow,
    learnerRow,
    invitationRow,
    liveRow,
    communicationRow,
    scheduleRow,
    integrationRow,
    teamRow,
    exportRow,
    questionRow,
    importRow,
  ] = await Promise.all([
    env.DB.prepare(
      `SELECT COUNT(DISTINCT c.id) AS courses,
        COUNT(DISTINCT CASE WHEN c.status='published' THEN c.id END) AS published,
        COUNT(DISTINCT CASE WHEN c.status='draft' THEN c.id END) AS drafts,
        COUNT(DISTINCT l.id) AS lessons,
        COUNT(DISTINCT q.id) AS quizzes,
        COUNT(DISTINCT CASE WHEN l.primary_asset_id IS NOT NULL
          OR l.lesson_type='interactive' THEN l.id END) AS richLessons,
        COUNT(DISTINCT CASE WHEN c.status<>'archived' AND
          (SELECT COUNT(*) FROM lessons child WHERE child.course_id=c.id)<6
          THEN c.id END) AS thinCourses
       FROM courses c
       LEFT JOIN lessons l ON l.course_id=c.id
       LEFT JOIN quizzes q ON q.lesson_id=l.id
       WHERE c.school_id=? AND c.status<>'archived'`,
    ).bind(school.id).first<CountRow>(),
    env.DB.prepare(
      `SELECT COUNT(DISTINCT CASE WHEN e.status='active' THEN e.user_id END) AS activeLearners,
        COUNT(CASE WHEN e.status='active' THEN 1 END) AS activeEnrollments,
        COALESCE(ROUND(AVG(CASE WHEN e.status='active' THEN e.progress END)),0) AS averageProgress,
        SUM(CASE WHEN e.status='active' AND e.progress<100
          AND COALESCE(e.last_activity_at,e.created_at)<? THEN 1 ELSE 0 END) AS stalled,
        SUM(CASE WHEN e.status='paused' THEN 1 ELSE 0 END) AS paused
       FROM enrollments e JOIN courses c ON c.id=e.course_id
       WHERE c.school_id=?`,
    ).bind(stalledBefore, school.id).first<CountRow>(),
    env.DB.prepare(
      `SELECT SUM(CASE WHEN status='pending' AND expires_at>? THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN status='pending' AND expires_at<=? THEN 1 ELSE 0 END) AS expired,
        SUM(CASE WHEN status='accepted' AND accepted_at>=? THEN 1 ELSE 0 END) AS acceptedRecently
       FROM invitations WHERE school_id=?`,
    ).bind(now, now, recentBefore, school.id).first<CountRow>(),
    env.DB.prepare(
      `SELECT SUM(CASE WHEN status='scheduled' AND starts_at>=? THEN 1 ELSE 0 END) AS upcoming,
        SUM(CASE WHEN status='scheduled' AND ends_at<? THEN 1 ELSE 0 END) AS overdue,
        SUM(CASE WHEN status='completed' AND starts_at>=? THEN 1 ELSE 0 END) AS completedRecently,
        (SELECT title FROM live_sessions WHERE school_id=? AND status='scheduled'
          AND starts_at>=? ORDER BY starts_at LIMIT 1) AS nextTitle,
        (SELECT starts_at FROM live_sessions WHERE school_id=? AND status='scheduled'
          AND starts_at>=? ORDER BY starts_at LIMIT 1) AS nextStartsAt
       FROM live_sessions WHERE school_id=?`,
    ).bind(
      now,
      now,
      recentBefore,
      school.id,
      now,
      school.id,
      now,
      school.id,
    ).first<CountRow>(),
    env.DB.prepare(
      `SELECT SUM(CASE WHEN status='sent' AND sent_at>=? THEN 1 ELSE 0 END) AS sentRecently,
        SUM(CASE WHEN status IN ('pending','retrying','scheduled') THEN 1 ELSE 0 END) AS queued,
        SUM(CASE WHEN status IN ('failed','configuration_required') THEN 1 ELSE 0 END) AS attention
       FROM email_messages WHERE school_id=?`,
    ).bind(recentBefore, school.id).first<CountRow>(),
    env.DB.prepare(
      `SELECT COUNT(*) AS activeSchedules,MAX(last_run_at) AS lastRunAt,
        MIN(next_run_at) AS nextRunAt
       FROM report_schedules WHERE school_id=? AND status='active'`,
    ).bind(school.id).first<CountRow>(),
    env.DB.prepare(
      `SELECT SUM(CASE WHEN status='active' THEN 1 ELSE 0 END) AS active,
        SUM(CASE WHEN status='active' AND last_delivery_status='failed' THEN 1 ELSE 0 END) AS attention,
        COUNT(DISTINCT CASE WHEN status='active' THEN provider END) AS providers
       FROM integrations WHERE school_id=?`,
    ).bind(school.id).first<CountRow>(),
    env.DB.prepare(
      `SELECT SUM(CASE WHEN role='owner' AND status='active' THEN 1 ELSE 0 END) AS owners,
        SUM(CASE WHEN role='admin' AND status='active' THEN 1 ELSE 0 END) AS admins,
        SUM(CASE WHEN role='instructor' AND status='active' THEN 1 ELSE 0 END) AS instructors
       FROM school_members WHERE school_id=?`,
    ).bind(school.id).first<CountRow>(),
    env.DB.prepare(
      `SELECT MAX(CASE WHEN status='completed' THEN completed_at END) AS latestCompletedAt,
        SUM(CASE WHEN status='failed' THEN 1 ELSE 0 END) AS failed
       FROM academy_exports WHERE school_id=?`,
    ).bind(school.id).first<CountRow>(),
    env.DB.prepare(
      `SELECT COUNT(*) AS open FROM lesson_help_requests
       WHERE school_id=? AND status='open'`,
    ).bind(school.id).first<CountRow>(),
    env.DB.prepare(
      `SELECT SUM(CASE WHEN status IN ('previewed','awaiting_files','importing','failed')
        THEN 1 ELSE 0 END) AS unfinished,
        SUM(CASE WHEN status='failed' THEN 1 ELSE 0 END) AS failed
       FROM course_import_projects WHERE school_id=?`,
    ).bind(school.id).first<CountRow>(),
  ]);

  const courses = {
    total: number(courseRow?.courses),
    published: number(courseRow?.published),
    drafts: number(courseRow?.drafts),
    lessons: number(courseRow?.lessons),
    quizzes: number(courseRow?.quizzes),
    richLessons: number(courseRow?.richLessons),
    thinCourses: number(courseRow?.thinCourses),
  };
  const learners = {
    active: number(learnerRow?.activeLearners),
    enrollments: number(learnerRow?.activeEnrollments),
    averageProgress: number(learnerRow?.averageProgress),
    stalled: number(learnerRow?.stalled),
    paused: number(learnerRow?.paused),
  };
  const invitations = {
    pending: number(invitationRow?.pending),
    expired: number(invitationRow?.expired),
    acceptedRecently: number(invitationRow?.acceptedRecently),
  };
  const live = {
    upcoming: number(liveRow?.upcoming),
    overdue: number(liveRow?.overdue),
    completedRecently: number(liveRow?.completedRecently),
    nextTitle: String(liveRow?.nextTitle || ""),
    nextStartsAt: liveRow?.nextStartsAt ? number(liveRow.nextStartsAt) : null,
  };
  const communications = {
    provider: "Resend",
    configured: Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM),
    sender: process.env.EMAIL_FROM || null,
    sentRecently: number(communicationRow?.sentRecently),
    queued: number(communicationRow?.queued),
    attention: number(communicationRow?.attention),
    scheduledReports: number(scheduleRow?.activeSchedules),
    lastReportAt: scheduleRow?.lastRunAt ? number(scheduleRow.lastRunAt) : null,
    nextReportAt: scheduleRow?.nextRunAt ? number(scheduleRow.nextRunAt) : null,
  };
  const integrations = {
    active: number(integrationRow?.active),
    providers: number(integrationRow?.providers),
    attention: number(integrationRow?.attention),
  };
  const team = {
    owners: number(teamRow?.owners),
    admins: number(teamRow?.admins),
    instructors: number(teamRow?.instructors),
  };
  const exports = {
    latestCompletedAt: exportRow?.latestCompletedAt ? number(exportRow.latestCompletedAt) : null,
    failed: number(exportRow?.failed),
  };
  const questions = { open: number(questionRow?.open) };
  const imports = {
    unfinished: number(importRow?.unfinished),
    failed: number(importRow?.failed),
  };
  const storefrontReady = Boolean(
    school.description.trim().length >= 40 &&
    school.supportEmail &&
    school.heroTitle &&
    school.heroDescription.trim().length >= 40 &&
    school.seoTitle &&
    school.seoDescription,
  );
  const exportFresh = Boolean(
    exports.latestCompletedAt && exports.latestCompletedAt >= recentBefore,
  );
  const readinessChecks = [
    { label: "Academy identity", ready: storefrontReady, href: "/dashboard/academy" },
    { label: "Published learning", ready: courses.published > 0, href: "/dashboard?area=courses" },
    { label: "Substantial curriculum", ready: courses.lessons >= 6, href: "/dashboard?area=courses" },
    { label: "Assessment coverage", ready: courses.quizzes > 0, href: "/dashboard?area=courses" },
    { label: "Learner support route", ready: learners.active > 0 || invitations.pending > 0, href: "/dashboard/learners" },
    { label: "Email delivery", ready: communications.configured, href: "/dashboard/operations" },
    { label: "Portable academy backup", ready: exportFresh, href: "/dashboard/exports" },
  ];
  const readiness = Math.round(
    (readinessChecks.filter((check) => check.ready).length / readinessChecks.length) * 100,
  );

  const actions: Array<{
    id: string;
    priority: "urgent" | "important" | "improve";
    title: string;
    detail: string;
    href: string;
    label: string;
  }> = [];
  const addAction = (
    id: string,
    priority: "urgent" | "important" | "improve",
    title: string,
    detail: string,
    href: string,
    label: string,
  ) => actions.push({ id, priority, title, detail, href, label });

  if (!storefrontReady) addAction(
    "storefront",
    "urgent",
    "Finish the academy identity",
    "Complete the learner promise, support address, storefront headline and search preview.",
    "/dashboard/academy",
    "Finish storefront",
  );
  if (!courses.total) addAction(
    "course",
    "urgent",
    "Create the first course",
    "There is no curriculum for learners to join yet.",
    "/dashboard?area=courses",
    "Create a course",
  );
  else if (!courses.published) addAction(
    "publish",
    "urgent",
    "No course is published",
    `${courses.drafts} draft ${courses.drafts === 1 ? "course is" : "courses are"} still invisible to learners.`,
    "/dashboard?area=courses",
    "Review drafts",
  );
  if (imports.failed) addAction(
    "imports",
    "urgent",
    "A course import needs attention",
    `${imports.failed} failed import ${imports.failed === 1 ? "is" : "are"} waiting for recovery.`,
    "/dashboard/import",
    "Resume imports",
  );
  if (live.overdue) addAction(
    "live",
    "urgent",
    "Close overdue live sessions",
    `${live.overdue} session ${live.overdue === 1 ? "has" : "have"} ended but is still marked scheduled.`,
    "/dashboard/live",
    "Update attendance",
  );
  if (communications.attention) addAction(
    "email",
    "urgent",
    "Resolve email delivery failures",
    `${communications.attention} message ${communications.attention === 1 ? "needs" : "need"} attention.`,
    "/dashboard/operations",
    "Open delivery log",
  );
  if (questions.open) addAction(
    "questions",
    "important",
    "Learners are waiting for help",
    `${questions.open} lesson ${questions.open === 1 ? "question is" : "questions are"} unanswered.`,
    "/dashboard/questions",
    "Answer learners",
  );
  if (learners.stalled) addAction(
    "learners",
    "important",
    "Re-engage stalled learners",
    `${learners.stalled} active ${learners.stalled === 1 ? "enrolment has" : "enrolments have"} had no activity for 14 days.`,
    "/dashboard/learners",
    "Review learners",
  );
  if (invitations.expired) addAction(
    "invitations",
    "important",
    "Renew expired invitations",
    `${invitations.expired} pending ${invitations.expired === 1 ? "invitation has" : "invitations have"} expired.`,
    "/dashboard/learners#invitations",
    "Manage invitations",
  );
  if (!communications.configured) addAction(
    "provider",
    "important",
    "Connect email delivery",
    "Invitations and reminders are queued safely, but cannot be delivered automatically yet.",
    "/dashboard/operations",
    "Review email setup",
  );
  if (integrations.attention) addAction(
    "connections",
    "important",
    "Repair an integration",
    `${integrations.attention} active ${integrations.attention === 1 ? "connection is" : "connections are"} reporting a failed delivery.`,
    "/dashboard/integrations",
    "Test connections",
  );
  if (!communications.scheduledReports) addAction(
    "reporting",
    "improve",
    "Schedule an academy summary",
    "Put learner progress and delivery health on a weekly or monthly rhythm.",
    "/dashboard/operations",
    "Schedule reporting",
  );
  if (!exportFresh) addAction(
    "export",
    "improve",
    "Prepare a current academy backup",
    exports.latestCompletedAt
      ? "The latest portable export is more than 30 days old."
      : "No complete portable academy export has been prepared.",
    "/dashboard/exports",
    "Prepare export",
  );

  return Response.json({
    generatedAt: now,
    school: {
      id: school.id,
      name: school.name,
      slug: school.slug,
      memberRole: school.memberRole,
    },
    readiness,
    readinessChecks,
    actions,
    courses,
    learners,
    invitations,
    live,
    communications,
    integrations,
    team,
    exports,
    questions,
    imports,
  });
}
