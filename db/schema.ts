import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const profiles = sqliteTable("profiles", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  displayName: text("display_name").notNull(),
  role: text("role").notNull().default("creator"),
  stripeCustomerId: text("stripe_customer_id"),
  createdAt: integer("created_at").notNull(),
});
export const courses = sqliteTable("courses", {
  id: text("id").primaryKey(), ownerId: text("owner_id").notNull(), title: text("title").notNull(),
  description: text("description").notNull().default(""), status: text("status").notNull().default("draft"),
  priceCents: integer("price_cents").notNull().default(0), createdAt: integer("created_at").notNull(), updatedAt: integer("updated_at").notNull(),
});
export const lessons = sqliteTable("lessons", {
  id: text("id").primaryKey(), courseId: text("course_id").notNull(), title: text("title").notNull(),
  content: text("content").notNull().default(""), videoKey: text("video_key"), position: integer("position").notNull().default(0),
});
export const enrollments = sqliteTable("enrollments", {
  id: text("id").primaryKey(), userId: text("user_id").notNull(), courseId: text("course_id").notNull(),
  progress: integer("progress").notNull().default(0), status: text("status").notNull().default("active"),
  supportNote: text("support_note").notNull().default(""), lastActivityAt: integer("last_activity_at"),
  createdAt: integer("created_at").notNull(),
});
export const communities = sqliteTable("communities", {
  id: text("id").primaryKey(), ownerId: text("owner_id").notNull(), name: text("name").notNull(), description: text("description").notNull().default(""),
  accessType: text("access_type").notNull().default("open"), allowPosting: integer("allow_posting", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at").notNull(),
});
export const posts = sqliteTable("posts", {
  id: text("id").primaryKey(), communityId: text("community_id").notNull(), authorId: text("author_id").notNull(), body: text("body").notNull(),
  status: text("status").notNull().default("visible"), moderatedBy: text("moderated_by"), moderatedAt: integer("moderated_at"),
  createdAt: integer("created_at").notNull(),
});
export const communityMembers = sqliteTable("community_members", {
  id: text("id").primaryKey(), communityId: text("community_id").notNull(), userId: text("user_id").notNull(),
  role: text("role").notNull().default("member"), status: text("status").notNull().default("active"), joinedAt: integer("joined_at").notNull(),
}, (table) => [
  uniqueIndex("community_members_community_user_unique").on(table.communityId, table.userId),
]);
export const memberships = sqliteTable("memberships", {
  id: text("id").primaryKey(), userId: text("user_id").notNull(), stripeSubscriptionId: text("stripe_subscription_id"),
  payfastToken: text("payfast_token"), payfastPaymentId: text("payfast_payment_id"), provider: text("provider").notNull().default("payfast"),
  plan: text("plan").notNull(), status: text("status").notNull(), currentPeriodEnd: integer("current_period_end"), createdAt: integer("created_at").notNull(),
});
export const lessonProgress = sqliteTable("lesson_progress", {
  id: text("id").primaryKey(), userId: text("user_id").notNull(), lessonId: text("lesson_id").notNull(),
  completed: integer("completed", { mode: "boolean" }).notNull().default(false), updatedAt: integer("updated_at").notNull(),
});
export const quizzes = sqliteTable("quizzes", {
  id: text("id").primaryKey(), lessonId: text("lesson_id").notNull(), title: text("title").notNull(), passingScore: integer("passing_score").notNull().default(80),
});
export const quizQuestions = sqliteTable("quiz_questions", {
  id: text("id").primaryKey(), quizId: text("quiz_id").notNull(), prompt: text("prompt").notNull(), optionsJson: text("options_json").notNull(), correctIndex: integer("correct_index").notNull(), position: integer("position").notNull().default(0),
});
export const certificates = sqliteTable("certificates", {
  id: text("id").primaryKey(), userId: text("user_id").notNull(), courseId: text("course_id").notNull(), code: text("code").notNull(), issuedAt: integer("issued_at").notNull(),
});
