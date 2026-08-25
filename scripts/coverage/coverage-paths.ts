import { resolve } from "node:path";

/** Fixed paths for Cipher Trace's multi-page coverage publication. */
export interface CoveragePaths {
  readonly directory: string;
  readonly pythonLcov: string;
  readonly typescriptLcov: string;
  readonly overview: CoveragePagePaths;
  readonly python: CoveragePagePaths;
  readonly typescript: CoveragePagePaths;
}

/** HTML and PDF destinations for one coverage page. */
export interface CoveragePagePaths {
  readonly html: string;
  readonly pdf: string;
}

/** Resolves coverage inputs and publication pages beneath a workspace. */
export function coveragePaths(workspaceRoot = process.cwd()): CoveragePaths {
  const directory = resolve(workspaceRoot, "coverage");
  const pythonDirectory = resolve(directory, "python");
  const typescriptDirectory = resolve(directory, "typescript");

  return {
    directory,
    pythonLcov: resolve(directory, "python.lcov"),
    typescriptLcov: resolve(directory, "lcov.info"),
    overview: {
      html: resolve(directory, "index.html"),
      pdf: resolve(directory, "index.pdf"),
    },
    python: {
      html: resolve(pythonDirectory, "index.html"),
      pdf: resolve(pythonDirectory, "index.pdf"),
    },
    typescript: {
      html: resolve(typescriptDirectory, "index.html"),
      pdf: resolve(typescriptDirectory, "index.pdf"),
    },
  };
}
