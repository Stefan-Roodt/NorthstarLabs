import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const profiles = sqliteTable("profiles", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  displayName: text("display_name").notNull(),
  role: text("role").notNull().default("learner"),
  onboardingPath: text("onboarding_path"),
  onboardingCompleted: integer("onboarding_completed", { mode: "boolean" }).notNull().default(false),
  onboardedAt: integer("onboarded_at"),
  activeSchoolId: text("active_school_id"),
  status: text("status").notNull().default("active"),
  stripeCustomerId: text("stripe_customer_id"),
  createdAt: integer("created_at").notNull(),
}, (table) => [
  uniqueIndex("profiles_email_unique").on(table.email),
  index("profiles_status_created_idx").on(table.status, table.createdAt),
]);

export const schools = sqliteTable("schools", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  logoUrl: text("logo_url"),
  coverImageUrl: text("cover_image_url"),
  primaryColor: text("primary_color").notNull().default("#3556d8"),
  accentColor: text("accent_color").notNull().default("#ffbd8a"),
  heroTitle: text("hero_title").notNull().default(""),
  heroDescription: text("hero_description").notNull().default(""),
  fontTheme: text("font_theme").notNull().default("modern"),
  supportEmail: text("support_email").notNull().default(""),
  websiteUrl: text("website_url"),
  seoTitle: text("seo_title").notNull().default(""),
  seoDescription: text("seo_description").notNull().default(""),
  showCommunity: integer("show_community", { mode: "boolean" }).notNull().default(true),
  termsUrl: text("terms_url"),
  privacyUrl: text("privacy_url"),
  ownerId: text("owner_id").notNull(),
  status: text("status").notNull().default("active"),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
}, (table) => [
  uniqueIndex("schools_slug_unique").on(table.slug),
  index("schools_owner_idx").on(table.ownerId),
]);

export const schoolMembers = sqliteTable("school_members", {
  id: text("id").primaryKey(),
  schoolId: text("school_id").notNull(),
  userId: text("user_id").notNull(),
  role: text("role").notNull().default("learner"),
  status: text("status").notNull().default("active"),
  joinedAt: integer("joined_at").notNull(),
}, (table) => [
  uniqueIndex("school_members_school_user_unique").on(table.schoolId, table.userId),
  index("school_members_user_status_idx").on(table.userId, table.status),
  index("school_members_school_role_idx").on(table.schoolId, table.role, table.status),
]);

export const invitations = sqliteTable("invitations", {
  id: text("id").primaryKey(),
  schoolId: text("school_id").notNull(),
  courseId: text("course_id"),
  email: text("email").notNull(),
  role: text("role").notNull().default("learner"),
  tokenHash: text("token_hash").notNull(),
  status: text("status").notNull().default("pending"),
  invitedBy: text("invited_by").notNull(),
  expiresAt: integer("expires_at").notNull(),
  acceptedBy: text("accepted_by"),
  acceptedAt: integer("accepted_at"),
  createdAt: integer("created_at").notNull(),
}, (table) => [
  uniqueIndex("invitations_token_hash_unique").on(table.tokenHash),
  index("invitations_school_status_created_idx").on(table.schoolId, table.status, table.createdAt),
  index("invitations_email_status_idx").on(table.email, table.status),
]);

