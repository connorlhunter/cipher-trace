import { createWriteStream, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import PDFDocument from "pdfkit";

export interface ChangelogSection {
  readonly entries: ReadonlyArray<string>;
  readonly title: string;
}

export interface ChangelogRelease {
  readonly date: string;
  readonly sections: ReadonlyArray<ChangelogSection>;
  readonly version: string;
}

export interface ChangelogPaths {
  readonly directory: string;
  readonly markdown: string;
  readonly pdf: string;
}

const releaseHeading = /^##\s+\[?([^\]\s]+)\]?\s+-\s+(\d{4}-\d{2}-\d{2})\s*$/u;
const sectionHeading = /^###\s+(.+?)\s*$/u;
const entryLine = /^\s*[-*]\s+(.+?)\s*$/u;

/** Resolves the local changelog publication directory. */
export function changelogPaths(workspaceRoot = process.cwd()): ChangelogPaths {
  const directory = join(workspaceRoot, "changelog");
  return {
    directory,
    markdown: join(directory, "CHANGELOG.md"),
    pdf: join(directory, "changelog.pdf"),
  };
}

/** Parses canonical CHANGELOG.md without creating a second release source. */
export function parseChangelog(markdown: string): ChangelogRelease[] {
  const releases: Array<{
    date: string;
    sections: ChangelogSection[];
    version: string;
  }> = [];
  let release: { date: string; sections: ChangelogSection[]; version: string } | undefined;
  let section: { entries: string[]; title: string } | undefined;
  for (const line of markdown.split(/\r?\n/u)) {
    const match = releaseHeading.exec(line);
    if (match) {
      release = { date: match[2] ?? "", sections: [], version: match[1] ?? "" };
      releases.push(release);
      section = undefined;
      continue;
    }
    if (!release) continue;
    const heading = sectionHeading.exec(line);
    if (heading) {
      section = { entries: [], title: heading[1] ?? "Changes" };
      release.sections.push(section);
      continue;
    }
    const entry = entryLine.exec(line);
    if (entry) {
      const target = section ?? { entries: [], title: "Changes" };
      if (!section) {
        release.sections.push(target);
        section = target;
      }
      target.entries.push(entry[1] ?? "");
    }
  }
  if (releases.length === 0) throw new Error("CHANGELOG.md does not contain a release heading.");
  return releases;
}

/** Requires the package release and the first changelog release to agree. */
export function assertCurrentRelease(
  version: string,
  releases: ReadonlyArray<ChangelogRelease>,
): void {
  if (releases[0]?.version !== version) throw new Error(`CHANGELOG.md must begin with ${version}.`);
}

/** Builds Markdown and PDF changelog artifacts from the canonical source file. */
export async function buildChangelogArtifact(
  workspaceRoot = process.cwd(),
  publishedAt = new Date().toISOString(),
): Promise<ChangelogPaths> {
  const paths = changelogPaths(workspaceRoot);
  const packageJson = JSON.parse(readFileSync(join(workspaceRoot, "package.json"), "utf8")) as {
    version: string;
  };
  const markdown = readFileSync(join(workspaceRoot, "CHANGELOG.md"), "utf8");
  const releases = parseChangelog(markdown);
  assertCurrentRelease(packageJson.version, releases);
  const normalizedPublishedAt = new Date(publishedAt).toISOString();
  rmSync(paths.directory, { force: true, recursive: true });
  mkdirSync(paths.directory, { recursive: true });
  writeFileSync(paths.markdown, markdown);
  await new Promise<void>((resolve, reject) => {
    const document = new PDFDocument({
      info: { Title: "Cipher Trace Changelog" },
      margin: 48,
      size: "LETTER",
    });
    const stream = createWriteStream(paths.pdf);
    document.pipe(stream);
    stream.on("finish", resolve);
    stream.on("error", reject);
    document
      .font("Helvetica-Bold")
      .fontSize(22)
      .fillColor("#17202a")
      .text("Cipher Trace Changelog");
    document
      .moveDown(0.35)
      .font("Helvetica")
      .fontSize(10)
      .fillColor("#667085")
      .text(`Published ${normalizedPublishedAt}`);
    for (const release of releases) {
      document
        .moveDown(0.9)
        .font("Helvetica-Bold")
        .fontSize(14)
        .fillColor("#0f6b7a")
        .text(`v${release.version}`);
      document
        .moveDown(0.2)
        .font("Helvetica")
        .fontSize(10)
        .fillColor("#667085")
        .text(`Released ${release.date}`);
      for (const releaseSection of release.sections) {
        document
          .moveDown(0.55)
          .font("Helvetica-Bold")
          .fontSize(11)
          .fillColor("#17202a")
          .text(releaseSection.title);
        for (const entry of releaseSection.entries)
          document.moveDown(0.2).font("Helvetica").fontSize(10).text(`• ${entry}`);
      }
    }
    document.end();
  });
  return paths;
}

if (import.meta.main) {
  try {
    await buildChangelogArtifact();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
