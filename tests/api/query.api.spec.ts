import { test, expect } from "../fixtures";
import { uniqueTitle } from "../helpers/data";
import { listExpenses } from "../helpers/api";

test.describe("GET /api/expenses - filter, search, sort", () => {
  test("?category= returns only that category", { tag: ["@regression", "@api", "@filter", "@v2"] }, async ({ request, tracker }) => {
    const food = await tracker.create({ category: "Food" });
    const travel = await tracker.create({ category: "Travel" });
    const rows = await listExpenses(request, "?category=Travel");
    expect(rows.every((r) => r.category === "Travel")).toBe(true);
    const ids = rows.map((r) => r.id);
    expect(ids).toContain(travel.id);
    expect(ids).not.toContain(food.id);
  });

  test("?category= with an unused category returns an empty list", { tag: ["@regression", "@api", "@filter", "@v2"] }, async ({ request }) => {
    expect(await listExpenses(request, "?category=NoSuchCategory")).toEqual([]);
  });

  test("?q= search ignores upper/lower case", { tag: ["@regression", "@api", "@search", "@v3"] }, async ({ request, tracker }) => {
    const saved = await tracker.create({ title: uniqueTitle("Coffee") });
    const rows = await listExpenses(request, `?q=${encodeURIComponent(saved.title.toUpperCase())}`);
    expect(rows.map((r) => r.id)).toEqual([saved.id]);
  });

  test("?q= with no match returns an empty list", { tag: ["@regression", "@api", "@search", "@v3"] }, async ({ request }) => {
    expect(await listExpenses(request, "?q=zzz-no-match-zzz")).toEqual([]);
  });

  test("?sort=amount-desc puts the biggest amount first", { tag: ["@regression", "@api", "@sort", "@v3"] }, async ({ request, tracker }) => {
    const prefix = uniqueTitle("Sort");
    await tracker.create({ title: `${prefix}-a`, amount: 10 });
    await tracker.create({ title: `${prefix}-b`, amount: 30 });
    await tracker.create({ title: `${prefix}-c`, amount: 20 });
    const rows = await listExpenses(request, `?q=${prefix}&sort=amount-desc`);
    expect(rows.map((r) => r.amount)).toEqual([30, 20, 10]);
  });

  test("?sort=amount-asc puts the smallest amount first", { tag: ["@regression", "@api", "@sort", "@v3"] }, async ({ request, tracker }) => {
    const prefix = uniqueTitle("Sort");
    await tracker.create({ title: `${prefix}-a`, amount: 10 });
    await tracker.create({ title: `${prefix}-b`, amount: 30 });
    await tracker.create({ title: `${prefix}-c`, amount: 20 });
    const rows = await listExpenses(request, `?q=${prefix}&sort=amount-asc`);
    expect(rows.map((r) => r.amount)).toEqual([10, 20, 30]);
  });

  test("an unknown sort value returns 400", { tag: ["@regression", "@api", "@sort", "@v3"] }, async ({ request }) => {
    const res = await request.get("/api/expenses?sort=colour");
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toBe("Invalid sort");
  });

  test("GET /api/expenses/:id returns 404 for an unknown id", { tag: ["@regression", "@api", "@add", "@v2"] }, async ({ request }) => {
    const res = await request.get("/api/expenses/999999999");
    expect(res.status()).toBe(404);
  });
});