export const courses = sqliteTable("courses", {
  id: text("id").primaryKey(), schoolId: text("school_id").notNull().default("northstarlabs"),
  ownerId: text("owner_id").notNull(), title: text("title").notNull(),
  description: text("description").notNull().default(""), status: text("status").notNull().default("draft"),
  priceCents: integer("price_cents").notNull().default(0),
  enforceLessonOrder: integer("enforce_lesson_order", { mode: "boolean" }).notNull().default(false),
  availableFrom: integer("available_from"),
  certificateTitle: text("certificate_title").notNull().default("Certificate of Completion"),
  certificateAccent: text("certificate_accent").notNull().default("#3556d8"),
  certificateValidDays: integer("certificate_valid_days").notNull().default(0),
  createdAt: integer("created_at").notNull(), updatedAt: integer("updated_at").notNull(),
}, (table) => [
  index("courses_school_status_idx").on(table.schoolId, table.status, table.updatedAt),
  index("courses_owner_idx").on(table.ownerId),
]);
export const courseSections = sqliteTable("course_sections", {
  id: text("id").primaryKey(),
  courseId: text("course_id").notNull(),
  title: text("title").notNull(),
  position: integer("position").notNull().default(0),
  createdAt: integer("created_at").notNull(),
}, (table) => [
  index("course_sections_course_position_idx").on(table.courseId, table.position),
]);
export const mediaAssets = sqliteTable("media_assets", {
  id: text("id").primaryKey(),
  schoolId: text("school_id").notNull(),
  ownerId: text("owner_id").notNull(),
  key: text("key").notNull(),
  filename: text("filename").notNull(),
  contentType: text("content_type").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  kind: text("kind").notNull(),
  altText: text("alt_text").notNull().default(""),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
}, (table) => [
  uniqueIndex("media_assets_key_unique").on(table.key),
  index("media_assets_school_kind_created_idx").on(table.schoolId, table.kind, table.createdAt),
]);
export const mediaPlaybackGrants = sqliteTable("media_playback_grants", {
  tokenHash: text("token_hash").primaryKey(),
  userId: text("user_id").notNull(),
  courseId: text("course_id").notNull(),
  lessonId: text("lesson_id").notNull(),
  assetKey: text("asset_key").notNull(),
  filename: text("filename").notNull(),
  contentType: text("content_type").notNull(),
  kind: text("kind").notNull(),
  expiresAt: integer("expires_at").notNull(),
  createdAt: integer("created_at").notNull(),
}, (table) => [
  index("media_playback_grants_user_expiry_idx").on(table.userId, table.expiresAt),
  index("media_playback_grants_course_expiry_idx").on(table.courseId, table.expiresAt),
  index("media_playback_grants_asset_expiry_idx").on(table.assetKey, table.expiresAt),
]);
export const lessons = sqliteTable("lessons", {
  id: text("id").primaryKey(), courseId: text("course_id").notNull(), title: text("title").notNull(),
  sectionId: text("section_id"), lessonType: text("lesson_type").notNull().default("text"),
  content: text("content").notNull().default(""), contentFormat: text("content_format").notNull().default("markdown"),
  videoKey: text("video_key"), primaryAssetId: text("primary_asset_id"),
  durationMinutes: integer("duration_minutes").notNull().default(0),
  isPreview: integer("is_preview", { mode: "boolean" }).notNull().default(false),
  availableAfterDays: integer("available_after_days").notNull().default(0),
  requiredWatchPercent: integer("required_watch_percent").notNull().default(0),
  transcript: text("transcript").notNull().default(""),
  position: integer("position").notNull().default(0), updatedAt: integer("updated_at").notNull().default(0),
}, (table) => [
  index("lessons_course_position_idx").on(table.courseId, table.sectionId, table.position),
]);
export const lessonResources = sqliteTable("lesson_resources", {
  id: text("id").primaryKey(),
  lessonId: text("lesson_id").notNull(),
  assetId: text("asset_id").notNull(),
  title: text("title").notNull(),
  position: integer("position").notNull().default(0),
}, (table) => [
  uniqueIndex("lesson_resources_lesson_asset_unique").on(table.lessonId, table.assetId),
  index("lesson_resources_asset_idx").on(table.assetId),
]);
export const enrollments = sqliteTable("enrollments", {
  id: text("id").primaryKey(), userId: text("user_id").notNull(), courseId: text("course_id").notNull(),
  progress: integer("progress").notNull().default(0), status: text("status").notNull().default("active"),
  supportNote: text("support_note").notNull().default(""), lastActivityAt: integer("last_activity_at"),
  createdAt: integer("created_at").notNull(),
}, (table) => [
  uniqueIndex("enrollments_user_course_unique").on(table.userId, table.courseId),
  index("enrollments_course_status_idx").on(table.courseId, table.status),
  index("enrollments_user_status_idx").on(table.userId, table.status),
]);
export const communities = sqliteTable("communities", {
  id: text("id").primaryKey(), schoolId: text("school_id").notNull().default("northstarlabs"),
  ownerId: text("owner_id").notNull(), name: text("name").notNull(), description: text("description").notNull().default(""),
  accessType: text("access_type").notNull().default("open"), allowPosting: integer("allow_posting", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at").notNull(),
}, (table) => [
  uniqueIndex("communities_school_unique").on(table.schoolId),
]);
export const posts = sqliteTable("posts", {
  id: text("id").primaryKey(), communityId: text("community_id").notNull(), authorId: text("author_id").notNull(), body: text("body").notNull(),
  status: text("status").notNull().default("visible"), moderatedBy: text("moderated_by"), moderatedAt: integer("moderated_at"),
  createdAt: integer("created_at").notNull(),
}, (table) => [
  index("posts_community_status_created_idx").on(table.communityId, table.status, table.createdAt),
]);
export const contentReports = sqliteTable("content_reports", {
  id: text("id").primaryKey(),
  schoolId: text("school_id").notNull(),
  communityId: text("community_id").notNull(),
  postId: text("post_id").notNull(),
  reporterId: text("reporter_id").notNull(),
  reason: text("reason").notNull(),
  detail: text("detail").notNull().default(""),
  status: text("status").notNull().default("open"),
  reviewedBy: text("reviewed_by"),
  createdAt: integer("created_at").notNull(),
  reviewedAt: integer("reviewed_at"),
}, (table) => [
  uniqueIndex("content_reports_post_reporter_open_unique").on(
    table.postId,
    table.reporterId,
    table.status,
  ),
  index("content_reports_school_status_created_idx").on(
    table.schoolId,
    table.status,
    table.createdAt,
  ),
  index("content_reports_post_idx").on(table.postId),
]);
export const communityMembers = sqliteTable("community_members", {
  id: text("id").primaryKey(), communityId: text("community_id").notNull(), userId: text("user_id").notNull(),
  role: text("role").notNull().default("member"), status: text("status").notNull().default("active"), joinedAt: integer("joined_at").notNull(),
}, (table) => [
  uniqueIndex("community_members_community_user_unique").on(table.communityId, table.userId),
  index("community_members_user_status_idx").on(table.userId, table.status),
]);
export const memberships = sqliteTable("memberships", {
  id: text("id").primaryKey(), userId: text("user_id").notNull(), stripeSubscriptionId: text("stripe_subscription_id"),
  payfastToken: text("payfast_token"), payfastPaymentId: text("payfast_payment_id"), provider: text("provider").notNull().default("payfast"),
  plan: text("plan").notNull(), status: text("status").notNull(), currentPeriodEnd: integer("current_period_end"), createdAt: integer("created_at").notNull(),
}, (table) => [
  index("memberships_user_status_idx").on(table.userId, table.status),
]);
export const lessonProgress = sqliteTable("lesson_progress", {
  id: text("id").primaryKey(), userId: text("user_id").notNull(), lessonId: text("lesson_id").notNull(),
  completed: integer("completed", { mode: "boolean" }).notNull().default(false),
  watchedPercent: integer("watched_percent").notNull().default(0),
  notes: text("notes").notNull().default(""),
  bookmarked: integer("bookmarked", { mode: "boolean" }).notNull().default(false),
  updatedAt: integer("updated_at").notNull(),
}, (table) => [
  uniqueIndex("lesson_progress_user_lesson_unique").on(table.userId, table.lessonId),
  index("lesson_progress_user_bookmarked_idx").on(table.userId, table.bookmarked, table.updatedAt),
]);
export const quizzes = sqliteTable("quizzes", {
  id: text("id").primaryKey(), lessonId: text("lesson_id").notNull(), title: text("title").notNull(),
  passingScore: integer("passing_score").notNull().default(80),
  maxAttempts: integer("max_attempts").notNull().default(0),
}, (table) => [
  uniqueIndex("quizzes_lesson_unique").on(table.lessonId),
]);
export const quizQuestions = sqliteTable("quiz_questions", {
  id: text("id").primaryKey(), quizId: text("quiz_id").notNull(), prompt: text("prompt").notNull(), optionsJson: text("options_json").notNull(), correctIndex: integer("correct_index").notNull(), position: integer("position").notNull().default(0),
}, (table) => [
  index("quiz_questions_quiz_position_idx").on(table.quizId, table.position),
]);
export const quizAttempts = sqliteTable("quiz_attempts", {
  id: text("id").primaryKey(),
  quizId: text("quiz_id").notNull(),
  userId: text("user_id").notNull(),
  attemptNumber: integer("attempt_number").notNull(),
  answersJson: text("answers_json").notNull(),
  score: integer("score").notNull(),
  passed: integer("passed", { mode: "boolean" }).notNull().default(false),
  submittedAt: integer("submitted_at").notNull(),
}, (table) => [
  uniqueIndex("quiz_attempts_quiz_user_number_unique").on(
    table.quizId,
    table.userId,
    table.attemptNumber,
  ),
  index("quiz_attempts_user_submitted_idx").on(table.userId, table.submittedAt),
]);
export const certificates = sqliteTable("certificates", {
  id: text("id").primaryKey(), userId: text("user_id").notNull(), courseId: text("course_id").notNull(),
  code: text("code").notNull(), issuedAt: integer("issued_at").notNull(),
  recipientName: text("recipient_name").notNull().default("NorthStarLabs learner"),
  courseTitle: text("course_title").notNull().default("NorthStarLabs course"),
  certificateTitle: text("certificate_title").notNull().default("Certificate of Completion"),
  accentColor: text("accent_color").notNull().default("#3556d8"),
  status: text("status").notNull().default("active"),
  expiresAt: integer("expires_at"),
  revokedAt: integer("revoked_at"),
  replacedByCode: text("replaced_by_code"),
}, (table) => [
  uniqueIndex("certificates_code_unique").on(table.code),
  index("certificates_user_course_idx").on(table.userId, table.courseId, table.issuedAt),
  index("certificates_course_status_idx").on(table.courseId, table.status, table.issuedAt),
]);

export const emailMessages = sqliteTable("email_messages", {
  id: text("id").primaryKey(),
  schoolId: text("school_id"),
  recipientUserId: text("recipient_user_id"),
  recipientEmail: text("recipient_email").notNull(),
  templateKey: text("template_key").notNull(),
  subject: text("subject").notNull(),
  htmlBody: text("html_body").notNull(),
  textBody: text("text_body").notNull(),
  status: text("status").notNull().default("pending"),
  provider: text("provider").notNull().default("resend"),
  providerMessageId: text("provider_message_id"),
  idempotencyKey: text("idempotency_key").notNull(),
  attemptCount: integer("attempt_count").notNull().default(0),
  lastError: text("last_error"),
  availableAt: integer("available_at").notNull(),
  sentAt: integer("sent_at"),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
}, (table) => [
  uniqueIndex("email_messages_idempotency_unique").on(table.idempotencyKey),
  index("email_messages_status_available_idx").on(table.status, table.availableAt),
  index("email_messages_school_created_idx").on(table.schoolId, table.createdAt),
  index("email_messages_recipient_created_idx").on(table.recipientEmail, table.createdAt),
]);

export const notificationPreferences = sqliteTable("notification_preferences", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  enrollmentEmails: integer("enrollment_emails", { mode: "boolean" }).notNull().default(true),
  completionEmails: integer("completion_emails", { mode: "boolean" }).notNull().default(true),
  communityEmails: integer("community_emails", { mode: "boolean" }).notNull().default(true),
  creatorSummaries: integer("creator_summaries", { mode: "boolean" }).notNull().default(true),
  productUpdates: integer("product_updates", { mode: "boolean" }).notNull().default(false),
  updatedAt: integer("updated_at").notNull(),
}, (table) => [
  uniqueIndex("notification_preferences_user_unique").on(table.userId),
]);

