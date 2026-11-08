import { test, expect } from "../fixtures";
import { ExpensePage } from "../pages/expense.page";
import { uniqueTitle } from "../helpers/data";

test.describe("Data and version (UI)", () => {
  test("an added expense is still there after reloading the page", { tag: ["@smoke", "@browser", "@add"] }, async ({ page, tracker }) => {
    const app = new ExpensePage(page);
    const title = uniqueTitle("Keep");
    tracker.trackTitle(title);
    await app.goto();
    await app.add({ title, amount: 60, category: "Bills", date: "2026-10-06" });
    await expect(app.row(title)).toBeVisible();
    await page.reload();
    await expect(app.row(title)).toBeVisible();
  });

  test("the heading shows the release number", { tag: ["@regression", "@browser"] }, async ({ page }) => {
    const app = new ExpensePage(page);
    await app.goto();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(`Expense Tracker v${process.env.APP_RELEASE ?? "4"}`);
  });
});
