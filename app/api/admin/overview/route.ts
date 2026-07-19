import { env } from "cloudflare:workers";
import { getSchoolReport } from "../../../../lib/reporting";
import { requireApiUser } from "../../../../lib/server-auth";
import { requestedSchoolId, requireCreatorSchool } from "../../../../lib/school-access";

function timestamp(value: string | null, fallback: number, endOfDay = false) {
  if (!value) return fallback;
  const parsed = Date.parse(`${value}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}Z`);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function csvCell(value: unknown) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

export async function GET(request: Request) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const school = await requireCreatorSchool(user, requestedSchoolId(request));
  if (!school) return Response.json({ error: "Creator access required" }, { status: 403 });

  const url = new URL(request.url);
  const now = Date.now();
  const from = timestamp(url.searchParams.get("from"), now - 29 * 86_400_000);
  const to = timestamp(url.searchParams.get("to"), now, true);
  if (to < from || to - from > 366 * 86_400_000) {
    return Response.json({ error: "Choose a reporting range of up to one year." }, { status: 400 });
  }
  const courseId = url.searchParams.get("courseId") || null;
  if (courseId) {
    const course = await env.DB.prepare(
      "SELECT id FROM courses WHERE id=? AND school_id=?",
    ).bind(courseId, school.id).first();
    if (!course) return Response.json({ error: "Course not found." }, { status: 404 });
  }

  const report = await getSchoolReport(env.DB, school.id, { from, to, courseId });
  if (url.searchParams.get("format") === "csv") {
    const rows = [
      ["Course", "Status", "Total enrolments", "Active learners", "Average progress", "Completions"],
      ...(report.courses as Array<Record<string, unknown>>).map((course) => [
        course.title,
        course.status,
        course.enrollments,
        course.activeLearners,
        `${course.averageProgress || 0}%`,
        course.completions,
      ]),
    ];
    return new Response(rows.map((row) => row.map(csvCell).join(",")).join("\n"), {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="${school.slug}-learning-report.csv"`,
      },
    });
  }
  return Response.json({ school, ...report });
}
