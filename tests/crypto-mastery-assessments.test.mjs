import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("ships complete source-grounded Part 2 and Part 3 applied assessments", async () => {
  const [migration, generator, validator] = await Promise.all([
    readFile(new URL("../drizzle/0091_crypto_mastery_part_2_3_assessments.sql", import.meta.url), "utf8"),
    readFile(new URL("../scripts/generate-parts-assessment-migration.mjs", import.meta.url), "utf8"),
    readFile(new URL("../scripts/validate-migrations.mjs", import.meta.url), "utf8"),
  ]);

  assert.equal(
    (migration.match(/INSERT OR IGNORE INTO `quiz_questions`/g) || []).length,
    310,
  );
  assert.equal(
    (migration.match(/INSERT OR IGNORE INTO `quizzes`/g) || []).length,
    62,
  );
  assert.equal(
    (migration.match(/Answer all five questions/g) || []).length,
    62,
  );
  assert.equal(
    (migration.match(/SET `title`='Apply and check your understanding'/g) || []).length,
    56,
  );
  assert.doesNotMatch(
    migration,
    /Explanations and scored questions will be added during the quality-production pass/i,
  );
  assert.match(generator, /approved module material/);
  assert.match(generator, /source-grounded feedback/);
  assert.match(generator, /Expected 62 missing assessments/);
  assert.match(validator, /appliedCryptoMasteryAssessments\.quizzes !== 62/);
  assert.match(validator, /appliedCryptoMasteryAssessments\.questions !== 310/);
  assert.match(validator, /cryptoMasteryAssessmentGaps\.length > 0/);
  assert.match(validator, /cryptoMasteryQuestionQualityIssues\.length > 0/);
});
