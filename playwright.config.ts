import { defineConfig, devices } from "@playwright/test";
import { existsSync } from "node:fs";

// Which environment to test: development | uat | qa | prod
const env = process.env.TEST_ENV ?? "development";

// Load BASE_URL from .env.<env>. In CI the URL is passed directly, so the file is optional.
if (!process.env.BASE_URL && existsSync(`.env.${env}`)) {
  process.loadEnvFile(`.env.${env}`);
}

// Which release of the app is deployed there (1, 2 or 3).
// Tests tagged with a newer release are skipped automatically.
const release = Number(process.env.APP_RELEASE ?? "3");
const newerReleases = [2, 3].filter((r) => r > release).map((r) => `@v${r}`);

// Vercel preview URLs are protected. If a bypass secret is given, send it with every request.
const bypass = process.env.VERCEL_BYPASS_SECRET;

export default defineConfig({
  testDir: "./tests",
  // Tests share one database, so run them one at a time
  workers: 1,
  fullyParallel: false,
  // Live sites and cloud databases can be slow: wait up to 10s for each check
  expect: { timeout: 10_000 },
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  grepInvert: newerReleases.length ? new RegExp(newerReleases.join("|")) : undefined,
  use: {
    baseURL: process.env.BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    extraHTTPHeaders: bypass
      ? { "x-vercel-protection-bypass": bypass, "x-vercel-set-bypass-cookie": "true" }
      : undefined,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
