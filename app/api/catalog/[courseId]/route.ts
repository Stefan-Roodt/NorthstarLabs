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
  truthOutcome: string;
  truthAudience: string;
  truthNotFor: string;
  truthPrerequisites: string;
  truthEvidence: string;
  truthSourceStandard: string;
  truthLevel: string;
  truthDelivery: string;
  truthReviewedAt: number | null;
  updatedAt: number;
  previewCount: number;
  transcriptCount: number;
  accessibleLessonTextCount: number;
  captionedVideoCount: number;
  minimumPassingScore: number | null;
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
  isPreview: number;
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ courseId: string }> },
) {
  const { courseId } = await context.params;
  const course = await env.DB.prepare(
    `SELECT c.id,c.title,c.description,c.price_cents AS priceCents,
      c.truth_outcome AS truthOutcome,c.truth_audience AS truthAudience,
      c.truth_not_for AS truthNotFor,c.truth_prerequisites AS truthPrerequisites,
      c.truth_evidence AS truthEvidence,c.truth_source_standard AS truthSourceStandard,
      c.truth_level AS truthLevel,c.truth_delivery AS truthDelivery,
      c.truth_reviewed_at AS truthReviewedAt,c.updated_at AS updatedAt,
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
        WHERE l.course_id=c.id) AS durationMinutes,
      (SELECT COUNT(*) FROM lessons l WHERE l.course_id=c.id AND l.is_preview=1) AS previewCount,
      (SELECT COUNT(*) FROM lessons l WHERE l.course_id=c.id AND length(trim(l.transcript))>=40) AS transcriptCount,
      (SELECT COUNT(*) FROM lessons l WHERE l.course_id=c.id
        AND (length(trim(l.content))>=40 OR length(trim(l.transcript))>=40)) AS accessibleLessonTextCount,
      (SELECT COUNT(*) FROM lessons l JOIN media_assets ma ON ma.id=l.primary_asset_id
        WHERE l.course_id=c.id AND ma.kind='video' AND length(trim(l.transcript))>=40) AS captionedVideoCount,
      (SELECT MIN(q.passing_score) FROM quizzes q JOIN lessons l ON l.id=q.lesson_id
        WHERE l.course_id=c.id) AS minimumPassingScore
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
      CASE WHEN q.id IS NOT NULL THEN 1 ELSE 0 END AS hasAssessment,
      l.is_preview AS isPreview
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
      isPreview: boolean;
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
      isPreview: Boolean(row.isPreview),
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
    previewCount: Number(course.previewCount || 0),
    transcriptCount: Number(course.transcriptCount || 0),
    accessibleLessonTextCount: Number(course.accessibleLessonTextCount || 0),
    captionedVideoCount: Number(course.captionedVideoCount || 0),
    minimumPassingScore: course.minimumPassingScore === null ? null : Number(course.minimumPassingScore),
    sections: [...sections.values()],
  });
}
