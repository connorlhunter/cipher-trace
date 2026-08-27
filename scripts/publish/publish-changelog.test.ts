import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { expect, test } from "bun:test";

import { changelogPaths } from "../changelog/changelog-artifact";
import {
  changelogInvalidations,
  changelogPublishDestinations,
  publishChangelog,
} from "./publish-changelog";

const publicationEnvironment: NodeJS.ProcessEnv = {
  ARTIFACTS_BUCKET: "live-artifacts",
  ARTIFACTS_CLOUDFRONT_DISTRIBUTION_ID: "distribution-123",
  ARTIFACTS_PREFIX: "portfolio",
  SOURCE_ARTIFACTS_BUCKET: "source-artifacts",
  SOURCE_ARTIFACTS_PREFIX: "source",
};

test("builds project-scoped changelog destinations and invalidation", (): void => {
  expect(changelogPublishDestinations(publicationEnvironment, "/workspace/cipher-trace")).toEqual([
    {
      label: "Source changelog copy",
      source: join("/workspace/cipher-trace", "changelog"),
      target: "s3://source-artifacts/source/projects/cipher-trace/changelog/",
    },
    {
      label: "Live changelog artifact",
      source: join("/workspace/cipher-trace", "changelog"),
      target: "s3://live-artifacts/portfolio/projects/cipher-trace/changelog/",
    },
  ]);
  expect(changelogInvalidations(publicationEnvironment)).toEqual([
    {
      distributionId: "distribution-123",
      path: "/portfolio/projects/cipher-trace/changelog/*",
    },
  ]);
});

test("publishes changelog Markdown and PDF", async (): Promise<void> => {
  const workspaceRoot = mkdtempSync(join(tmpdir(), "cipher-trace-changelog-publish-"));
  const paths = changelogPaths(workspaceRoot);
  mkdirSync(paths.directory, { recursive: true });
  writeFileSync(paths.markdown, "# Changelog\n");
  writeFileSync(paths.pdf, "pdf");
  const calls: Array<{ args: ReadonlyArray<string>; subject: string }> = [];

  await publishChangelog({
    commandRunner: async (_command, args, subject): Promise<void> => {
      calls.push({ args, subject });
    },
    env: publicationEnvironment,
    workspaceRoot,
  });

  expect(calls).toEqual([
    {
      args: [
        "s3",
        "cp",
        paths.markdown,
        "s3://source-artifacts/source/projects/cipher-trace/changelog/CHANGELOG.md",
      ],
      subject: "Source changelog copy: CHANGELOG.md",
    },
    {
      args: [
        "s3",
        "cp",
        paths.pdf,
        "s3://source-artifacts/source/projects/cipher-trace/changelog/changelog.pdf",
      ],
      subject: "Source changelog copy: changelog.pdf",
    },
    {
      args: [
        "s3",
        "cp",
        paths.markdown,
        "s3://live-artifacts/portfolio/projects/cipher-trace/changelog/CHANGELOG.md",
      ],
      subject: "Live changelog artifact: CHANGELOG.md",
    },
    {
      args: [
        "s3",
        "cp",
        paths.pdf,
        "s3://live-artifacts/portfolio/projects/cipher-trace/changelog/changelog.pdf",
      ],
      subject: "Live changelog artifact: changelog.pdf",
    },
    {
      args: [
        "cloudfront",
        "create-invalidation",
        "--distribution-id",
        "distribution-123",
        "--paths",
        "/portfolio/projects/cipher-trace/changelog/*",
      ],
      subject: "Artifact CloudFront invalidation",
    },
  ]);
});
