import { test, expect } from "../fixtures";
import { uniqueTitle } from "../helpers/data";
import { listExpenses } from "../helpers/api";

test.describe("PUT /api/expenses/:id - edit (release 2)", () => {
  test("updates all fields of an expense", { tag: ["@smoke", "@api", "@edit", "@v2"] }, async ({ request, tracker }) => {
    const saved = await tracker.create();
    const title = uniqueTitle("Edited");
    const res = await request.put(`/api/expenses/${saved.id}`, {
      data: { title, amount: 999, category: "Bills", date: "2026-11-01" },
    });
    expect(res.status()).toBe(200);
    expect(await res.json()).toMatchObject({ id: saved.id, title, amount: 999, category: "Bills", date: "2026-11-01" });
  });

  test("the change is saved (GET by id shows it)", { tag: ["@regression", "@api", "@edit", "@v2"] }, async ({ request, tracker }) => {
    const saved = await tracker.create({ amount: 10 });
    await request.put(`/api/expenses/${saved.id}`, {
      data: { title: saved.title, amount: 20, category: saved.category, date: saved.date },
    });
    const body = await (await request.get(`/api/expenses/${saved.id}`)).json();
    expect(body.amount).toBe(20);
  });

  test("returns 404 when the id does not exist", { tag: ["@regression", "@api", "@edit", "@v2"] }, async ({ request }) => {
    const res = await request.put("/api/expenses/999999999", {
      data: { title: "x", amount: 5, category: "Food", date: "2026-10-06" },
    });
    expect(res.status()).toBe(404);
    expect((await res.json()).error).toBe("Expense not found");
  });

  test("returns 400 for invalid data and leaves the expense unchanged", { tag: ["@regression", "@api", "@edit", "@v2"] }, async ({ request, tracker }) => {
    const saved = await tracker.create({ amount: 50 });
    const res = await request.put(`/api/expenses/${saved.id}`, {
      data: { title: saved.title, amount: -1, category: saved.category, date: saved.date },
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toBe("Amount must be greater than 0");
    const body = await (await request.get(`/api/expenses/${saved.id}`)).json();
    expect(body.amount).toBe(50);
  });

  test("returns 400 when the id is not a number", { tag: ["@regression", "@api", "@edit", "@v2"] }, async ({ request }) => {
    const res = await request.put("/api/expenses/abc", {
      data: { title: "x", amount: 5, category: "Food", date: "2026-10-06" },
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toBe("Invalid id");
  });

  test("editing does not add a new row", { tag: ["@regression", "@api", "@edit", "@v2"] }, async ({ request, tracker }) => {
    const saved = await tracker.create();
    const before = (await listExpenses(request)).length;
    await request.put(`/api/expenses/${saved.id}`, {
      data: { title: saved.title, amount: 77, category: saved.category, date: saved.date },
    });
    expect((await listExpenses(request)).length).toBe(before);
  });
});
