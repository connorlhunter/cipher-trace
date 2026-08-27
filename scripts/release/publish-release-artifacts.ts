import { buildChangelogArtifact } from "../changelog/changelog-artifact";
import { prepareCoveragePublication } from "../coverage/prepare-coverage-publication";
import {
  changelogInvalidations,
  publishChangelog,
  type PublishChangelogOptions,
} from "../publish/publish-changelog";
import {
  coverageInvalidations,
  publishCoverage,
  type PublishCoverageOptions,
} from "../publish/publish-coverage";
import {
  defaultCommandRunner,
  invalidateArtifacts,
  type ArtifactInvalidation,
  type CommandRunner,
} from "../publish/artifact-publishing";
import { checkReleaseVersion } from "./check-release-version";

export interface ReleasePublicationDependencies {
  readonly buildChangelogArtifact: typeof buildChangelogArtifact;
  readonly checkReleaseVersion: typeof checkReleaseVersion;
  readonly invalidateArtifacts: (
    invalidations: ReadonlyArray<ArtifactInvalidation>,
    runner: CommandRunner,
  ) => Promise<void>;
  readonly prepareCoveragePublication: typeof prepareCoveragePublication;
  readonly publishChangelog: (options: PublishChangelogOptions) => Promise<void>;
  readonly publishCoverage: (options: PublishCoverageOptions) => Promise<void>;
}

export interface PublishReleaseArtifactsOptions {
  readonly commandRunner?: CommandRunner;
  readonly dependencies?: Partial<ReleasePublicationDependencies>;
  readonly env?: NodeJS.ProcessEnv;
  readonly updatedAt?: string;
  readonly workspaceRoot?: string;
}

const defaultDependencies: ReleasePublicationDependencies = {
  buildChangelogArtifact,
  checkReleaseVersion,
  invalidateArtifacts,
  prepareCoveragePublication,
  publishChangelog,
  publishCoverage,
};

/**
 * Builds both release artifacts before upload and withholds invalidation until
 * both project prefixes have been updated. S3 cannot atomically update two
 * prefixes, but this prevents a failed build from publishing either artifact.
 */
export async function publishReleaseArtifacts(
  options: PublishReleaseArtifactsOptions = {},
): Promise<void> {
  const dependencies = { ...defaultDependencies, ...options.dependencies };
  const workspaceRoot = options.workspaceRoot ?? process.cwd();
  const updatedAt = options.updatedAt ?? new Date().toISOString();
  const env = options.env ?? process.env;
  const commandRunner = options.commandRunner ?? defaultCommandRunner;
  dependencies.checkReleaseVersion(workspaceRoot);
  await Promise.all([
    dependencies.prepareCoveragePublication(workspaceRoot, updatedAt),
    dependencies.buildChangelogArtifact(workspaceRoot, updatedAt),
  ]);
  await dependencies.publishCoverage({
    commandRunner,
    env,
    invalidate: false,
    workspaceRoot,
  });
  await dependencies.publishChangelog({
    commandRunner,
    env,
    invalidate: false,
    workspaceRoot,
  });
  await dependencies.invalidateArtifacts(
    [...coverageInvalidations(env), ...changelogInvalidations(env)],
    commandRunner,
  );
}

if (import.meta.main) {
  try {
    await publishReleaseArtifacts();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
