import { existsSync } from "node:fs";

import { coveragePaths } from "../coverage/coverage-paths";
import { prepareCoveragePublication } from "../coverage/prepare-coverage-publication";
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

const project = { artifact: "coverage", projectSlug: "cipher-trace" } as const;

export { defaultCommandRunner, type CommandRunner };
export type CoverageInvalidation = ArtifactInvalidation;
export type CoveragePublishDestination = ArtifactPublishDestination & {
  readonly source: string;
};

export interface PublishCoverageOptions {
  readonly commandRunner?: CommandRunner;
  readonly env?: NodeJS.ProcessEnv;
  readonly invalidate?: boolean;
  readonly workspaceRoot?: string;
}

export interface PublishCoveragePublicationOptions extends PublishCoverageOptions {
  readonly updatedAt?: string;
}

/** Resolves source and live destinations for the coverage JSON and PDF. */
export function coveragePublishDestinations(
  env: NodeJS.ProcessEnv = process.env,
  workspaceRoot = process.cwd(),
): CoveragePublishDestination[] {
  const source = coveragePaths(workspaceRoot).directory;
  return artifactPublishDestinations(project, env).map((destination) => ({
    ...destination,
    source,
  }));
}

/** Resolves the optional CloudFront invalidation for Cipher Trace coverage. */
export function coverageInvalidations(
  env: NodeJS.ProcessEnv = process.env,
): CoverageInvalidation[] {
  return artifactInvalidations(project, env);
}

/** Uploads only the rendered coverage pair and optionally invalidates it. */
export async function publishCoverage(options: PublishCoverageOptions = {}): Promise<void> {
  const paths = coveragePaths(options.workspaceRoot);
  if (!existsSync(paths.json) || !existsSync(paths.pdf))
    throw new Error(`Missing coverage artifacts: ${paths.json} or ${paths.pdf}.`);
  const env = options.env ?? process.env;
  const runner = options.commandRunner ?? defaultCommandRunner;
  await publishArtifactFiles(
    [
      { name: "index.json", source: paths.json },
      { name: "coverage.pdf", source: paths.pdf },
    ],
    coveragePublishDestinations(env, options.workspaceRoot),
    runner,
  );
  if (options.invalidate ?? true) await invalidateArtifacts(coverageInvalidations(env), runner);
}

/** Builds the project-owned coverage pair, then publishes it. */
export async function publishCoveragePublication(
  options: PublishCoveragePublicationOptions = {},
): Promise<void> {
  await prepareCoveragePublication(options.workspaceRoot, options.updatedAt);
  await publishCoverage(options);
}

if (import.meta.main) {
  try {
    await publishCoveragePublication();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
