const changeTypes = "(?:feat|fix|chore|docs|test|refactor)";
const kebabName = "[a-z0-9]+(?:-[a-z0-9]+)*";
const coreNumber = "(?:0|[1-9]\\d*)";
const prereleasePart = "(?:0|[1-9]\\d*|\\d*[A-Za-z-][0-9A-Za-z-]*)";
const buildPart = "[0-9A-Za-z-]+";

const branchPattern = new RegExp(
  "^" + changeTypes + "/" + kebabName + "$",
  "u",
);
const releasePattern = new RegExp(
  "^release/" +
    coreNumber +
    "\\." +
    coreNumber +
    "\\." +
    coreNumber +
    "(?:-" +
    prereleasePart +
    "(?:\\." +
    prereleasePart +
    ")*)?(?:\\+" +
    buildPart +
    "(?:\\." +
    buildPart +
    ")*)?$",
  "u",
);
const dependabotPattern = /^dependabot\/[0-9A-Za-z._/-]+$/u;
const titlePattern = new RegExp(
  "^" + changeTypes + "(?:\\(" + kebabName + "\\))?!?: \\S(?:.*\\S)?$",
  "u",
);

type Environment = Readonly<Record<string, string | undefined>>;

export function isAllowedBranchName(branchName: string): boolean {
  return (
    branchName === "main" ||
    branchPattern.test(branchName) ||
    releasePattern.test(branchName) ||
    dependabotPattern.test(branchName)
  );
}

export function isAllowedChangeTitle(title: string): boolean {
  return titlePattern.test(title);
}

export function currentBranchName(
  environment: Environment = process.env,
  readGitBranch: () => string = (): string => {
    const result = Bun.spawnSync(["git", "branch", "--show-current"], {
      stderr: "inherit",
      stdout: "pipe",
    });
    return result.exitCode === 0
      ? new TextDecoder().decode(result.stdout).trim()
      : "";
  },
): string {
  return (
    environment.GITHUB_HEAD_REF?.trim() ||
    environment.GITHUB_REF_NAME?.trim() ||
    readGitBranch().trim()
  );
}

export function assertAllowedBranchName(branchName: string): void {
  if (!isAllowedBranchName(branchName)) {
    throw new Error(
      'Invalid branch name "' +
        branchName +
        '". Use main, <type>/<kebab-case-name>, release/<semver>, or dependabot/*.',
    );
  }
}

export function assertAllowedChangeTitle(title: string, label: string): void {
  if (!isAllowedChangeTitle(title)) {
    throw new Error(
      "Invalid " +
        label +
        ' "' +
        title +
        '". Use <type>[(scope)][!]: <imperative summary>.',
    );
  }
}

async function readCommitSubject(path: string): Promise<string> {
  const message = await Bun.file(path).text();
  return message.split(/\r?\n/u, 1)[0]?.trim() ?? "";
}

export async function runChangeNaming(
  arguments_: readonly string[],
  environment: Environment,
): Promise<void> {
  const [mode, value] = arguments_;

  if (mode === "--branch" && value === undefined) {
    assertAllowedBranchName(currentBranchName(environment));
    return;
  }

  if (mode === "--pull-request-title" && value === undefined) {
    assertAllowedChangeTitle(
      environment.CIPHER_TRACE_PULL_REQUEST_TITLE?.trim() ?? "",
      "pull request title",
    );
    return;
  }

  if (mode === "--commit-message-file" && value !== undefined) {
    assertAllowedChangeTitle(await readCommitSubject(value), "commit subject");
    return;
  }

  throw new Error(
    "Usage: change-naming.ts --branch | --pull-request-title | --commit-message-file <path>",
  );
}

if (import.meta.main) {
  await runChangeNaming(process.argv.slice(2), process.env);
}
