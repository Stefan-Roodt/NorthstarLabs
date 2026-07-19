import { env } from "cloudflare:workers";
import { requireApiUser } from "../../../../lib/server-auth";
import { requestedSchoolId, requireCreatorSchool } from "../../../../lib/school-access";

export async function GET(request: Request) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const school = await requireCreatorSchool(user, requestedSchoolId(request));
  if (!school) return Response.json({ error: "Creator access required" }, { status: 403 });

  const summary = await env.DB.prepare(
    `SELECT COUNT(DISTINCT c.id) AS courses,
      COUNT(e.id) AS enrollments,
      SUM(CASE WHEN e.status='active' THEN 1 ELSE 0 END) AS activeEnrollments,
      COUNT(DISTINCT CASE WHEN e.status='active' THEN e.user_id END) AS activeLearners,
      COALESCE(ROUND(AVG(CASE WHEN e.status='active' THEN e.progress END)),0) AS averageProgress,
      SUM(CASE WHEN e.progress>=100 AND e.status='active' THEN 1 ELSE 0 END) AS completions
     FROM courses c
     LEFT JOIN enrollments e ON e.course_id=c.id
     WHERE c.school_id=?`,
  ).bind(school.id).first();

  const courses = await env.DB.prepare(
    `SELECT c.id,c.title,c.status,
      COUNT(e.id) AS enrollments,
      SUM(CASE WHEN e.status='active' THEN 1 ELSE 0 END) AS activeLearners,
      COALESCE(ROUND(AVG(CASE WHEN e.status='active' THEN e.progress END)),0) AS averageProgress,
      SUM(CASE WHEN e.progress>=100 AND e.status='active' THEN 1 ELSE 0 END) AS completions
     FROM courses c
     LEFT JOIN enrollments e ON e.course_id=c.id
     WHERE c.school_id=?
     GROUP BY c.id
     ORDER BY activeLearners DESC,c.updated_at DESC`,
  ).bind(school.id).all();

  const since = Date.now() - 13 * 24 * 60 * 60 * 1000;
  const trend = await env.DB.prepare(
    `SELECT strftime('%Y-%m-%d',e.created_at/1000,'unixepoch') AS day,
      COUNT(*) AS enrollments
     FROM enrollments e JOIN courses c ON c.id=e.course_id
     WHERE c.school_id=? AND e.created_at>=?
     GROUP BY day ORDER BY day`,
  ).bind(school.id, since).all();

  const recentEnrollments = await env.DB.prepare(
    `SELECT 'enrollment' AS type,e.created_at AS occurredAt,c.title AS courseTitle,
      COALESCE(p.display_name,p.email,'Learner') AS learnerName
     FROM enrollments e
     JOIN courses c ON c.id=e.course_id
     LEFT JOIN profiles p ON p.id=e.user_id
     WHERE c.school_id=?
     ORDER BY e.created_at DESC LIMIT 10`,
  ).bind(school.id).all();

  const recentCompletions = await env.DB.prepare(
    `SELECT 'completion' AS type,cert.issued_at AS occurredAt,c.title AS courseTitle,
      COALESCE(p.display_name,p.email,'Learner') AS learnerName
     FROM certificates cert
     JOIN courses c ON c.id=cert.course_id
     LEFT JOIN profiles p ON p.id=cert.user_id
     WHERE c.school_id=?
     ORDER BY cert.issued_at DESC LIMIT 10`,
  ).bind(school.id).all();

  const activity = [...recentEnrollments.results, ...recentCompletions.results]
    .sort((a, b) => Number(b.occurredAt) - Number(a.occurredAt))
    .slice(0, 12);

  return Response.json({
    school,
    summary,
    courses: courses.results,
    trend: trend.results,
    activity,
  });
}
