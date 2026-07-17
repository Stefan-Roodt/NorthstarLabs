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
      "SELECT code FROM certificates WHERE user_id=? AND course_id=?",
    ).bind(userId, courseId).first<{ code: string }>();

    certificateCode = existing?.code || `NSL-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    if (!existing) {
      await db.prepare(
        "INSERT INTO certificates (id,user_id,course_id,code,issued_at) VALUES (?,?,?,?,?)",
      ).bind(crypto.randomUUID(), userId, courseId, certificateCode, Date.now()).run();
    }
  }

  return { progress, certificateCode };
}
