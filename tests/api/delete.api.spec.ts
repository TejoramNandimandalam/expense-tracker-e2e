import { test, expect } from "../fixtures";
import { listExpenses } from "../helpers/api";

test.describe("DELETE /api/expenses/:id", () => {
  test("deletes an expense and returns 200", { tag: ["@smoke", "@api", "@delete"] }, async ({ request, tracker }) => {
    const saved = await tracker.create();
    const res = await request.delete(`/api/expenses/${saved.id}`);
    expect(res.status()).toBe(200);
    expect((await res.json()).message).toBe("Deleted");
  });

  test("the deleted expense is gone from the list", { tag: ["@regression", "@api", "@delete"] }, async ({ request, tracker }) => {
    const saved = await tracker.create();
    await request.delete(`/api/expenses/${saved.id}`);
    const all = await listExpenses(request);
    expect(all.map((e) => e.id)).not.toContain(saved.id);
  });

  test("returns 404 when the id does not exist", { tag: ["@regression", "@api", "@delete"] }, async ({ request }) => {
    const res = await request.delete("/api/expenses/999999999");
    expect(res.status()).toBe(404);
    expect((await res.json()).error).toBe("Expense not found");
  });

  test("deleting the same expense twice gives 404 the second time", { tag: ["@regression", "@api", "@delete"] }, async ({ request, tracker }) => {
    const saved = await tracker.create();
    expect((await request.delete(`/api/expenses/${saved.id}`)).status()).toBe(200);
    expect((await request.delete(`/api/expenses/${saved.id}`)).status()).toBe(404);
  });

  test("returns 400 when the id is not a number", { tag: ["@regression", "@api", "@delete", "@v2"] }, async ({ request }) => {
    const res = await request.delete("/api/expenses/abc");
    expect(res.status()).toBe(400);
  });
});
