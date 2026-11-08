import { test, expect } from "../fixtures";
import { ExpensePage } from "../pages/expense.page";
import { uniqueTitle } from "../helpers/data";

test.describe("Messages and feedback (UI, release 4)", () => {
  test("shows 'Expense added' after adding", { tag: ["@regression", "@browser", "@feedback", "@v4"] }, async ({ page, tracker }) => {
    const app = new ExpensePage(page);
    const title = uniqueTitle("Msg");
    tracker.trackTitle(title);
    await app.goto();
    await app.add({ title, amount: 10, date: "2026-10-06" });
    await expect(page.getByTestId("success-message")).toHaveText("Expense added");
  });

  test("shows 'Expense updated' after saving an edit", { tag: ["@regression", "@browser", "@feedback", "@v4"] }, async ({ page, tracker }) => {
    const saved = await tracker.create();
    const app = new ExpensePage(page);
    await app.goto();
    await app.startEdit(saved.title);
    await app.fillEdit({ amount: 55 });
    await page.getByTestId("save-button").click();
    await expect(page.getByTestId("success-message")).toHaveText("Expense updated");
  });

  test("shows 'Expense deleted' after deleting", { tag: ["@regression", "@browser", "@feedback", "@v4"] }, async ({ page, tracker }) => {
    const saved = await tracker.create();
    const app = new ExpensePage(page);
    await app.goto();
    await app.deleteRow(saved.title);
    await expect(page.getByTestId("success-message")).toHaveText("Expense deleted");
  });

  test("the error message disappears after a successful add", { tag: ["@regression", "@browser", "@feedback", "@v4"] }, async ({ page, tracker }) => {
    const app = new ExpensePage(page);
    const title = uniqueTitle("Fix");
    tracker.trackTitle(title);
    await app.goto();
    await page.getByTestId("add-button").click();
    await expect(app.error).toBeVisible();
    await app.add({ title, amount: 20, date: "2026-10-06" });
    await expect(app.error).toBeHidden();
  });

  test("the success message goes away by itself", { tag: ["@regression", "@browser", "@feedback", "@v4"] }, async ({ page, tracker }) => {
    const saved = await tracker.create();
    const app = new ExpensePage(page);
    await app.goto();
    await app.deleteRow(saved.title);
    await expect(page.getByTestId("success-message")).toBeVisible();
    await expect(page.getByTestId("success-message")).toBeHidden({ timeout: 10_000 });
  });
});

test.describe("Easier to use (UI, release 4)", () => {
  test("the cursor goes back to Title after adding", { tag: ["@regression", "@browser", "@ux", "@v4"] }, async ({ page, tracker }) => {
    const app = new ExpensePage(page);
    const title = uniqueTitle("Focus");
    tracker.trackTitle(title);
    await app.goto();
    await app.add({ title, amount: 30, date: "2026-10-06" });
    await expect(app.row(title)).toBeVisible();
    await expect(page.getByTestId("title-input")).toBeFocused();
  });

  test("pressing Enter in the amount box adds the expense", { tag: ["@regression", "@browser", "@ux", "@v4"] }, async ({ page, tracker }) => {
    const app = new ExpensePage(page);
    const title = uniqueTitle("Enter");
    tracker.trackTitle(title);
    await app.goto();
    await page.getByTestId("title-input").fill(title);
    await page.getByTestId("date-input").fill("2026-10-06");
    await page.getByTestId("amount-input").fill("45");
    await page.getByTestId("amount-input").press("Enter");
    await expect(app.row(title)).toBeVisible();
  });
});

test.describe("New look (UI, release 4)", () => {
  test("each row shows its category as a badge", { tag: ["@regression", "@browser", "@look", "@v4"] }, async ({ page, tracker }) => {
    const saved = await tracker.create({ category: "Travel" });
    const app = new ExpensePage(page);
    await app.goto();
    await expect(app.row(saved.title).getByTestId("category-badge")).toHaveText("Travel");
  });

  test("each row shows the amount with the ₹ sign", { tag: ["@regression", "@browser", "@look", "@v4"] }, async ({ page, tracker }) => {
    const saved = await tracker.create({ amount: 250 });
    const app = new ExpensePage(page);
    await app.goto();
    await expect(app.row(saved.title)).toContainText("₹250");
  });

  test("the total is shown with the ₹ sign", { tag: ["@regression", "@browser", "@look", "@v4"] }, async ({ page, tracker }) => {
    await tracker.cleanDb();
    await tracker.create({ amount: 80 });
    const app = new ExpensePage(page);
    await app.goto();
    await expect(page.getByText("Total spent")).toBeVisible();
    await expect(app.total.locator("..")).toHaveText("₹80");
  });

  test("the footer shows the release", { tag: ["@regression", "@browser", "@look", "@v4"] }, async ({ page }) => {
    const app = new ExpensePage(page);
    await app.goto();
    await expect(page.getByTestId("app-footer")).toContainText("Release 4");
  });
});

test.describe("Accessibility labels (UI, release 4)", () => {
  for (const label of ["Title", "Amount", "Category", "Date"]) {
    test(`the ${label} field has an accessible label`, { tag: ["@regression", "@browser", "@a11y", "@v4"] }, async ({ page }) => {
      const app = new ExpensePage(page);
      await app.goto();
      await expect(page.getByLabel(label, { exact: true })).toBeVisible();
    });
  }

  test("the Delete button names the expense", { tag: ["@regression", "@browser", "@a11y", "@v4"] }, async ({ page, tracker }) => {
    const saved = await tracker.create();
    const app = new ExpensePage(page);
    await app.goto();
    await expect(page.getByRole("button", { name: `Delete ${saved.title}` })).toBeVisible();
  });

  test("the Edit button names the expense", { tag: ["@regression", "@browser", "@a11y", "@v4"] }, async ({ page, tracker }) => {
    const saved = await tracker.create();
    const app = new ExpensePage(page);
    await app.goto();
    await expect(page.getByRole("button", { name: `Edit ${saved.title}` })).toBeVisible();
  });
});

test.describe("Filters together (UI)", () => {
  test("filter, search and sort work together", { tag: ["@regression", "@browser", "@filter", "@v3"] }, async ({ page, tracker }) => {
    const prefix = uniqueTitle("Combo");
    await tracker.create({ title: `${prefix}-a`, category: "Food", amount: 30 });
    await tracker.create({ title: `${prefix}-b`, category: "Food", amount: 10 });
    await tracker.create({ title: `${prefix}-c`, category: "Travel", amount: 20 });
    const app = new ExpensePage(page);
    await app.goto();
    await app.filter.selectOption("Food");
    await app.search.fill(prefix);
    await app.sort.selectOption("amount-asc");
    await expect(app.items).toHaveCount(2);
    await expect(app.items.nth(0)).toContainText(`${prefix}-b`);
    await expect(app.items.nth(1)).toContainText(`${prefix}-a`);
  });

  test("deleting in a filtered list updates the count", { tag: ["@regression", "@browser", "@filter", "@v2"] }, async ({ page, tracker }) => {
    await tracker.cleanDb();
    const one = await tracker.create({ category: "Food" });
    await tracker.create({ category: "Food" });
    await tracker.create({ category: "Travel" });
    const app = new ExpensePage(page);
    await app.goto();
    await app.filter.selectOption("Food");
    await expect(app.count).toHaveText("2");
    await app.deleteRow(one.title);
    await expect(app.count).toHaveText("1");
  });
});
