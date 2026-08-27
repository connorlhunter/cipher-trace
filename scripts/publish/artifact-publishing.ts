import { spawn } from "node:child_process";

export type CommandRunner = (
  command: string,
  args: ReadonlyArray<string>,
  subject: string,
) => Promise<void>;

export interface ArtifactFile {
  readonly name: string;
  readonly source: string;
}

export interface ArtifactInvalidation {
  readonly distributionId: string;
  readonly path: string;
}

export interface ArtifactPublishDestination {
  readonly label: string;
  readonly target: string;
}

export interface ProjectArtifact {
  readonly artifact: "changelog" | "coverage";
  readonly projectSlug: string;
}

/** Runs one publish command and includes its output in failures. */
export const defaultCommandRunner: CommandRunner = (command, args, subject) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, [...args], {
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });
    child.on("error", (error: Error) => reject(new Error(`${subject} failed: ${error.message}`)));
    child.on("close", (code: number | null) => {
      if (code === 0) return resolve();
      reject(
        new Error(
          [`${subject} failed with exit code ${code ?? "unknown"}.`, stdout.trim(), stderr.trim()]
            .filter(Boolean)
            .join("\n"),
        ),
      );
    });
  });

/** Resolves source and live destinations for one project-owned artifact. */
export function artifactPublishDestinations(
  project: ProjectArtifact,
  env: NodeJS.ProcessEnv = process.env,
): ArtifactPublishDestination[] {
  const artifactLabel = titleCase(project.artifact);
  const buckets = [
    [
      envValue(env.SOURCE_ARTIFACTS_BUCKET),
      envValue(env.SOURCE_ARTIFACTS_PREFIX),
      `Source ${project.artifact} copy`,
    ],
    [
      envValue(env.ARTIFACTS_BUCKET),
      envValue(env.ARTIFACTS_PREFIX),
      `Live ${project.artifact} artifact`,
    ],
  ] as const;
  const destinations = buckets
    .filter(([bucket]) => Boolean(bucket))
    .map(([bucket, prefix, label]) => ({
      label,
      target: s3Uri(bucket, keyPath(prefix, "projects", project.projectSlug, project.artifact)),
    }));
  if (destinations.length === 0)
    throw new Error(
      `Missing SOURCE_ARTIFACTS_BUCKET or ARTIFACTS_BUCKET for ${artifactLabel} publishing.`,
    );
  return destinations;
}

/** Resolves the optional CloudFront invalidation for one project artifact. */
export function artifactInvalidations(
  project: ProjectArtifact,
  env: NodeJS.ProcessEnv = process.env,
): ArtifactInvalidation[] {
  const distributionId = envValue(env.ARTIFACTS_CLOUDFRONT_DISTRIBUTION_ID);
  if (!distributionId) return [];
  return [
    {
      distributionId,
      path: `/${keyPath(
        envValue(env.ARTIFACTS_PREFIX),
        "projects",
        project.projectSlug,
        project.artifact,
        "*",
      )}`,
    },
  ];
}

/** Uploads only the explicit artifact files, never coverage inputs or temp files. */
export async function publishArtifactFiles(
  files: ReadonlyArray<ArtifactFile>,
  destinations: ReadonlyArray<ArtifactPublishDestination>,
  runner: CommandRunner = defaultCommandRunner,
): Promise<void> {
  for (const destination of destinations)
    for (const file of files)
      await runner(
        "aws",
        ["s3", "cp", file.source, `${destination.target}${file.name}`],
        `${destination.label}: ${file.name}`,
      );
}

/** Invalidates artifact paths after every corresponding upload succeeds. */
export async function invalidateArtifacts(
  invalidations: ReadonlyArray<ArtifactInvalidation>,
  runner: CommandRunner = defaultCommandRunner,
): Promise<void> {
  for (const invalidation of invalidations)
    await runner(
      "aws",
      [
        "cloudfront",
        "create-invalidation",
        "--distribution-id",
        invalidation.distributionId,
        "--paths",
        invalidation.path,
      ],
      "Artifact CloudFront invalidation",
    );
}

function envValue(value: string | undefined): string {
  return value?.trim() ?? "";
}

function keyPath(...parts: ReadonlyArray<string>): string {
  return parts
    .map((part) => part.trim().replace(/^\/+|\/+$/gu, ""))
    .filter(Boolean)
    .join("/");
}

function s3Uri(bucket: string, key: string): string {
  return key ? `s3://${bucket}/${key}/` : `s3://${bucket}/`;
}

function titleCase(value: string): string {
  return value.slice(0, 1).toUpperCase() + value.slice(1);
}
