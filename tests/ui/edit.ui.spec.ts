import { test, expect } from "../fixtures";
import { ExpensePage } from "../pages/expense.page";
import { uniqueTitle } from "../helpers/data";

test.describe("Edit expense (UI, release 2)", () => {
  test("Edit opens a form with the current values", { tag: ["@regression", "@browser", "@edit", "@v2"] }, async ({ page, tracker }) => {
    const saved = await tracker.create({ amount: 80, category: "Bills", date: "2026-09-15" });
    const app = new ExpensePage(page);
    await app.goto();
    await app.startEdit(saved.title);
    await expect(page.getByTestId("edit-title-input")).toHaveValue(saved.title);
    await expect(page.getByTestId("edit-amount-input")).toHaveValue("80");
    await expect(page.getByTestId("edit-category-select")).toHaveValue("Bills");
    await expect(page.getByTestId("edit-date-input")).toHaveValue("2026-09-15");
  });

  test("saving changes the title in the list", { tag: ["@smoke", "@browser", "@edit", "@v2"] }, async ({ page, tracker }) => {
    const saved = await tracker.create();
    const newTitle = uniqueTitle("Renamed");
    const app = new ExpensePage(page);
    await app.goto();
    await app.startEdit(saved.title);
    await app.fillEdit({ title: newTitle });
    await page.getByTestId("save-button").click();
    await expect(app.row(newTitle)).toBeVisible();
    await expect(app.row(saved.title)).toHaveCount(0);
  });

  test("saving a new amount updates the total", { tag: ["@regression", "@browser", "@edit", "@v2"] }, async ({ page, tracker }) => {
    await tracker.cleanDb();
    const saved = await tracker.create({ amount: 100 });
    const app = new ExpensePage(page);
    await app.goto();
    await expect(app.total).toHaveText("100");
    await app.startEdit(saved.title);
    await app.fillEdit({ amount: 175 });
    await page.getByTestId("save-button").click();
    await expect(app.total).toHaveText("175");
  });

  test("Cancel keeps the original values", { tag: ["@regression", "@browser", "@edit", "@v2"] }, async ({ page, tracker }) => {
    const saved = await tracker.create();
    const app = new ExpensePage(page);
    await app.goto();
    await app.startEdit(saved.title);
    await app.fillEdit({ title: "should not be saved" });
    await page.getByTestId("cancel-button").click();
    await expect(app.row(saved.title)).toBeVisible();
    await expect(page.getByTestId("expense-item-editing")).toHaveCount(0);
  });

  test("an invalid amount shows an error and keeps the edit form open", { tag: ["@regression", "@browser", "@edit", "@validation", "@v2"] }, async ({ page, tracker }) => {
    const saved = await tracker.create();
    const app = new ExpensePage(page);
    await app.goto();
    await app.startEdit(saved.title);
    await app.fillEdit({ amount: 0 });
    await page.getByTestId("save-button").click();
    await expect(page.getByTestId("edit-error-message")).toHaveText("Amount must be greater than 0");
    await expect(page.getByTestId("expense-item-editing")).toBeVisible();
  });

  test("changing the category shows in the row", { tag: ["@regression", "@browser", "@edit", "@v2"] }, async ({ page, tracker }) => {
    const saved = await tracker.create({ category: "Food" });
    const app = new ExpensePage(page);
    await app.goto();
    await app.startEdit(saved.title);
    await app.fillEdit({ category: "Travel" });
    await page.getByTestId("save-button").click();
    await expect(app.row(saved.title)).toContainText("Travel");
  });

  test("the edit is still there after a page reload", { tag: ["@regression", "@browser", "@edit", "@v2"] }, async ({ page, tracker }) => {
    const saved = await tracker.create();
    const newTitle = uniqueTitle("Persist");
    const app = new ExpensePage(page);
    await app.goto();
    await app.startEdit(saved.title);
    await app.fillEdit({ title: newTitle });
    await page.getByTestId("save-button").click();
    await expect(app.row(newTitle)).toBeVisible();
    await page.reload();
    await expect(app.row(newTitle)).toBeVisible();
  });
});
