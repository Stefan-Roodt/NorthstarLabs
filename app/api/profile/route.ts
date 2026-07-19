import { env } from "cloudflare:workers";
import { requireApiUser } from "../../../lib/server-auth";
import {
  createCreatorSchool,
  ensureProfile,
  getActiveSchool,
  getUserSchools,
  switchActiveSchool,
} from "../../../lib/school-access";

async function profileResponse(user: NonNullable<Awaited<ReturnType<typeof requireApiUser>>>) {
  const profile = await ensureProfile(user);
  const activeSchool = await getActiveSchool(user.id);
  const schools = await getUserSchools(user.id);
  return {
    ...profile,
    activeSchool,
    schools,
    hasCreatorSchool: schools.some((school) =>
      ["owner", "admin", "instructor"].includes(school.memberRole)
    ),
  };
}

export async function GET(request: Request) {
  const user = await requireApiUser(request);
  if (!user?.email) return Response.json({ error: "Unauthorized" }, { status: 401 });
  return Response.json(await profileResponse(user));
}

export async function PATCH(request: Request) {
  const user = await requireApiUser(request);
  if (!user?.email) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json() as {
    displayName?: string;
    role?: string;
    schoolName?: string;
    activeSchoolId?: string;
  };
  await ensureProfile(user);

  if (body.displayName !== undefined) {
    const cleanName = body.displayName.trim();
    if (cleanName.length < 2 || cleanName.length > 80) {
      return Response.json(
        { error: "Display name must be between 2 and 80 characters." },
        { status: 400 },
      );
    }
    await env.DB.prepare(
      "UPDATE profiles SET email=?,display_name=? WHERE id=?",
    ).bind(user.email, cleanName, user.id).run();
  }

  if (body.role === "creator") {
    const schoolName = body.schoolName?.trim();
    if (schoolName && (schoolName.length < 2 || schoolName.length > 80)) {
      return Response.json(
        { error: "School name must be between 2 and 80 characters." },
        { status: 400 },
      );
    }
    await createCreatorSchool(user, schoolName);
  } else if (body.role === "learner") {
    await env.DB.prepare(
      "UPDATE profiles SET role='learner' WHERE id=?",
    ).bind(user.id).run();
  }

  if (body.activeSchoolId) {
    const school = await switchActiveSchool(user.id, body.activeSchoolId);
    if (!school) {
      return Response.json({ error: "School access not found." }, { status: 404 });
    }
  }

  return Response.json({ saved: true, ...(await profileResponse(user)) });
}
