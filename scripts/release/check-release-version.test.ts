import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

import { expect, test } from "bun:test";

import { checkReleaseVersion, pythonReleaseVersion } from "./check-release-version";

test("requires every shipped version declaration to match", (): void => {
  const workspaceRoot = mkdtempSync(join(tmpdir(), "cipher-trace-release-"));
  writeReleaseFixture(workspaceRoot);

  expect(() => checkReleaseVersion(workspaceRoot)).not.toThrow();
  writeFileSync(join(workspaceRoot, "apps/api/app/main.py"), 'app = FastAPI(version="0.1.0a1")\n');
  expect(() => checkReleaseVersion(workspaceRoot)).toThrow(
    "apps/api/app/main.py must use release version 0.1.0a2.",
  );
});

test("maps npm prereleases to Python releases", (): void => {
  expect(pythonReleaseVersion("1.2.3-alpha.4")).toBe("1.2.3a4");
  expect(pythonReleaseVersion("1.2.3-beta.4")).toBe("1.2.3b4");
  expect(pythonReleaseVersion("1.2.3-rc.4")).toBe("1.2.3rc4");
  expect(pythonReleaseVersion("1.2.3")).toBe("1.2.3");
});

function writeReleaseFixture(workspaceRoot: string): void {
  const jsonManifests = [
    "package.json",
    "apps/web/package.json",
    "packages/typescript/trace-contracts/package.json",
  ];
  for (const manifest of jsonManifests)
    writeFile(workspaceRoot, manifest, JSON.stringify({ version: "0.1.0-alpha.2" }));
  for (const manifest of ["pyproject.toml", "packages/python/cipher-trace-core/pyproject.toml"])
    writeFile(workspaceRoot, manifest, 'version = "0.1.0a2"\n');
  writeFile(workspaceRoot, "apps/api/app/main.py", 'app = FastAPI(version="0.1.0a2")\n');
  writeFile(workspaceRoot, "CHANGELOG.md", "# Changelog\n\n## [0.1.0-alpha.2] - 2026-08-26\n");
}

function writeFile(workspaceRoot: string, path: string, content: string): void {
  const output = join(workspaceRoot, path);
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, content);
}
