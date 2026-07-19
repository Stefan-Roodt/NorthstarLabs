export type LessonGate = {
  courseId: string;
  enrollmentId: string | null;
  isStaff: boolean;
  locked: boolean;
  lockReason: string | null;
  availableAt: number | null;
  requiredWatchPercent: number;
  watchedPercent: number;
};

type AccessRow = {
  courseId: string;
  enforceLessonOrder: number;
  courseAvailableFrom: number | null;
  sectionPosition: number;
  lessonPosition: number;
  availableAfterDays: number;
  requiredWatchPercent: number;
  enrollmentId: string | null;
  enrolledAt: number | null;
  staffId: string | null;
  watchedPercent: number;
};

export async function getLessonGate(
  db: D1Database,
  userId: string,
  lessonId: string,
  now = Date.now(),
): Promise<LessonGate | null> {
  const access = await db.prepare(
    `SELECT l.course_id AS courseId,
      c.enforce_lesson_order AS enforceLessonOrder,
      c.available_from AS courseAvailableFrom,
      COALESCE(cs.position,0) AS sectionPosition,
      l.position AS lessonPosition,
      l.available_after_days AS availableAfterDays,
      l.required_watch_percent AS requiredWatchPercent,
      e.id AS enrollmentId,e.created_at AS enrolledAt,sm.id AS staffId,
      COALESCE(lp.watched_percent,0) AS watchedPercent
     FROM lessons l
     JOIN courses c ON c.id=l.course_id
     LEFT JOIN course_sections cs ON cs.id=l.section_id
     LEFT JOIN enrollments e ON e.course_id=c.id AND e.user_id=? AND e.status='active'
     LEFT JOIN school_members sm ON sm.school_id=c.school_id AND sm.user_id=?
       AND sm.status='active' AND sm.role IN ('owner','admin','instructor')
     LEFT JOIN lesson_progress lp ON lp.lesson_id=l.id AND lp.user_id=?
     WHERE l.id=? AND (e.id IS NOT NULL OR sm.id IS NOT NULL)`,
  ).bind(userId, userId, userId, lessonId).first<AccessRow>();
  if (!access) return null;

  const isStaff = Boolean(access.staffId);
  const courseAvailableAt = access.courseAvailableFrom
    ? Number(access.courseAvailableFrom)
    : null;
  const dripAvailableAt = access.enrolledAt && Number(access.availableAfterDays) > 0
    ? Number(access.enrolledAt) + Number(access.availableAfterDays) * 86_400_000
    : null;
  const availableAt = Math.max(courseAvailableAt || 0, dripAvailableAt || 0) || null;

  if (!isStaff && availableAt && availableAt > now) {
    return {
      courseId: access.courseId,
      enrollmentId: access.enrollmentId,
      isStaff,
      locked: true,
      lockReason: `Available ${new Date(availableAt).toLocaleDateString("en-ZA")}`,
      availableAt,
      requiredWatchPercent: Number(access.requiredWatchPercent || 0),
      watchedPercent: Number(access.watchedPercent || 0),
    };
  }

  if (!isStaff && access.enforceLessonOrder) {
    const previous = await db.prepare(
      `SELECT COUNT(*) AS incomplete
       FROM lessons earlier
       LEFT JOIN course_sections earlier_section ON earlier_section.id=earlier.section_id
       LEFT JOIN lesson_progress earlier_progress
         ON earlier_progress.lesson_id=earlier.id AND earlier_progress.user_id=?
       WHERE earlier.course_id=?
         AND (
           COALESCE(earlier_section.position,0) < ?
           OR (
             COALESCE(earlier_section.position,0)=?
             AND (
               earlier.position < ?
               OR (earlier.position=? AND earlier.id < ?)
             )
           )
         )
         AND COALESCE(earlier_progress.completed,0)=0`,
    ).bind(
      userId,
      access.courseId,
      access.sectionPosition,
      access.sectionPosition,
      access.lessonPosition,
      access.lessonPosition,
      lessonId,
    ).first<{ incomplete: number }>();
    if (Number(previous?.incomplete || 0) > 0) {
      return {
        courseId: access.courseId,
        enrollmentId: access.enrollmentId,
        isStaff,
        locked: true,
        lockReason: "Complete the earlier lessons first",
        availableAt,
        requiredWatchPercent: Number(access.requiredWatchPercent || 0),
        watchedPercent: Number(access.watchedPercent || 0),
      };
    }
  }

  return {
    courseId: access.courseId,
    enrollmentId: access.enrollmentId,
    isStaff,
    locked: false,
    lockReason: null,
    availableAt,
    requiredWatchPercent: Number(access.requiredWatchPercent || 0),
    watchedPercent: Number(access.watchedPercent || 0),
  };
}
