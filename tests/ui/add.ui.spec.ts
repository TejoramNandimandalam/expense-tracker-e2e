import { test, expect } from "../fixtures";
import { ExpensePage } from "../pages/expense.page";
import { uniqueTitle } from "../helpers/data";

test.describe("Add expense (UI)", () => {
  test("page loads with the heading and the add form", { tag: ["@smoke", "@browser", "@add"] }, async ({ page }) => {
    const app = new ExpensePage(page);
    await app.goto();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Expense Tracker");
    await expect(page.getByTestId("title-input")).toBeVisible();
    await expect(page.getByTestId("add-button")).toBeVisible();
  });

  test("a new expense appears in the list", { tag: ["@smoke", "@browser", "@add"] }, async ({ page, tracker }) => {
    const app = new ExpensePage(page);
    const title = uniqueTitle("Lunch");
    tracker.trackTitle(title);
    await app.goto();
    await app.add({ title, amount: 250, category: "Food", date: "2026-10-06" });
    await expect(app.row(title)).toBeVisible();
    await expect(app.row(title)).toContainText("Food");
    await expect(app.row(title)).toContainText("250");
  });

  test("the form is cleared after adding", { tag: ["@regression", "@browser", "@add"] }, async ({ page, tracker }) => {
    const app = new ExpensePage(page);
    const title = uniqueTitle("Clear");
    tracker.trackTitle(title);
    await app.goto();
    await app.add({ title, amount: 10, date: "2026-10-06" });
    await expect(app.row(title)).toBeVisible();
    await expect(page.getByTestId("title-input")).toHaveValue("");
    await expect(page.getByTestId("amount-input")).toHaveValue("");
    await expect(page.getByTestId("date-input")).toHaveValue("");
  });

  test("the total adds up after each new expense", { tag: ["@regression", "@browser", "@add"] }, async ({ page, tracker }) => {
    await tracker.cleanDb();
    const app = new ExpensePage(page);
    await app.goto();
    const a = uniqueTitle("A");
    const b = uniqueTitle("B");
    await app.add({ title: a, amount: 250, date: "2026-10-06" });
    await expect(app.total).toHaveText("250");
    await app.add({ title: b, amount: 50, date: "2026-10-06" });
    await expect(app.total).toHaveText("300");
  });

  test("shows 'No expenses yet' when the list is empty", { tag: ["@regression", "@browser", "@add"] }, async ({ page, tracker }) => {
    await tracker.cleanDb();
    const app = new ExpensePage(page);
    await app.goto();
    await expect(app.emptyMessage).toHaveText("No expenses yet");
    await expect(app.total).toHaveText("0");
  });

  test("shows an error when the form is empty", { tag: ["@regression", "@browser", "@add", "@validation"] }, async ({ page }) => {
    const app = new ExpensePage(page);
    await app.goto();
    await page.getByTestId("add-button").click();
    await expect(app.error).toBeVisible();
  });

  test("shows the exact message when the amount is zero", { tag: ["@regression", "@browser", "@add", "@validation", "@v2"] }, async ({ page }) => {
    const app = new ExpensePage(page);
    await app.goto();
    await app.add({ title: uniqueTitle("Zero"), amount: 0, date: "2026-10-06" });
    await expect(app.error).toHaveText("Amount must be greater than 0");
  });
});
