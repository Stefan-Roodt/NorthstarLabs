import assert from "node:assert/strict";
import test from "node:test";
import {
  canAssignInvitationCourse,
  courseAcceptsLearnerInvitations,
} from "../lib/invitations.ts";

test("learner course access is limited to published courses", () => {
  assert.equal(courseAcceptsLearnerInvitations("published"), true);
  assert.equal(courseAcceptsLearnerInvitations("draft"), false);
  assert.equal(courseAcceptsLearnerInvitations("archived"), false);
  assert.equal(courseAcceptsLearnerInvitations(null), false);
  assert.equal(canAssignInvitationCourse("learner", "published"), true);
  assert.equal(canAssignInvitationCourse("learner", "draft"), false);
});

test("authorised staff invitations retain private draft review access", () => {
  assert.equal(canAssignInvitationCourse("instructor", "draft"), true);
  assert.equal(canAssignInvitationCourse("admin", "draft"), true);
});
