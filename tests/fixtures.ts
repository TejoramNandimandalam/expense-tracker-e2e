import { test as base, expect, APIRequestContext } from "@playwright/test";
import { createExpense, deleteExpense, listExpenses, resetData, type SavedExpense } from "./helpers/api";
import { validExpense, type NewExpense } from "./helpers/data";

// "tracker" creates test data and deletes it again after the test, so tests leave no mess.
type Tracker = {
  // create an expense through the API and remember it for cleanup
  create(overrides?: Partial<NewExpense>): Promise<SavedExpense>;
  // remember a title that the test adds through the UI, so it is cleaned up too
  trackTitle(title: string): void;
  // empty the database first (skipped automatically on prod)
  cleanDb(): Promise<void>;
};

export const test = base.extend<{ tracker: Tracker }>({
  tracker: async ({ request }, use, testInfo) => {
    const ids: number[] = [];
    const titles: string[] = [];

    await use({
      async create(overrides = {}) {
        const saved = await createExpense(request, validExpense(overrides));
        ids.push(saved.id);
        return saved;
      },
      trackTitle(title) {
        titles.push(title);
      },
      async cleanDb() {
        testInfo.skip(process.env.TEST_ENV === "prod", "needs an empty database, never run on prod");
        await resetData(request);
      },
    });

    // cleanup after the test
    await cleanup(request, ids, titles);
  },
});

async function cleanup(request: APIRequestContext, ids: number[], titles: string[]) {
  for (const id of ids) await deleteExpense(request, id);
  for (const title of titles) {
    const rows = await listExpenses(request, `?q=${encodeURIComponent(title)}`);
    for (const r of rows) await deleteExpense(request, r.id);
  }
}

export { expect };
