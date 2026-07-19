type ProgressResult = {
  progress: number;
  certificateCode: string | null;
};

export async function updateCourseProgress(
  db: D1Database,
  userId: string,
  courseId: string,
): Promise<ProgressResult> {
  const counts = await db.prepare(
    `SELECT COUNT(l.id) AS total,
      SUM(CASE WHEN lp.completed=1 THEN 1 ELSE 0 END) AS done
     FROM lessons l
     LEFT JOIN lesson_progress lp ON lp.lesson_id=l.id AND lp.user_id=?
     WHERE l.course_id=?`,
  ).bind(userId, courseId).first<{ total: number; done: number }>();

  const total = Number(counts?.total || 0);
  const done = Number(counts?.done || 0);
  const progress = total ? Math.round((done / total) * 100) : 0;

  await db.prepare(
    "UPDATE enrollments SET progress=?,last_activity_at=? WHERE user_id=? AND course_id=?",
  ).bind(progress, Date.now(), userId, courseId).run();

  let certificateCode: string | null = null;
  if (progress === 100 && total > 0) {
    const existing = await db.prepare(
      `SELECT code,status FROM certificates
       WHERE user_id=? AND course_id=? ORDER BY issued_at DESC LIMIT 1`,
    ).bind(userId, courseId).first<{ code: string; status: string }>();

    certificateCode = existing?.status === "active" ? existing.code : null;
    if (!existing) {
      const details = await db.prepare(
        `SELECT c.title AS courseTitle,c.certificate_title AS certificateTitle,
          c.certificate_accent AS certificateAccent,
          c.certificate_valid_days AS certificateValidDays,
          COALESCE(p.display_name,'NorthStarLabs learner') AS recipientName
         FROM courses c LEFT JOIN profiles p ON p.id=? WHERE c.id=?`,
      ).bind(userId, courseId).first<{
        courseTitle: string;
        certificateTitle: string;
        certificateAccent: string;
        certificateValidDays: number;
        recipientName: string;
      }>();
      const issuedAt = Date.now();
      const validDays = Math.max(0, Number(details?.certificateValidDays || 0));
      const expiresAt = validDays ? issuedAt + validDays * 86_400_000 : null;
      certificateCode = `NSL-${crypto.randomUUID().replaceAll("-", "").slice(0, 12).toUpperCase()}`;
      await db.prepare(
        `INSERT INTO certificates
          (id,user_id,course_id,code,issued_at,recipient_name,course_title,
           certificate_title,accent_color,status,expires_at)
         VALUES (?,?,?,?,?,?,?,?,?,'active',?)`,
      ).bind(
        crypto.randomUUID(),
        userId,
        courseId,
        certificateCode,
        issuedAt,
        details?.recipientName || "NorthStarLabs learner",
        details?.courseTitle || "NorthStarLabs course",
        details?.certificateTitle || "Certificate of Completion",
        details?.certificateAccent || "#3556d8",
        expiresAt,
      ).run();
    }
  }

  return { progress, certificateCode };
}
