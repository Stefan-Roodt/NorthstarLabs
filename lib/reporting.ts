export type ReportWindow = {
  from: number;
  to: number;
  courseId?: string | null;
};

export async function getSchoolReport(
  db: D1Database,
  schoolId: string,
  window: ReportWindow,
) {
  const courseId = window.courseId || null;
  const summary = await db.prepare(
    `SELECT COUNT(DISTINCT c.id) AS courses,
      COUNT(e.id) AS enrollments,
      SUM(CASE WHEN e.status='active' THEN 1 ELSE 0 END) AS activeEnrollments,
      COUNT(DISTINCT CASE WHEN e.status='active' THEN e.user_id END) AS activeLearners,
      COALESCE(ROUND(AVG(CASE WHEN e.status='active' THEN e.progress END)),0) AS averageProgress,
      SUM(CASE WHEN e.progress>=100 AND e.status='active' THEN 1 ELSE 0 END) AS completions
     FROM courses c
     LEFT JOIN enrollments e ON e.course_id=c.id
     WHERE c.school_id=? AND (? IS NULL OR c.id=?)`,
  ).bind(schoolId, courseId, courseId).first();

  const courses = await db.prepare(
    `SELECT c.id,c.title,c.status,
      COUNT(e.id) AS enrollments,
      SUM(CASE WHEN e.status='active' THEN 1 ELSE 0 END) AS activeLearners,
      COALESCE(ROUND(AVG(CASE WHEN e.status='active' THEN e.progress END)),0) AS averageProgress,
      SUM(CASE WHEN e.progress>=100 AND e.status='active' THEN 1 ELSE 0 END) AS completions
     FROM courses c
     LEFT JOIN enrollments e ON e.course_id=c.id
     WHERE c.school_id=? AND (? IS NULL OR c.id=?)
     GROUP BY c.id
     ORDER BY activeLearners DESC,c.updated_at DESC`,
  ).bind(schoolId, courseId, courseId).all();

  const trend = await db.prepare(
    `SELECT strftime('%Y-%m-%d',e.created_at/1000,'unixepoch') AS day,
      COUNT(*) AS enrollments
     FROM enrollments e JOIN courses c ON c.id=e.course_id
     WHERE c.school_id=? AND e.created_at BETWEEN ? AND ?
       AND (? IS NULL OR c.id=?)
     GROUP BY day ORDER BY day`,
  ).bind(schoolId, window.from, window.to, courseId, courseId).all();

  const assessments = await db.prepare(
    `SELECT COUNT(qa.id) AS attempts,
      COALESCE(ROUND(AVG(qa.score)),0) AS averageScore,
      SUM(CASE WHEN qa.passed=1 THEN 1 ELSE 0 END) AS passedAttempts,
      COUNT(DISTINCT qa.user_id) AS learnersAssessed
     FROM quiz_attempts qa
     JOIN quizzes q ON q.id=qa.quiz_id
     JOIN lessons l ON l.id=q.lesson_id
     JOIN courses c ON c.id=l.course_id
     WHERE c.school_id=? AND qa.submitted_at BETWEEN ? AND ?
       AND (? IS NULL OR c.id=?)`,
  ).bind(schoolId, window.from, window.to, courseId, courseId).first();

  const certificates = await db.prepare(
    `SELECT COUNT(cert.id) AS issued,
      SUM(CASE WHEN cert.status='active' THEN 1 ELSE 0 END) AS active,
      SUM(CASE WHEN cert.status='revoked' THEN 1 ELSE 0 END) AS revoked
     FROM certificates cert JOIN courses c ON c.id=cert.course_id
     WHERE c.school_id=? AND cert.issued_at BETWEEN ? AND ?
       AND (? IS NULL OR c.id=?)`,
  ).bind(schoolId, window.from, window.to, courseId, courseId).first();

  const community = await db.prepare(
    `SELECT COUNT(p.id) AS posts,COUNT(DISTINCT p.author_id) AS contributors
     FROM posts p JOIN communities cm ON cm.id=p.community_id
     WHERE cm.school_id=? AND p.status='visible' AND p.created_at BETWEEN ? AND ?`,
  ).bind(schoolId, window.from, window.to).first();

  const email = await db.prepare(
    `SELECT COUNT(*) AS total,
      SUM(CASE WHEN status='sent' THEN 1 ELSE 0 END) AS sent,
      SUM(CASE WHEN status IN ('failed','configuration_required') THEN 1 ELSE 0 END) AS needsAttention,
      SUM(CASE WHEN status IN ('pending','retrying') THEN 1 ELSE 0 END) AS queued
     FROM email_messages WHERE school_id=? AND created_at BETWEEN ? AND ?`,
  ).bind(schoolId, window.from, window.to).first();

  const recentEnrollments = await db.prepare(
    `SELECT 'enrollment' AS type,e.created_at AS occurredAt,c.title AS courseTitle,
      COALESCE(p.display_name,p.email,'Learner') AS learnerName
     FROM enrollments e
     JOIN courses c ON c.id=e.course_id
     LEFT JOIN profiles p ON p.id=e.user_id
     WHERE c.school_id=? AND e.created_at BETWEEN ? AND ?
       AND (? IS NULL OR c.id=?)
     ORDER BY e.created_at DESC LIMIT 12`,
  ).bind(schoolId, window.from, window.to, courseId, courseId).all();

  const recentCompletions = await db.prepare(
    `SELECT 'completion' AS type,cert.issued_at AS occurredAt,c.title AS courseTitle,
      COALESCE(p.display_name,p.email,'Learner') AS learnerName
     FROM certificates cert
     JOIN courses c ON c.id=cert.course_id
     LEFT JOIN profiles p ON p.id=cert.user_id
     WHERE c.school_id=? AND cert.issued_at BETWEEN ? AND ?
       AND (? IS NULL OR c.id=?)
     ORDER BY cert.issued_at DESC LIMIT 12`,
  ).bind(schoolId, window.from, window.to, courseId, courseId).all();

  const activity = [...recentEnrollments.results, ...recentCompletions.results]
    .sort((a, b) => Number(b.occurredAt) - Number(a.occurredAt))
    .slice(0, 16);

  return {
    window,
    summary,
    courses: courses.results,
    trend: trend.results,
    assessments,
    certificates,
    community,
    email,
    activity,
  };
}
