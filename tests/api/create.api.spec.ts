import { test, expect } from "../fixtures";
import { validExpense, uniqueTitle } from "../helpers/data";
import { listExpenses } from "../helpers/api";

test.describe("POST /api/expenses - create", () => {
  test("creates an expense and returns 201 with its fields", { tag: ["@smoke", "@api", "@add"] }, async ({ request, tracker }) => {
    const data = validExpense({ amount: 250, category: "Travel", date: "2026-10-07" });
    const res = await request.post("/api/expenses", { data });
    expect(res.status()).toBe(201);
    const body = await res.json();
    tracker.trackTitle(data.title);
    expect(body).toMatchObject({ title: data.title, amount: 250, category: "Travel", date: "2026-10-07" });
    expect(typeof body.id).toBe("number");
  });

  test("gives each new expense a higher id", { tag: ["@regression", "@api", "@add"] }, async ({ tracker }) => {
    const first = await tracker.create();
    const second = await tracker.create();
    expect(second.id).toBeGreaterThan(first.id);
  });

  test("returns amount as a number, not text", { tag: ["@regression", "@api", "@add"] }, async ({ tracker }) => {
    const saved = await tracker.create({ amount: "75.5" });
    expect(typeof saved.amount).toBe("number");
    expect(saved.amount).toBe(75.5);
  });

  test("trims spaces around the title", { tag: ["@regression", "@api", "@add", "@v2"] }, async ({ request, tracker }) => {
    const title = uniqueTitle("Padded");
    const res = await request.post("/api/expenses", { data: validExpense({ title: `   ${title}   ` }) });
    expect(res.status()).toBe(201);
    tracker.trackTitle(title);
    expect((await res.json()).title).toBe(title);
  });

  test("keeps two decimal places in the amount", { tag: ["@regression", "@api", "@add"] }, async ({ tracker }) => {
    const saved = await tracker.create({ amount: 12.34 });
    expect(saved.amount).toBe(12.34);
  });

  test("the new expense shows up in the list", { tag: ["@regression", "@api", "@add"] }, async ({ request, tracker }) => {
    const saved = await tracker.create();
    const all = await listExpenses(request);
    expect(all.map((e) => e.id)).toContain(saved.id);
  });

  test("returns the date as a plain YYYY-MM-DD string", { tag: ["@regression", "@api", "@add"] }, async ({ tracker }) => {
    const saved = await tracker.create({ date: "2026-01-31" });
    expect(saved.date).toBe("2026-01-31");
  });
});
