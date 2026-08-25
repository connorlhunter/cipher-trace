import { join } from "node:path";

import { expect, test } from "bun:test";

import { coveragePaths } from "./coverage-paths";

test("resolves overview, TypeScript, and Python coverage files", (): void => {
  expect(coveragePaths("/workspace/cipher-trace")).toEqual({
    directory: join("/workspace/cipher-trace", "coverage"),
    pythonLcov: join("/workspace/cipher-trace", "coverage", "python.lcov"),
    typescriptLcov: join("/workspace/cipher-trace", "coverage", "lcov.info"),
    overview: {
      html: join("/workspace/cipher-trace", "coverage", "index.html"),
      pdf: join("/workspace/cipher-trace", "coverage", "index.pdf"),
    },
    python: {
      html: join("/workspace/cipher-trace", "coverage", "python", "index.html"),
      pdf: join("/workspace/cipher-trace", "coverage", "python", "index.pdf"),
    },
    typescript: {
      html: join(
        "/workspace/cipher-trace",
        "coverage",
        "typescript",
        "index.html",
      ),
      pdf: join(
        "/workspace/cipher-trace",
        "coverage",
        "typescript",
        "index.pdf",
      ),
    },
  });
});
