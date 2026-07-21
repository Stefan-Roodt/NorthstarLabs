import { createClient } from "@supabase/supabase-js";
import { env } from "cloudflare:workers";
import { writeAuditLog } from "../../../../lib/audit-log";
import { sha256Hex } from "../../../../lib/security";
import { requireApiUser } from "../../../../lib/server-auth";
import { recordSystemEvent, safeErrorMessage } from "../../../../lib/system-monitor";

async function accountExport(userId: string) {
  const [profile, schools, enrollments, progress, attempts, masteryConcepts, masteryPractice, certificates, posts, preferences, products, live, portfolio, portfolioSources, portfolioEvidence] =
    await Promise.all([
      env.DB.prepare(
        `SELECT id,email,display_name AS displayName,role,onboarding_path AS onboardingPath,
          onboarding_completed AS onboardingCompleted,onboarded_at AS onboardedAt,
          active_school_id AS activeSchoolId,status,created_at AS createdAt
         FROM profiles WHERE id=?`,
      ).bind(userId).first(),
      env.DB.prepare(
        `SELECT s.id,s.name,s.slug,sm.role,sm.status,sm.joined_at AS joinedAt
         FROM school_members sm JOIN schools s ON s.id=sm.school_id
         WHERE sm.user_id=? ORDER BY s.name`,
      ).bind(userId).all(),
      env.DB.prepare(
        `SELECT e.id,e.course_id AS courseId,c.title AS courseTitle,
          e.progress,e.status,e.last_activity_at AS lastActivityAt,
          e.created_at AS createdAt
         FROM enrollments e JOIN courses c ON c.id=e.course_id
         WHERE e.user_id=? ORDER BY e.created_at DESC`,
      ).bind(userId).all(),
      env.DB.prepare(
        `SELECT lp.lesson_id AS lessonId,l.title AS lessonTitle,
          lp.completed,lp.watched_percent AS watchedPercent,lp.notes,
          lp.bookmarked,lp.updated_at AS updatedAt
         FROM lesson_progress lp JOIN lessons l ON l.id=lp.lesson_id
         WHERE lp.user_id=? ORDER BY lp.updated_at DESC`,
      ).bind(userId).all(),
      env.DB.prepare(
        `SELECT qa.id,qa.quiz_id AS quizId,q.title,qa.attempt_number AS attemptNumber,
          qa.answers_json AS answersJson,qa.score,qa.passed,
          qa.submitted_at AS submittedAt
         FROM quiz_attempts qa JOIN quizzes q ON q.id=qa.quiz_id
         WHERE qa.user_id=? ORDER BY qa.submitted_at DESC`,
      ).bind(userId).all(),
      env.DB.prepare(
        `SELECT m.question_id AS questionId,m.course_id AS courseId,c.title AS courseTitle,
          m.lesson_id AS lessonId,l.title AS lessonTitle,m.concept_label AS conceptLabel,
          m.status,m.wrong_count AS wrongCount,m.correct_streak AS correctStreak,
          m.first_seen_at AS firstSeenAt,m.last_reviewed_at AS lastReviewedAt,
          m.next_review_at AS nextReviewAt,m.mastered_at AS masteredAt,m.updated_at AS updatedAt
         FROM learner_concept_mastery m
         JOIN courses c ON c.id=m.course_id JOIN lessons l ON l.id=m.lesson_id
         WHERE m.user_id=? ORDER BY m.updated_at DESC`,
      ).bind(userId).all(),
      env.DB.prepare(
        `SELECT question_id AS questionId,selected_index AS selectedIndex,correct,
          answered_at AS answeredAt
         FROM mastery_practice_attempts WHERE user_id=? ORDER BY answered_at DESC`,
      ).bind(userId).all(),
      env.DB.prepare(
        `SELECT code,course_title AS courseTitle,certificate_title AS certificateTitle,
          status,issued_at AS issuedAt,expires_at AS expiresAt,revoked_at AS revokedAt
         FROM certificates WHERE user_id=? ORDER BY issued_at DESC`,
      ).bind(userId).all(),
      env.DB.prepare(
        `SELECT p.id,p.body,p.status,p.created_at AS createdAt,c.name AS communityName
         FROM posts p JOIN communities c ON c.id=p.community_id
         WHERE p.author_id=? ORDER BY p.created_at DESC`,
      ).bind(userId).all(),
      env.DB.prepare(
        `SELECT enrollment_emails AS enrollmentEmails,
          completion_emails AS completionEmails,community_emails AS communityEmails,
          live_session_reminders AS liveSessionReminders,
          creator_summaries AS creatorSummaries,product_updates AS productUpdates,
          updated_at AS updatedAt
         FROM notification_preferences WHERE user_id=?`,
      ).bind(userId).first(),
      env.DB.prepare(
        `SELECT pe.id,p.name AS productName,p.product_type AS productType,
          pe.source,pe.status,pe.starts_at AS startsAt,pe.expires_at AS expiresAt,
          pe.created_at AS createdAt
         FROM product_entitlements pe JOIN products p ON p.id=pe.product_id
         WHERE pe.user_id=? ORDER BY pe.created_at DESC`,
      ).bind(userId).all(),
      env.DB.prepare(
        `SELECT la.status,la.registered_at AS registeredAt,
          la.attended_at AS attendedAt,la.attendance_minutes AS attendanceMinutes,
          ls.title,ls.starts_at AS startsAt,ls.ends_at AS endsAt
         FROM live_attendance la JOIN live_sessions ls ON ls.id=la.session_id
         WHERE la.user_id=? ORDER BY ls.starts_at DESC`,
      ).bind(userId).all(),
      env.DB.prepare(
        `SELECT slug,headline,bio,visibility,created_at AS createdAt,updated_at AS updatedAt
         FROM learning_portfolios WHERE user_id=?`,
      ).bind(userId).first(),
      env.DB.prepare(
        `SELECT source_type AS sourceType,source_id AS sourceId,visible,
          show_score AS showScore,created_at AS createdAt,updated_at AS updatedAt
         FROM portfolio_source_visibility WHERE user_id=? ORDER BY updated_at DESC`,
      ).bind(userId).all(),
      env.DB.prepare(
        `SELECT id,course_id AS courseId,evidence_type AS evidenceType,title,
          description,skills,evidence_url AS evidenceUrl,achieved_at AS achievedAt,
          visible,sort_order AS sortOrder,created_at AS createdAt,updated_at AS updatedAt
         FROM portfolio_evidence WHERE user_id=? ORDER BY sort_order,created_at DESC`,
      ).bind(userId).all(),
    ]);
  return {
    format: "northstarlabs-personal-data-export",
    schemaVersion: 1,
    exportedAt: Date.now(),
    profile,
    schools: schools.results,
    enrollments: enrollments.results,
    lessonProgress: progress.results,
    quizAttempts: attempts.results,
    masteryConcepts: masteryConcepts.results,
    masteryPracticeAttempts: masteryPractice.results,
    certificates: certificates.results,
    communityPosts: posts.results,
    notificationPreferences: preferences,
    productEntitlements: products.results,
    liveAttendance: live.results,
    learningPortfolio: portfolio,
    portfolioSourceChoices: portfolioSources.results,
    portfolioEvidence: portfolioEvidence.results,
  };
}

