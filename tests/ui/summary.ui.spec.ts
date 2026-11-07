import { test, expect } from "../fixtures";
import { ExpensePage } from "../pages/expense.page";

test.describe("Category summary (UI, release 3)", () => {
  test("shows the total for each category", { tag: ["@regression", "@browser", "@summary", "@v3"] }, async ({ page, tracker }) => {
    await tracker.cleanDb();
    await tracker.create({ category: "Food", amount: 100 });
    await tracker.create({ category: "Food", amount: 50 });
    await tracker.create({ category: "Travel", amount: 25 });
    const app = new ExpensePage(page);
    await app.goto();
    await expect(app.summaryItems).toHaveCount(2);
    await expect(app.summaryItems.filter({ hasText: "Food" })).toContainText("150");
    await expect(app.summaryItems.filter({ hasText: "Travel" })).toContainText("25");
  });

  test("the summary ignores the category filter", { tag: ["@regression", "@browser", "@summary", "@v3"] }, async ({ page, tracker }) => {
    await tracker.cleanDb();
    await tracker.create({ category: "Food", amount: 100 });
    await tracker.create({ category: "Travel", amount: 25 });
    const app = new ExpensePage(page);
    await app.goto();
    await app.filter.selectOption("Travel");
    await expect(app.summaryItems).toHaveCount(2);
  });

  test("the summary is hidden when there are no expenses", { tag: ["@regression", "@browser", "@summary", "@v3"] }, async ({ page, tracker }) => {
    await tracker.cleanDb();
    const app = new ExpensePage(page);
    await app.goto();
    await expect(app.emptyMessage).toBeVisible();
    await expect(page.getByTestId("summary")).toHaveCount(0);
  });
});
