import { test, expect } from "../fixtures";
import { ExpensePage } from "../pages/expense.page";

test.describe("Category filter (UI, release 2)", () => {
  test("the filter offers All plus the four categories", { tag: ["@regression", "@browser", "@filter", "@v2"] }, async ({ page }) => {
    const app = new ExpensePage(page);
    await app.goto();
    const options = await app.filter.locator("option").allTextContents();
    expect(options).toEqual(["All", "Food", "Travel", "Bills", "Other"]);
  });

  test("choosing a category shows only that category", { tag: ["@smoke", "@browser", "@filter", "@v2"] }, async ({ page, tracker }) => {
    const food = await tracker.create({ category: "Food" });
    const travel = await tracker.create({ category: "Travel" });
    const app = new ExpensePage(page);
    await app.goto();
    await app.filter.selectOption("Travel");
    await expect(app.row(travel.title)).toBeVisible();
    await expect(app.row(food.title)).toHaveCount(0);
  });

  test("the total follows the filter", { tag: ["@regression", "@browser", "@filter", "@v2"] }, async ({ page, tracker }) => {
    await tracker.cleanDb();
    await tracker.create({ category: "Food", amount: 100 });
    await tracker.create({ category: "Travel", amount: 40 });
    const app = new ExpensePage(page);
    await app.goto();
    await expect(app.total).toHaveText("140");
    await app.filter.selectOption("Travel");
    await expect(app.total).toHaveText("40");
  });

  test("the count follows the filter", { tag: ["@regression", "@browser", "@filter", "@v2"] }, async ({ page, tracker }) => {
    await tracker.cleanDb();
    await tracker.create({ category: "Food" });
    await tracker.create({ category: "Food" });
    await tracker.create({ category: "Bills" });
    const app = new ExpensePage(page);
    await app.goto();
    await expect(app.count).toHaveText("3");
    await app.filter.selectOption("Food");
    await expect(app.count).toHaveText("2");
  });

  test("choosing All brings every row back", { tag: ["@regression", "@browser", "@filter", "@v2"] }, async ({ page, tracker }) => {
    const food = await tracker.create({ category: "Food" });
    const travel = await tracker.create({ category: "Travel" });
    const app = new ExpensePage(page);
    await app.goto();
    await app.filter.selectOption("Travel");
    await expect(app.row(food.title)).toHaveCount(0);
    await app.filter.selectOption("All");
    await expect(app.row(food.title)).toBeVisible();
    await expect(app.row(travel.title)).toBeVisible();
  });
});
