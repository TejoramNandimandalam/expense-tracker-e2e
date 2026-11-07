import { test, expect } from "../fixtures";
import { ExpensePage } from "../pages/expense.page";
import { uniqueTitle } from "../helpers/data";

test.describe("Search and sort (UI, release 3)", () => {
  test("typing in search shows only matching titles", { tag: ["@regression", "@browser", "@search", "@v3"] }, async ({ page, tracker }) => {
    const coffee = await tracker.create({ title: uniqueTitle("Coffee") });
    const taxi = await tracker.create({ title: uniqueTitle("Taxi") });
    const app = new ExpensePage(page);
    await app.goto();
    await app.search.fill(coffee.title);
    await expect(app.row(coffee.title)).toBeVisible();
    await expect(app.row(taxi.title)).toHaveCount(0);
  });

  test("shows 'No matching expenses' when nothing matches", { tag: ["@regression", "@browser", "@search", "@v3"] }, async ({ page, tracker }) => {
    await tracker.create();
    const app = new ExpensePage(page);
    await app.goto();
    await app.search.fill("zzz-no-match-zzz");
    await expect(app.emptyMessage).toHaveText("No matching expenses");
  });

  test("clearing the search brings the rows back", { tag: ["@regression", "@browser", "@search", "@v3"] }, async ({ page, tracker }) => {
    const a = await tracker.create({ title: uniqueTitle("Alpha") });
    const b = await tracker.create({ title: uniqueTitle("Beta") });
    const app = new ExpensePage(page);
    await app.goto();
    await app.search.fill(a.title);
    await expect(app.row(b.title)).toHaveCount(0);
    await app.search.fill("");
    await expect(app.row(a.title)).toBeVisible();
    await expect(app.row(b.title)).toBeVisible();
  });

  test("sort 'high to low' orders rows by amount, biggest first", { tag: ["@smoke", "@browser", "@sort", "@v3"] }, async ({ page, tracker }) => {
    const prefix = uniqueTitle("Sort");
    await tracker.create({ title: `${prefix}-a`, amount: 10 });
    await tracker.create({ title: `${prefix}-b`, amount: 30 });
    await tracker.create({ title: `${prefix}-c`, amount: 20 });
    const app = new ExpensePage(page);
    await app.goto();
    await app.search.fill(prefix);
    await app.sort.selectOption("amount-desc");
    await expect(app.items).toHaveCount(3);
    await expect(app.items.nth(0)).toContainText(`${prefix}-b`);
    await expect(app.items.nth(1)).toContainText(`${prefix}-c`);
    await expect(app.items.nth(2)).toContainText(`${prefix}-a`);
  });

  test("sort 'low to high' orders rows by amount, smallest first", { tag: ["@regression", "@browser", "@sort", "@v3"] }, async ({ page, tracker }) => {
    const prefix = uniqueTitle("Sort");
    await tracker.create({ title: `${prefix}-a`, amount: 10 });
    await tracker.create({ title: `${prefix}-b`, amount: 30 });
    await tracker.create({ title: `${prefix}-c`, amount: 20 });
    const app = new ExpensePage(page);
    await app.goto();
    await app.search.fill(prefix);
    await app.sort.selectOption("amount-asc");
    await expect(app.items).toHaveCount(3);
    await expect(app.items.nth(0)).toContainText(`${prefix}-a`);
    await expect(app.items.nth(1)).toContainText(`${prefix}-c`);
    await expect(app.items.nth(2)).toContainText(`${prefix}-b`);
  });
});
