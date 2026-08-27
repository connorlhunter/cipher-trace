import { join } from "node:path";

import { expect, test } from "bun:test";

import { coveragePaths } from "./coverage-paths";

test("resolves LCOV inputs and the published coverage pair", (): void => {
  expect(coveragePaths("/workspace/cipher-trace")).toEqual({
    directory: join("/workspace/cipher-trace", "coverage"),
    json: join("/workspace/cipher-trace", "coverage", "index.json"),
    pdf: join("/workspace/cipher-trace", "coverage", "coverage.pdf"),
    pythonLcov: join("/workspace/cipher-trace", "coverage", "python.lcov"),
    typescriptLcov: join("/workspace/cipher-trace", "coverage", "lcov.info"),
  });
});
