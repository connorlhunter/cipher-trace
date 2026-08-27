import { expect, test } from "bun:test";

import { publishReleaseArtifacts } from "./publish-release-artifacts";

test("builds both artifacts before uploads and invalidates only at the end", async (): Promise<void> => {
  const events: string[] = [];
  await publishReleaseArtifacts({
    commandRunner: async (): Promise<void> => undefined,
    env: {},
    updatedAt: "2026-08-27T00:00:00.000Z",
    workspaceRoot: "/workspace/cipher-trace",
    dependencies: {
      buildChangelogArtifact: async (_root, updatedAt) => {
        events.push(`build-changelog:${updatedAt}`);
        return { directory: "", markdown: "", pdf: "" };
      },
      checkReleaseVersion: (root) => {
        events.push(`check:${root}`);
      },
      invalidateArtifacts: async () => {
        events.push("invalidate");
      },
      prepareCoveragePublication: async (_root, updatedAt) => {
        events.push(`build-coverage:${updatedAt}`);
        return { json: "", pdf: "", updatedAt: updatedAt ?? "" };
      },
      publishChangelog: async (options) => {
        expect(options.invalidate).toBe(false);
        events.push("publish-changelog");
      },
      publishCoverage: async (options) => {
        expect(options.invalidate).toBe(false);
        events.push("publish-coverage");
      },
    },
  });

  expect(events[0]).toBe("check:/workspace/cipher-trace");
  expect(events.indexOf("publish-coverage")).toBeGreaterThan(
    events.indexOf("build-coverage:2026-08-27T00:00:00.000Z"),
  );
  expect(events.indexOf("publish-changelog")).toBeGreaterThan(
    events.indexOf("build-changelog:2026-08-27T00:00:00.000Z"),
  );
  expect(events.at(-1)).toBe("invalidate");
});

test("does not publish when either artifact build fails", async (): Promise<void> => {
  const events: string[] = [];
  let failure: unknown;
  try {
    await publishReleaseArtifacts({
      dependencies: {
        buildChangelogArtifact: async () => {
          throw new Error("changelog build failed");
        },
        checkReleaseVersion: () => undefined,
        prepareCoveragePublication: async () => {
          events.push("build-coverage");
          return { json: "", pdf: "", updatedAt: "" };
        },
        publishChangelog: async () => {
          events.push("publish-changelog");
        },
        publishCoverage: async () => {
          events.push("publish-coverage");
        },
      },
    });
  } catch (error) {
    failure = error;
  }
  expect(failure).toBeInstanceOf(Error);
  if (failure instanceof Error) expect(failure.message).toBe("changelog build failed");
  expect(events).toEqual(["build-coverage"]);
});
