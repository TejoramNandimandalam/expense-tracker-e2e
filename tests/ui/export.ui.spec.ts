import { test, expect } from "../fixtures";
import { ExpensePage } from "../pages/expense.page";
import { readFile } from "node:fs/promises";

test.describe("Export CSV (UI, release 4)", () => {
  test("the Export CSV button is visible", { tag: ["@smoke", "@browser", "@export", "@v4"] }, async ({ page }) => {
    const app = new ExpensePage(page);
    await app.goto();
    await expect(page.getByTestId("export-button")).toBeVisible();
    await expect(page.getByTestId("export-button")).toHaveText("Export CSV");
  });

  test("the button points to /api/export", { tag: ["@regression", "@browser", "@export", "@v4"] }, async ({ page }) => {
    const app = new ExpensePage(page);
    await app.goto();
    await expect(page.getByTestId("export-button")).toHaveAttribute("href", "/api/export");
  });

  test("the button follows the selected category", { tag: ["@regression", "@browser", "@export", "@v4"] }, async ({ page }) => {
    const app = new ExpensePage(page);
    await app.goto();
    await app.filter.selectOption("Travel");
    await expect(page.getByTestId("export-button")).toHaveAttribute("href", "/api/export?category=Travel");
  });

  test("clicking the button downloads expenses.csv", { tag: ["@regression", "@browser", "@export", "@v4"] }, async ({ page }) => {
    const app = new ExpensePage(page);
    await app.goto();
    const [download] = await Promise.all([page.waitForEvent("download"), page.getByTestId("export-button").click()]);
    expect(download.suggestedFilename()).toBe("expenses.csv");
  });

  test("the downloaded file contains the header and the expense", { tag: ["@regression", "@browser", "@export", "@v4"] }, async ({ page, tracker }) => {
    const saved = await tracker.create({ amount: 99 });
    const app = new ExpensePage(page);
    await app.goto();
    await expect(app.row(saved.title)).toBeVisible();
    const [download] = await Promise.all([page.waitForEvent("download"), page.getByTestId("export-button").click()]);
    const text = await readFile((await download.path()) as string, "utf8");
    expect(text.split("\n")[0]).toBe("id,title,amount,category,date");
    expect(text).toContain(saved.title);
  });

  test("with a category selected only that category is downloaded", { tag: ["@regression", "@browser", "@export", "@v4"] }, async ({ page, tracker }) => {
    const food = await tracker.create({ category: "Food" });
    const travel = await tracker.create({ category: "Travel" });
    const app = new ExpensePage(page);
    await app.goto();
    await expect(app.row(travel.title)).toBeVisible();
    await app.filter.selectOption("Travel");
    const [download] = await Promise.all([page.waitForEvent("download"), page.getByTestId("export-button").click()]);
    const text = await readFile((await download.path()) as string, "utf8");
    expect(text).toContain(travel.title);
    expect(text).not.toContain(food.title);
  });
});
