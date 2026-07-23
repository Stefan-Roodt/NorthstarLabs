import { env } from "cloudflare:workers";
import { requireApiUser } from "../../../lib/server-auth";
import { isPlatformAdmin } from "../../../lib/platform-admin";
import {
  createCreatorSchool,
  ensureProfile,
  getActiveSchool,
  getUserSchools,
  switchActiveSchool,
} from "../../../lib/school-access";
import { ensureCoachDraft } from "../../../lib/tutors";

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
    isPlatformAdmin: await isPlatformAdmin(user),
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
    onboardingPath?: string;
    schoolName?: string;
    activeSchoolId?: string;
    createSchoolName?: string;
  };
  const profile = await ensureProfile(user);
  if (!profile) return Response.json({ error: "Profile unavailable." }, { status: 403 });

  if (body.createSchoolName !== undefined) {
    const schoolName = body.createSchoolName.trim();
    if (schoolName.length < 2 || schoolName.length > 80) {
      return Response.json(
        { error: "Academy name must be between 2 and 80 characters." },
        { status: 400 },
      );
    }
    await createCreatorSchool(user, schoolName, "creator", true);
  }

  if (body.onboardingPath !== undefined) {
    if (!["creator", "learner", "coach"].includes(body.onboardingPath)) {
      return Response.json({ error: "Choose a valid starting path." }, { status: 400 });
    }
    await env.DB.prepare(
      "UPDATE profiles SET onboarding_path=? WHERE id=?",
    ).bind(body.onboardingPath, user.id).run();
  }

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

  if (body.role === "creator" || body.role === "coach") {
    const schoolName = body.schoolName?.trim();
    if (schoolName && (schoolName.length < 2 || schoolName.length > 80)) {
      return Response.json(
        { error: "School name must be between 2 and 80 characters." },
        { status: 400 },
      );
    }
    const school = await createCreatorSchool(
      user,
      schoolName,
      body.role === "coach" ? "coach" : "creator",
    );
    if (body.role === "coach") {
      await ensureCoachDraft(env.DB, {
        schoolId: school.id,
        userId: user.id,
        displayName: profile.displayName,
        contactEmail: user.email,
      });
    }
  } else if (body.role === "learner") {
    await env.DB.prepare(
      `UPDATE profiles SET role=CASE WHEN role='creator' THEN role ELSE 'learner' END,
       onboarding_path='learner',
       onboarding_completed=1,onboarded_at=COALESCE(onboarded_at,?) WHERE id=?`,
    ).bind(Date.now(), user.id).run();
  }

  if (body.activeSchoolId) {
    const school = await switchActiveSchool(user.id, body.activeSchoolId);
    if (!school) {
      return Response.json({ error: "School access not found." }, { status: 404 });
    }
  }

  return Response.json({ saved: true, ...(await profileResponse(user)) });
}
