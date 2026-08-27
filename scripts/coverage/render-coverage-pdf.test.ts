import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

import { expect, test } from "bun:test";

import { coveragePaths } from "./coverage-paths";
import { renderCoveragePdfs } from "./render-coverage-pdf";

test("renders a coverage PDF from the structured artifact", async (): Promise<void> => {
  const workspaceRoot = mkdtempSync(join(tmpdir(), "cipher-trace-coverage-pdf-"));
  const paths = coveragePaths(workspaceRoot);
  mkdirSync(dirname(paths.json), { recursive: true });
  writeFileSync(
    paths.json,
    JSON.stringify({
      minimumCoverage: 95,
      schemaVersion: 2,
      surfaces: [
        {
          files: [],
          id: "typescript",
          label: "TypeScript",
          totals: {
            functions: { covered: 1, found: 1 },
            lines: { covered: 2, found: 2 },
            path: "All files",
          },
        },
      ],
      updatedAt: "2026-08-26T00:00:00.000Z",
    }),
  );

  await renderCoveragePdfs(workspaceRoot);

  expect(existsSync(paths.pdf)).toBe(true);
  expect(readFileSync(paths.pdf).subarray(0, 4).toString()).toBe("%PDF");
});
