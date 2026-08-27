import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { expect, test } from "bun:test";

import {
  coverageArtifact,
  coverageUpdatedAt,
  parseLcov,
  renderCoverageReport,
} from "./render-coverage-report";

test("writes one structured coverage artifact for TypeScript and Python", (): void => {
  const directory = mkdtempSync(join(tmpdir(), "cipher-trace-coverage-"));
  const typescriptLcovPath = join(directory, "typescript.lcov");
  const pythonLcovPath = join(directory, "python.lcov");
  writeFileSync(
    typescriptLcovPath,
    [
      "SF:packages/z.ts",
      "FNF:2",
      "FNH:2",
      "LF:4",
      "LH:4",
      "end_of_record",
      "SF:packages/a.ts",
      "FNF:1",
      "FNH:1",
      "LF:3",
      "LH:2",
      "end_of_record",
      "",
    ].join("\n"),
  );
  writeFileSync(
    pythonLcovPath,
    "SF:apps/api/app/main.py\nFNF:1\nFNH:1\nLF:2\nLH:2\nend_of_record\n",
  );

  expect(parseLcov(readFileSync(typescriptLcovPath, "utf8"))).toEqual([
    {
      functions: { covered: 2, found: 2 },
      lines: { covered: 4, found: 4 },
      path: "packages/z.ts",
    },
    {
      functions: { covered: 1, found: 1 },
      lines: { covered: 2, found: 3 },
      path: "packages/a.ts",
    },
  ]);

  const output = renderCoverageReport(
    typescriptLcovPath,
    pythonLcovPath,
    join(directory, "coverage"),
    "2026-08-25T14:42:31.123-04:00",
  );
  expect(JSON.parse(readFileSync(output, "utf8"))).toEqual(
    coverageArtifact(
      [
        {
          functions: { covered: 2, found: 2 },
          lines: { covered: 4, found: 4 },
          path: "packages/z.ts",
        },
        {
          functions: { covered: 1, found: 1 },
          lines: { covered: 2, found: 3 },
          path: "packages/a.ts",
        },
      ],
      [
        {
          functions: { covered: 1, found: 1 },
          lines: { covered: 2, found: 2 },
          path: "apps/api/app/main.py",
        },
      ],
      "2026-08-25T18:42:31.123Z",
    ),
  );
});

test("normalizes the project-owned coverage timestamp", (): void => {
  expect(coverageUpdatedAt("2026-08-25T14:42:31.123-04:00")).toBe("2026-08-25T18:42:31.123Z");
  expect((): string => coverageUpdatedAt("not-a-date")).toThrow(
    "Invalid coverage publication date",
  );
});
