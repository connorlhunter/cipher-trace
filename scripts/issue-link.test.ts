import { expect, test } from "bun:test";

import { hasLinkedIssue, isDependabotPullRequest } from "./issue-link.ts";

test("recognizes a Cipher Trace issue reference", (): void => {
  expect(hasLinkedIssue("Closes #61")).toBe(true);
  expect(hasLinkedIssue("Related to connorlhunter/cipher-trace#61")).toBe(true);
  expect(hasLinkedIssue("Implements a contract model")).toBe(false);
});

test("exempts Dependabot pull requests", (): void => {
  expect(isDependabotPullRequest("dependabot[bot]")).toBe(true);
  expect(isDependabotPullRequest("connorlhunter")).toBe(false);
});