export const reportSchedules = sqliteTable("report_schedules", {
  id: text("id").primaryKey(),
  schoolId: text("school_id").notNull(),
  createdBy: text("created_by").notNull(),
  frequency: text("frequency").notNull().default("weekly"),
  recipientEmail: text("recipient_email").notNull(),
  status: text("status").notNull().default("active"),
  nextRunAt: integer("next_run_at").notNull(),
  lastRunAt: integer("last_run_at"),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
}, (table) => [
  index("report_schedules_due_idx").on(table.status, table.nextRunAt),
  index("report_schedules_school_idx").on(table.schoolId, table.status),
]);

export const auditLogs = sqliteTable("audit_logs", {
  id: text("id").primaryKey(),
  actorId: text("actor_id").notNull(),
  schoolId: text("school_id"),
  action: text("action").notNull(),
  targetType: text("target_type").notNull(),
  targetId: text("target_id").notNull(),
  detailJson: text("detail_json").notNull().default("{}"),
  createdAt: integer("created_at").notNull(),
}, (table) => [
  index("audit_logs_school_created_idx").on(table.schoolId, table.createdAt),
  index("audit_logs_actor_created_idx").on(table.actorId, table.createdAt),
]);

export const rateLimitBuckets = sqliteTable("rate_limit_buckets", {
  bucketKey: text("bucket_key").primaryKey(),
  scope: text("scope").notNull(),
  requestCount: integer("request_count").notNull().default(0),
  windowStartedAt: integer("window_started_at").notNull(),
  resetAt: integer("reset_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
}, (table) => [
  index("rate_limit_buckets_reset_idx").on(table.resetAt),
  index("rate_limit_buckets_scope_updated_idx").on(table.scope, table.updatedAt),
]);

export const systemEvents = sqliteTable("system_events", {
  id: text("id").primaryKey(),
  severity: text("severity").notNull().default("info"),
  source: text("source").notNull(),
  eventType: text("event_type").notNull(),
  message: text("message").notNull(),
  requestId: text("request_id"),
  route: text("route"),
  detailJson: text("detail_json").notNull().default("{}"),
  status: text("status").notNull().default("open"),
  createdAt: integer("created_at").notNull(),
  resolvedAt: integer("resolved_at"),
  resolvedBy: text("resolved_by"),
}, (table) => [
  index("system_events_status_severity_created_idx").on(
    table.status,
    table.severity,
    table.createdAt,
  ),
  index("system_events_type_created_idx").on(table.eventType, table.createdAt),
  index("system_events_request_idx").on(table.requestId),
]);

export const backupRuns = sqliteTable("backup_runs", {
  id: text("id").primaryKey(),
  requestedBy: text("requested_by").notNull(),
  status: text("status").notNull().default("running"),
  objectKey: text("object_key"),
  tableCount: integer("table_count").notNull().default(0),
  rowCount: integer("row_count").notNull().default(0),
  sizeBytes: integer("size_bytes").notNull().default(0),
  checksum: text("checksum"),
  failureMessage: text("failure_message"),
  createdAt: integer("created_at").notNull(),
  completedAt: integer("completed_at"),
  verifiedAt: integer("verified_at"),
}, (table) => [
  index("backup_runs_status_created_idx").on(table.status, table.createdAt),
  index("backup_runs_created_idx").on(table.createdAt),
]);

export const dataRequests = sqliteTable("data_requests", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  requestType: text("request_type").notNull(),
  status: text("status").notNull().default("pending"),
  objectKey: text("object_key"),
  failureMessage: text("failure_message"),
  createdAt: integer("created_at").notNull(),
  completedAt: integer("completed_at"),
  expiresAt: integer("expires_at"),
}, (table) => [
  index("data_requests_user_created_idx").on(table.userId, table.createdAt),
  index("data_requests_status_created_idx").on(table.status, table.createdAt),
]);
