import { env } from "cloudflare:workers";

type CourseRow = {
  id: string;
  title: string;
  description: string;
  priceCents: number;
  creator: string;
  schoolId: string;
  schoolName: string;
  schoolSlug: string;
  certificateTitle: string;
  facultyHeadline: string | null;
  facultyBio: string | null;
  lessonCount: number;
  sectionCount: number;
  assessmentCount: number;
  playableVideoCount: number;
  resourceCount: number;
  durationMinutes: number;
};

type CurriculumRow = {
  sectionId: string | null;
  sectionTitle: string | null;
  sectionPosition: number | null;
  lessonId: string;
  lessonTitle: string;
  lessonType: string;
  lessonPosition: number;
  durationMinutes: number;
  hasVideo: number;
  hasAssessment: number;
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ courseId: string }> },
) {
  const { courseId } = await context.params;
  const course = await env.DB.prepare(
    `SELECT c.id,c.title,c.description,c.price_cents AS priceCents,
      COALESCE(p.display_name,s.name) AS creator,
      s.id AS schoolId,s.name AS schoolName,s.slug AS schoolSlug,
      c.certificate_title AS certificateTitle,
      t.headline AS facultyHeadline,t.bio AS facultyBio,
      (SELECT COUNT(*) FROM lessons l WHERE l.course_id=c.id) AS lessonCount,
      (SELECT COUNT(*) FROM course_sections cs WHERE cs.course_id=c.id) AS sectionCount,
      (SELECT COUNT(*) FROM quizzes q JOIN lessons l ON l.id=q.lesson_id
        WHERE l.course_id=c.id) AS assessmentCount,
      (SELECT COUNT(*) FROM lessons l JOIN media_assets ma ON ma.id=l.primary_asset_id
        WHERE l.course_id=c.id AND ma.kind='video') AS playableVideoCount,
      (SELECT COUNT(*) FROM lesson_resources lr JOIN lessons l ON l.id=lr.lesson_id
        WHERE l.course_id=c.id) AS resourceCount,
      (SELECT COALESCE(SUM(l.duration_minutes),0) FROM lessons l
        WHERE l.course_id=c.id) AS durationMinutes
     FROM courses c
     JOIN schools s ON s.id=c.school_id
     LEFT JOIN profiles p ON p.id=c.owner_id
     LEFT JOIN tutors t ON t.user_id=c.owner_id AND t.school_id=c.school_id
       AND t.status='published'
     WHERE c.id=? AND c.status='published'
     LIMIT 1`,
  ).bind(courseId).first<CourseRow>();

  if (!course) {
    return Response.json({ error: "Course not found." }, { status: 404 });
  }

  const rows = await env.DB.prepare(
    `SELECT cs.id AS sectionId,cs.title AS sectionTitle,cs.position AS sectionPosition,
      l.id AS lessonId,l.title AS lessonTitle,l.lesson_type AS lessonType,
      l.position AS lessonPosition,l.duration_minutes AS durationMinutes,
      CASE WHEN ma.kind='video' THEN 1 ELSE 0 END AS hasVideo,
      CASE WHEN q.id IS NOT NULL THEN 1 ELSE 0 END AS hasAssessment
     FROM lessons l
     LEFT JOIN course_sections cs ON cs.id=l.section_id
     LEFT JOIN media_assets ma ON ma.id=l.primary_asset_id
     LEFT JOIN quizzes q ON q.lesson_id=l.id
     WHERE l.course_id=?
     ORDER BY COALESCE(cs.position,0),l.position,l.id`,
  ).bind(courseId).all<CurriculumRow>();

  const sections = new Map<string, {
    id: string;
    title: string;
    position: number;
    lessons: Array<{
      id: string;
      title: string;
      type: string;
      durationMinutes: number;
      hasVideo: boolean;
      hasAssessment: boolean;
    }>;
  }>();

  for (const row of rows.results) {
    const sectionId = row.sectionId || `${course.id}-overview`;
    if (!sections.has(sectionId)) {
      sections.set(sectionId, {
        id: sectionId,
        title: row.sectionTitle || "Course overview",
        position: Number(row.sectionPosition || 0),
        lessons: [],
      });
    }
    sections.get(sectionId)!.lessons.push({
      id: row.lessonId,
      title: row.lessonTitle,
      type: row.lessonType,
      durationMinutes: Number(row.durationMinutes || 0),
      hasVideo: Boolean(row.hasVideo),
      hasAssessment: Boolean(row.hasAssessment),
    });
  }

  return Response.json({
    ...course,
    lessonCount: Number(course.lessonCount || 0),
    sectionCount: Number(course.sectionCount || 0),
    assessmentCount: Number(course.assessmentCount || 0),
    playableVideoCount: Number(course.playableVideoCount || 0),
    resourceCount: Number(course.resourceCount || 0),
    durationMinutes: Number(course.durationMinutes || 0),
    sections: [...sections.values()],
  });
}
