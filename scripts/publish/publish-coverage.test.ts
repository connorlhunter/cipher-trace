import { join } from "node:path";

import { expect, test } from "bun:test";

import {
  coverageInvalidations,
  coveragePublishDestinations,
} from "./publish-coverage";

const publicationEnvironment: NodeJS.ProcessEnv = {
  ARTIFACTS_BUCKET: "live-artifacts",
  ARTIFACTS_CLOUDFRONT_DISTRIBUTION_ID: "distribution-123",
  ARTIFACTS_PREFIX: "portfolio",
  SOURCE_ARTIFACTS_BUCKET: "source-artifacts",
  SOURCE_ARTIFACTS_PREFIX: "source",
};

test("builds project-scoped coverage destinations", (): void => {
  expect(
    coveragePublishDestinations(
      publicationEnvironment,
      "/workspace/cipher-trace",
    ),
  ).toEqual([
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
});

test("builds a project-scoped coverage invalidation", (): void => {
  expect(coverageInvalidations(publicationEnvironment)).toEqual([
    {
      distributionId: "distribution-123",
      path: "/portfolio/projects/cipher-trace/coverage/*",
    },
  ]);
});
