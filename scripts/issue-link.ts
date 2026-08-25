const issueReferencePattern = new RegExp(
  "\\b(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?|related\\s+to|track(?:s|ed)?|implement(?:s|ed)?|reference(?:s|d)?|refer(?:s|red)?\\s+to)\\s+(?:(?:connorlhunter/cipher-trace)?#\\d+|https://github\\.com/connorlhunter/cipher-trace/issues/\\d+)\\b",
  "iu",
);
const dependabotLogin = "dependabot[bot]";

type Environment = Readonly<Record<string, string | undefined>>;

export function hasLinkedIssue(pullRequestBody: string): boolean {
  return issueReferencePattern.test(pullRequestBody);
}

export function isDependabotPullRequest(
  pullRequestAuthor: string | undefined,
): boolean {
  return pullRequestAuthor === dependabotLogin;
}

export function assertLinkedIssue(pullRequestBody: string): void {
  if (!hasLinkedIssue(pullRequestBody)) {
    throw new Error(
      'Pull request descriptions must link a Cipher Trace issue. Use a phrase such as "Closes #123" or "Related to #123".',
    );
  }
}

export async function runIssueLinkCheck(
  arguments_: readonly string[],
  environment: Environment,
): Promise<void> {
  if (arguments_.length === 1 && arguments_[0] === "--pull-request-body") {
    if (isDependabotPullRequest(environment.CIPHER_TRACE_PULL_REQUEST_AUTHOR)) {
      return;
    }

    assertLinkedIssue(environment.CIPHER_TRACE_PULL_REQUEST_BODY ?? "");
    return;
  }

  throw new Error("Usage: issue-link.ts --pull-request-body");
}

if (import.meta.main) {
  await runIssueLinkCheck(process.argv.slice(2), process.env);
}
