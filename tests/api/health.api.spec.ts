import { test, expect } from "@playwright/test";

test.describe("Health check", () => {
  test("GET /api/health returns 200", { tag: ["@smoke", "@api", "@health"] }, async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.status()).toBe(200);
  });

  test("GET /api/health reports status ok (database reachable)", { tag: ["@regression", "@api", "@health"] }, async ({ request }) => {
    const body = await (await request.get("/api/health")).json();
    expect(body.status).toBe("ok");
  });
});
