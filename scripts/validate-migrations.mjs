import { readdir, readFile } from "node:fs/promises";
import { DatabaseSync } from "node:sqlite";

const migrationDirectory = new URL("../drizzle/", import.meta.url);
const files = (await readdir(migrationDirectory))
  .filter((file) => file.endsWith(".sql"))
  .sort();
const database = new DatabaseSync(":memory:");

for (const file of files) {
  if (file.startsWith("0006_")) {
    database.exec(`
      INSERT INTO profiles (id,email,display_name,role,created_at)
      VALUES
        ('creator-fixture','creator@example.com','Fixture Creator','creator',1784400000000),
        ('learner-fixture','learner@example.com','Fixture Learner','creator',1784400000000);
      INSERT INTO courses
        (id,owner_id,title,description,status,price_cents,created_at,updated_at)
      VALUES
        ('legacy-fixture-course','creator-fixture','Legacy Fixture Course','','published',0,1784400000000,1784400000000);
      INSERT INTO enrollments
        (id,user_id,course_id,progress,status,support_note,last_activity_at,created_at)
      VALUES
        ('legacy-fixture-enrollment','learner-fixture','legacy-fixture-course',25,'active','',1784400000000,1784400000000);
      INSERT INTO communities
        (id,owner_id,name,description,access_type,allow_posting,created_at)
      VALUES
        ('northstar-circle','creator-fixture','Northstar Circle','','open',1,1784400000000);
      INSERT INTO community_members
        (id,community_id,user_id,role,status,joined_at)
      VALUES
        ('legacy-community-owner','northstar-circle','creator-fixture','owner','active',1784400000000);
    `);
  }
  const sql = await readFile(new URL(file, migrationDirectory), "utf8");
  const statements = sql
    .split(/--> statement-breakpoint\s*/)
    .map((statement) => statement.trim())
    .filter(Boolean);
  for (const statement of statements) database.exec(statement);
}

const tables = database.prepare(
  "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name",
).all();
const schools = database.prepare(
  "SELECT id,name FROM schools ORDER BY id",
).all();
const courseScopes = database.prepare(
  "SELECT school_id AS schoolId,COUNT(*) AS courses FROM courses GROUP BY school_id",
).all();

if (!tables.some((table) => table.name === "schools")) {
  throw new Error("The schools table was not created.");
}
if (!tables.some((table) => table.name === "school_members")) {
  throw new Error("The school_members table was not created.");
}
if (!schools.some((school) => school.id === "northstarlabs")) {
  throw new Error("The existing NorthstarLabs school was not migrated.");
}
if (courseScopes.some((scope) => !scope.schoolId)) {
  throw new Error("At least one course was left without a school.");
}
const legacyCourse = database.prepare(
  "SELECT school_id AS schoolId FROM courses WHERE id='legacy-fixture-course'",
).get();
if (legacyCourse?.schoolId !== "school-creator-fixture") {
  throw new Error("An existing creator course was not moved into its own school.");
}
const legacyRoles = database.prepare(
  `SELECT user_id AS userId,role FROM school_members
   WHERE school_id='school-creator-fixture' ORDER BY user_id`,
).all();
if (!legacyRoles.some((member) =>
  member.userId === "creator-fixture" && member.role === "owner"
)) {
  throw new Error("The existing creator was not made the school owner.");
}
if (!legacyRoles.some((member) =>
  member.userId === "learner-fixture" && member.role === "learner"
)) {
  throw new Error("The existing learner was not moved into the creator's school.");
}
const migratedCommunity = database.prepare(
  "SELECT school_id AS schoolId,owner_id AS ownerId FROM communities WHERE id='northstar-circle'",
).get();
if (
  migratedCommunity?.schoolId !== "northstarlabs" ||
  migratedCommunity?.ownerId !== "northstarlabs-studio"
) {
  throw new Error("The shared legacy community was not returned to the platform school.");
}

console.log(JSON.stringify({
  migrations: files.length,
  tables: tables.length,
  schools,
  courseScopes,
}, null, 2));
