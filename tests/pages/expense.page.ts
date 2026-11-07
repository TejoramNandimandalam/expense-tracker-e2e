import { Page, expect } from "@playwright/test";
import type { NewExpense } from "../helpers/data";

// Page object: one place that knows how to use the expense tracker page.
export class ExpensePage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/");
    await expect(this.page.getByTestId("expense-form")).toBeVisible();
  }

  // Fill the add form and click Add
  async add(e: Partial<NewExpense>) {
    if (e.title !== undefined) await this.page.getByTestId("title-input").fill(e.title);
    if (e.amount !== undefined) await this.page.getByTestId("amount-input").fill(String(e.amount));
    if (e.category !== undefined) await this.page.getByTestId("category-select").selectOption(e.category);
    if (e.date !== undefined) await this.page.getByTestId("date-input").fill(e.date);
    await this.page.getByTestId("add-button").click();
  }

  // The list row that contains this title
  row(title: string) {
    return this.page.getByTestId("expense-item").filter({ hasText: title });
  }

  async deleteRow(title: string) {
    await this.row(title).getByTestId("delete-button").click();
  }

  async startEdit(title: string) {
    await this.row(title).getByTestId("edit-button").click();
    await expect(this.page.getByTestId("expense-item-editing")).toBeVisible();
  }

  // Fill the open edit form (only the fields you pass)
  async fillEdit(e: Partial<NewExpense>) {
    if (e.title !== undefined) await this.page.getByTestId("edit-title-input").fill(e.title);
    if (e.amount !== undefined) await this.page.getByTestId("edit-amount-input").fill(String(e.amount));
    if (e.category !== undefined) await this.page.getByTestId("edit-category-select").selectOption(e.category);
    if (e.date !== undefined) await this.page.getByTestId("edit-date-input").fill(e.date);
  }

  get total() { return this.page.getByTestId("total"); }
  get count() { return this.page.getByTestId("expense-count"); }
  get error() { return this.page.getByTestId("error-message"); }
  get emptyMessage() { return this.page.getByTestId("empty-message"); }
  get items() { return this.page.getByTestId("expense-item"); }
  get filter() { return this.page.getByTestId("filter-select"); }
  get search() { return this.page.getByTestId("search-input"); }
  get sort() { return this.page.getByTestId("sort-select"); }
  get summaryItems() { return this.page.getByTestId("summary-item"); }
}
