import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { expect, test } from "bun:test";

import { coveragePaths } from "../coverage/coverage-paths";
import {
  coverageInvalidations,
  coveragePublishDestinations,
  publishCoverage,
} from "./publish-coverage";

const publicationEnvironment: NodeJS.ProcessEnv = {
  ARTIFACTS_BUCKET: "live-artifacts",
  ARTIFACTS_CLOUDFRONT_DISTRIBUTION_ID: "distribution-123",
  ARTIFACTS_PREFIX: "portfolio",
  SOURCE_ARTIFACTS_BUCKET: "source-artifacts",
  SOURCE_ARTIFACTS_PREFIX: "source",
};

test("builds project-scoped coverage destinations and invalidation", (): void => {
  expect(coveragePublishDestinations(publicationEnvironment, "/workspace/cipher-trace")).toEqual([
    {
      label: "Source coverage copy",
      source: join("/workspace/cipher-trace", "coverage"),
      target: "s3://source-artifacts/source/projects/cipher-trace/coverage/",
    },
    {
      label: "Live coverage artifact",
      source: join("/workspace/cipher-trace", "coverage"),
      target: "s3://live-artifacts/portfolio/projects/cipher-trace/coverage/",
    },
  ]);
  expect(coverageInvalidations(publicationEnvironment)).toEqual([
    {
      distributionId: "distribution-123",
      path: "/portfolio/projects/cipher-trace/coverage/*",
    },
  ]);
});

test("publishes only coverage JSON and PDF", async (): Promise<void> => {
  const workspaceRoot = mkdtempSync(join(tmpdir(), "cipher-trace-coverage-publish-"));
  const paths = coveragePaths(workspaceRoot);
  mkdirSync(paths.directory, { recursive: true });
  writeFileSync(paths.json, "{}");
  writeFileSync(paths.pdf, "pdf");
  writeFileSync(paths.typescriptLcov, "LCOV must not be uploaded");
  const calls: Array<{ args: ReadonlyArray<string>; subject: string }> = [];

  await publishCoverage({
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
        paths.json,
        "s3://source-artifacts/source/projects/cipher-trace/coverage/index.json",
      ],
      subject: "Source coverage copy: index.json",
    },
    {
      args: [
        "s3",
        "cp",
        paths.pdf,
        "s3://source-artifacts/source/projects/cipher-trace/coverage/coverage.pdf",
      ],
      subject: "Source coverage copy: coverage.pdf",
    },
    {
      args: [
        "s3",
        "cp",
        paths.json,
        "s3://live-artifacts/portfolio/projects/cipher-trace/coverage/index.json",
      ],
      subject: "Live coverage artifact: index.json",
    },
    {
      args: [
        "s3",
        "cp",
        paths.pdf,
        "s3://live-artifacts/portfolio/projects/cipher-trace/coverage/coverage.pdf",
      ],
      subject: "Live coverage artifact: coverage.pdf",
    },
    {
      args: [
        "cloudfront",
        "create-invalidation",
        "--distribution-id",
        "distribution-123",
        "--paths",
        "/portfolio/projects/cipher-trace/coverage/*",
      ],
      subject: "Artifact CloudFront invalidation",
    },
  ]);
});
