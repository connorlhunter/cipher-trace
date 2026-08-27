import { existsSync } from "node:fs";

import { buildChangelogArtifact, changelogPaths } from "../changelog/changelog-artifact";
import {
  artifactInvalidations,
  artifactPublishDestinations,
  defaultCommandRunner,
  invalidateArtifacts,
  publishArtifactFiles,
  type ArtifactInvalidation,
  type ArtifactPublishDestination,
  type CommandRunner,
} from "./artifact-publishing";

const project = { artifact: "changelog", projectSlug: "cipher-trace" } as const;

export type ChangelogInvalidation = ArtifactInvalidation;
export type ChangelogPublishDestination = ArtifactPublishDestination & {
  readonly source: string;
};

export interface PublishChangelogOptions {
  readonly commandRunner?: CommandRunner;
  readonly env?: NodeJS.ProcessEnv;
  readonly invalidate?: boolean;
  readonly workspaceRoot?: string;
}

/** Resolves source and live destinations for the changelog Markdown and PDF. */
export function changelogPublishDestinations(
  env: NodeJS.ProcessEnv = process.env,
  workspaceRoot = process.cwd(),
): ChangelogPublishDestination[] {
  const source = changelogPaths(workspaceRoot).directory;
  return artifactPublishDestinations(project, env).map((destination) => ({
    ...destination,
    source,
  }));
}

/** Resolves the optional CloudFront invalidation for the changelog. */
export function changelogInvalidations(
  env: NodeJS.ProcessEnv = process.env,
): ChangelogInvalidation[] {
  return artifactInvalidations(project, env);
}

/** Publishes canonical changelog Markdown and its matching PDF. */
export async function publishChangelog(options: PublishChangelogOptions = {}): Promise<void> {
  const paths = changelogPaths(options.workspaceRoot);
  if (!existsSync(paths.markdown) || !existsSync(paths.pdf))
    throw new Error("Missing changelog artifacts.");
  const env = options.env ?? process.env;
  const runner = options.commandRunner ?? defaultCommandRunner;
  await publishArtifactFiles(
    [
      { name: "CHANGELOG.md", source: paths.markdown },
      { name: "changelog.pdf", source: paths.pdf },
    ],
    changelogPublishDestinations(env, options.workspaceRoot),
    runner,
  );
  if (options.invalidate ?? true) await invalidateArtifacts(changelogInvalidations(env), runner);
}

/** Builds the canonical changelog artifacts immediately before upload. */
export async function publishChangelogPublication(
  options: PublishChangelogOptions = {},
): Promise<void> {
  await buildChangelogArtifact(options.workspaceRoot);
  await publishChangelog(options);
}

if (import.meta.main) {
  try {
    await publishChangelogPublication();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
