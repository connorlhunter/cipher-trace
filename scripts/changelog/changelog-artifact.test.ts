import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { expect, test } from "bun:test";

import { assertCurrentRelease, buildChangelogArtifact, parseChangelog } from "./changelog-artifact";

const changelog = `# Changelog

## [0.1.0-alpha.2] - 2026-08-26

### Added

- Publish the canonical changelog as Markdown and PDF.

### Fixed

- Keep generated artifacts in the project namespace.
`;

test("parses and builds the canonical changelog artifact pair", async (): Promise<void> => {
  const workspaceRoot = mkdtempSync(join(tmpdir(), "cipher-trace-changelog-"));
  writeFileSync(join(workspaceRoot, "package.json"), JSON.stringify({ version: "0.1.0-alpha.2" }));
  writeFileSync(join(workspaceRoot, "CHANGELOG.md"), changelog);

  const paths = await buildChangelogArtifact(workspaceRoot, "2026-08-26T12:00:00.000Z");

  expect(parseChangelog(changelog)).toEqual([
    {
      date: "2026-08-26",
      sections: [
        {
          entries: ["Publish the canonical changelog as Markdown and PDF."],
          title: "Added",
        },
        {
          entries: ["Keep generated artifacts in the project namespace."],
          title: "Fixed",
        },
      ],
      version: "0.1.0-alpha.2",
    },
  ]);
  expect(readFileSync(paths.markdown, "utf8")).toBe(changelog);
  expect(existsSync(paths.pdf)).toBe(true);
  expect(readFileSync(paths.pdf).subarray(0, 4).toString()).toBe("%PDF");
});

test("requires the first changelog release to match the package version", (): void => {
  expect(() => assertCurrentRelease("0.1.0-alpha.3", parseChangelog(changelog))).toThrow(
    "CHANGELOG.md must begin with 0.1.0-alpha.3.",
  );
});
