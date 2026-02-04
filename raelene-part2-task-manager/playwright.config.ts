import { defineConfig, devices } from "@playwright/test";

/*
  Optional: load environment variables from a .env file
  Only enable if project uses .env.
*/
// import dotenv from "dotenv";
// import path from "path";
// dotenv.config({ path: path.resolve(__dirname, ".env") });

export default defineConfig({
  // Where Playwright test files live
  testDir: "./e2e",

  /*
    fullyParallel controls whether tests in the same file can run in parallel.
    current setting is false, so tests run in a more predictable order.
    This reduces flaky timing issues for beginners.
  */
  fullyParallel: false,

  /*
    On CI (GitHub Actions/Jenkins), fail if someone accidentally wrote test.only
    This prevents “only one test ran” mistakes in the pipeline.
  */
  forbidOnly: !!process.env.CI,

  /*
    Retries help reduce flaky failures on CI.
    Locally: 0 retries (fail fast)
    On CI: retry up to 2 times
  */
  retries: process.env.CI ? 2 : 0,

  /*
    Number of workers (parallel processes).
    r current setting is 1, so Playwright runs everything in a single worker.
    This is stable and avoids race conditions for file-based apps (like JSON files).
  */
  workers: 1,

  /*
    HTML report is generated after the run.
     can view it with:
    npx playwright show-report
  */
  reporter: "html",

  /*
    Shared settings applied to all browsers (projects) below.
  */
  use: {
    /*
      Trace is saved on the first retry.
      This helps debug why a test failed on CI.
    */
    trace: "on-first-retry",

    /*
      want to SEE the browser while testing (debugging), uncomment:
      headless: false,
    */
    // headless: false,
  },

  /*
    Run the same tests across these 3 browsers.
    This matches current setup:Chromium + Firefox + WebKit.
  */
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },

  ],

  /*
    Starts app before tests run.
    - command: how to start r server
    - url: the URL Playwright waits for before running tests
    - reuseExistingServer: if server is already running locally, do not start a new one
  */
  webServer: {
    command: "node index.js",
    url: "http://localhost:5050",
    reuseExistingServer: !process.env.CI,
  },
});
