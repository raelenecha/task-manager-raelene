import { test } from "@playwright/test";
import fs from "fs/promises";
import path from "path";

const coverageDir = path.join(process.cwd(), "coverage", "temp");

test.beforeEach(async ({ page, browserName }) => {
  if (browserName === "chromium") {
    await page.coverage.startJSCoverage();
  }
});

test.afterEach(async ({ page, browserName }, testInfo) => {
  if (browserName !== "chromium") return;

  const coverage = await page.coverage.stopJSCoverage();

  // ensure folder exists
  try {
    await fs.mkdir(coverageDir, { recursive: true });
  } catch {}

  const safeName = testInfo.title.replace(/[\W_]+/g, "-");
  const filePath = path.join(coverageDir, `v8-coverage-${safeName}.json`);

  await fs.writeFile(filePath, JSON.stringify(coverage), "utf8");
});
