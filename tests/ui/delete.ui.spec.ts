import { test, expect } from "../fixtures";
import { ExpensePage } from "../pages/expense.page";

test.describe("Delete expense (UI)", () => {
  test("deleting removes the row", { tag: ["@smoke", "@browser", "@delete"] }, async ({ page, tracker }) => {
    const saved = await tracker.create();
    const app = new ExpensePage(page);
    await app.goto();
    await expect(app.row(saved.title)).toBeVisible();
    await app.deleteRow(saved.title);
    await expect(app.row(saved.title)).toHaveCount(0);
  });

  test("the total goes down after deleting", { tag: ["@regression", "@browser", "@delete"] }, async ({ page, tracker }) => {
    await tracker.cleanDb();
    const keep = await tracker.create({ amount: 100 });
    const remove = await tracker.create({ amount: 40 });
    const app = new ExpensePage(page);
    await app.goto();
    await expect(app.total).toHaveText("140");
    await app.deleteRow(remove.title);
    await expect(app.total).toHaveText("100");
    await expect(app.row(keep.title)).toBeVisible();
  });

  test("shows 'No expenses yet' after the last one is deleted", { tag: ["@regression", "@browser", "@delete"] }, async ({ page, tracker }) => {
    await tracker.cleanDb();
    const only = await tracker.create();
    const app = new ExpensePage(page);
    await app.goto();
    await app.deleteRow(only.title);
    await expect(app.emptyMessage).toBeVisible();
  });

  test("deleting one expense keeps the other", { tag: ["@regression", "@browser", "@delete"] }, async ({ page, tracker }) => {
    const first = await tracker.create();
    const second = await tracker.create();
    const app = new ExpensePage(page);
    await app.goto();
    await app.deleteRow(first.title);
    await expect(app.row(first.title)).toHaveCount(0);
    await expect(app.row(second.title)).toBeVisible();
  });
});