export async function GET(request: Request) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const payload = await accountExport(user.id);
  await writeAuditLog({
    actorId: user.id,
    action: "account.data_export",
    targetType: "profile",
    targetId: user.id,
  });
  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": `attachment; filename="northstarlabs-data-${
        new Date().toISOString().slice(0, 10)
      }.json"`,
      "cache-control": "private, no-store",
    },
  });
}

export async function DELETE(request: Request) {
  const user = await requireApiUser(request);
  if (!user?.email) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null) as { confirmation?: string } | null;
  if (body?.confirmation !== "DELETE") {
    return Response.json(
      { error: "Type DELETE to confirm the account-removal request." },
      { status: 400 },
    );
  }
  const ownedSchool = await env.DB.prepare(
    "SELECT id,name FROM schools WHERE owner_id=? AND status='active' LIMIT 1",
  ).bind(user.id).first<{ id: string; name: string }>();
  if (ownedSchool) {
    return Response.json({
      error: `Transfer or close ${ownedSchool.name} before deleting its owner account.`,
      ownedSchoolId: ownedSchool.id,
    }, { status: 409 });
  }

  const requestId = crypto.randomUUID();
  const now = Date.now();
  await env.DB.prepare(
    `INSERT INTO data_requests
      (id,user_id,request_type,status,created_at)
     VALUES (?,?,?,'pending',?)`,
  ).bind(requestId, user.id, "delete", now).run();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!supabaseUrl || !serviceRoleKey) {
    await env.DB.prepare(
      "UPDATE data_requests SET failure_message=? WHERE id=?",
    ).bind(
      "Supabase service-role access is required to complete identity removal.",
      requestId,
    ).run();
    return Response.json({
      accepted: true,
      status: "pending",
      requestId,
      message: "Your deletion request is recorded for administrator completion.",
    }, { status: 202 });
  }

  const emailHash = (await sha256Hex(user.email.toLowerCase())).slice(0, 20);
  const redactedEmail = `deleted+${emailHash}@invalid.local`;
  await env.DB.prepare(
    "UPDATE data_requests SET status='processing' WHERE id=?",
  ).bind(requestId).run();
  try {
    await env.DB.batch([
      env.DB.prepare(
        "DELETE FROM mastery_practice_attempts WHERE user_id=?",
      ).bind(user.id),
      env.DB.prepare(
        "DELETE FROM learner_concept_mastery WHERE user_id=?",
      ).bind(user.id),
      env.DB.prepare(
        "DELETE FROM portfolio_source_visibility WHERE user_id=?",
      ).bind(user.id),
      env.DB.prepare(
        "DELETE FROM portfolio_evidence WHERE user_id=?",
      ).bind(user.id),
      env.DB.prepare(
        "DELETE FROM learning_portfolios WHERE user_id=?",
      ).bind(user.id),
      env.DB.prepare(
        "DELETE FROM lesson_progress WHERE user_id=?",
      ).bind(user.id),
      env.DB.prepare(
        "DELETE FROM quiz_attempts WHERE user_id=?",
      ).bind(user.id),
      env.DB.prepare(
        "DELETE FROM certificates WHERE user_id=?",
      ).bind(user.id),
      env.DB.prepare(
        "DELETE FROM enrollments WHERE user_id=?",
      ).bind(user.id),
      env.DB.prepare(
        "DELETE FROM product_entitlements WHERE user_id=?",
      ).bind(user.id),
      env.DB.prepare(
        "DELETE FROM live_attendance WHERE user_id=?",
      ).bind(user.id),
      env.DB.prepare(
        "DELETE FROM community_members WHERE user_id=?",
      ).bind(user.id),
      env.DB.prepare(
        "DELETE FROM school_members WHERE user_id=?",
      ).bind(user.id),
      env.DB.prepare(
        "UPDATE posts SET author_id='deleted-user' WHERE author_id=?",
      ).bind(user.id),
      env.DB.prepare(
        "UPDATE content_reports SET reporter_id='deleted-user' WHERE reporter_id=?",
      ).bind(user.id),
      env.DB.prepare(
        "DELETE FROM notification_preferences WHERE user_id=?",
      ).bind(user.id),
      env.DB.prepare(
        "DELETE FROM memberships WHERE user_id=?",
      ).bind(user.id),
      env.DB.prepare(
        "DELETE FROM report_schedules WHERE created_by=?",
      ).bind(user.id),
      env.DB.prepare(
        "UPDATE product_entitlements SET granted_by=NULL WHERE granted_by=?",
      ).bind(user.id),
      env.DB.prepare(
        `UPDATE products SET owner_id=(
          SELECT owner_id FROM schools WHERE schools.id=products.school_id
        ) WHERE owner_id=?`,
      ).bind(user.id),
      env.DB.prepare(
        "UPDATE live_sessions SET host_id='deleted-user' WHERE host_id=?",
      ).bind(user.id),
      env.DB.prepare(
        "UPDATE integrations SET created_by='deleted-user' WHERE created_by=?",
      ).bind(user.id),
      env.DB.prepare(
        "UPDATE course_import_projects SET created_by='deleted-user' WHERE created_by=?",
      ).bind(user.id),
      env.DB.prepare(
        "UPDATE invitations SET accepted_by=NULL WHERE accepted_by=?",
      ).bind(user.id),
      env.DB.prepare(
        "UPDATE invitations SET invited_by='deleted-user' WHERE invited_by=?",
      ).bind(user.id),
      env.DB.prepare(
        "UPDATE invitations SET email=? WHERE lower(email)=lower(?)",
      ).bind(redactedEmail, user.email),
      env.DB.prepare(
        `UPDATE email_messages SET recipient_user_id=NULL,recipient_email=?,
          html_body='',text_body='',last_error=NULL
         WHERE recipient_user_id=? OR lower(recipient_email)=lower(?)`,
      ).bind(redactedEmail, user.id, user.email),
      env.DB.prepare(
        "UPDATE audit_logs SET actor_id='deleted-user',detail_json='{}' WHERE actor_id=?",
      ).bind(user.id),
      env.DB.prepare("DELETE FROM profiles WHERE id=?").bind(user.id),
    ]);
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });
    const { error } = await supabase.auth.admin.deleteUser(user.id);
    if (error) throw error;
    await env.DB.prepare(
      `UPDATE data_requests SET status='completed',completed_at=?,
       failure_message=NULL WHERE id=?`,
    ).bind(Date.now(), requestId).run();
    return Response.json({ deleted: true, requestId });
  } catch (error) {
    const message = safeErrorMessage(error);
    await env.DB.prepare(
      "UPDATE data_requests SET status='failed',failure_message=? WHERE id=?",
    ).bind(message, requestId).run();
    await recordSystemEvent(env.DB, {
      severity: "critical",
      source: "account_deletion",
      eventType: "account.deletion_failed",
      message,
      detail: { dataRequestId: requestId, userId: user.id },
    });
    return Response.json({
      accepted: true,
      status: "failed",
      requestId,
      message: "The request is secured for administrator follow-up.",
    }, { status: 202 });
  }
}
