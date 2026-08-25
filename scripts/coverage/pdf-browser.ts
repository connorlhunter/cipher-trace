import type { LaunchOptions } from "puppeteer";

/** Returns browser options for local and hosted PDF rendering. */
export function pdfBrowserLaunchOptions(
  continuousIntegration: boolean,
): LaunchOptions {
  return {
    args: continuousIntegration
      ? ["--no-sandbox", "--disable-setuid-sandbox"]
      : [],
    headless: true,
  };
}
