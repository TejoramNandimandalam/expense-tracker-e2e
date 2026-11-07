import { test, expect } from "../fixtures";

test.describe("GET /api/summary (release 3)", () => {
  test("returns total and count for each category", { tag: ["@smoke", "@api", "@summary", "@v3"] }, async ({ request, tracker }) => {
    await tracker.cleanDb();
    await tracker.create({ category: "Food", amount: 100 });
    await tracker.create({ category: "Food", amount: 50 });
    await tracker.create({ category: "Travel", amount: 25 });
    const body = await (await request.get("/api/summary")).json();
    expect(body.total).toBe(175);
    expect(body.categories).toEqual([
      { category: "Food", total: 150, count: 2 },
      { category: "Travel", total: 25, count: 1 },
    ]);
  });

  test("the grand total equals the sum of the category totals", { tag: ["@regression", "@api", "@summary", "@v3"] }, async ({ request, tracker }) => {
    await tracker.create({ category: "Bills", amount: 40.5 });
    const body = await (await request.get("/api/summary")).json();
    const sum = body.categories.reduce((s: number, c: { total: number }) => s + c.total, 0);
    expect(body.total).toBeCloseTo(sum, 2);
  });

  test("returns total 0 and no categories when there are no expenses", { tag: ["@regression", "@api", "@summary", "@v3"] }, async ({ request, tracker }) => {
    await tracker.cleanDb();
    const body = await (await request.get("/api/summary")).json();
    expect(body).toEqual({ total: 0, categories: [] });
  });
});
