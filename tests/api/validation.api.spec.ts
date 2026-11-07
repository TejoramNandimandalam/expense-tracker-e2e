import { test, expect } from "../fixtures";
import { validExpense } from "../helpers/data";
import type { APIRequestContext } from "@playwright/test";

// Send a bad expense and check we get 400 with the right message
async function expectRejected(request: APIRequestContext, data: object, message: string) {
  const res = await request.post("/api/expenses", { data });
  expect(res.status()).toBe(400);
  expect((await res.json()).error).toBe(message);
}

test.describe("POST /api/expenses - validation (release 2)", () => {
  test("rejects a missing title", { tag: ["@regression", "@api", "@validation", "@v2"] }, async ({ request }) => {
    const { title, ...rest } = validExpense();
    void title;
    await expectRejected(request, rest, "Title is required");
  });

  test("rejects a title with only spaces", { tag: ["@regression", "@api", "@validation", "@v2"] }, async ({ request }) => {
    await expectRejected(request, validExpense({ title: "    " }), "Title is required");
  });

  test("rejects a title longer than 50 characters", { tag: ["@regression", "@api", "@validation", "@v2"] }, async ({ request }) => {
    await expectRejected(request, validExpense({ title: "a".repeat(51) }), "Title must be 50 characters or less");
  });

  test("accepts a title of exactly 50 characters", { tag: ["@regression", "@api", "@validation", "@v2"] }, async ({ request, tracker }) => {
    const title = "b".repeat(50);
    const res = await request.post("/api/expenses", { data: validExpense({ title }) });
    expect(res.status()).toBe(201);
    tracker.trackTitle(title);
  });

  test("rejects a missing amount", { tag: ["@regression", "@api", "@validation", "@v2"] }, async ({ request }) => {
    const { amount, ...rest } = validExpense();
    void amount;
    await expectRejected(request, rest, "Amount is required");
  });

  test("rejects an amount of zero", { tag: ["@regression", "@api", "@validation", "@v2"] }, async ({ request }) => {
    await expectRejected(request, validExpense({ amount: 0 }), "Amount must be greater than 0");
  });

  test("rejects a negative amount", { tag: ["@regression", "@api", "@validation", "@v2"] }, async ({ request }) => {
    await expectRejected(request, validExpense({ amount: -5 }), "Amount must be greater than 0");
  });

  test("rejects an amount above 1,000,000", { tag: ["@regression", "@api", "@validation", "@v2"] }, async ({ request }) => {
    await expectRejected(request, validExpense({ amount: 1000001 }), "Amount must be 1,000,000 or less");
  });

  test("accepts an amount of exactly 1,000,000", { tag: ["@regression", "@api", "@validation", "@v2"] }, async ({ tracker }) => {
    const saved = await tracker.create({ amount: 1000000 });
    expect(saved.amount).toBe(1000000);
  });

  test("rejects an unknown category", { tag: ["@regression", "@api", "@validation", "@v2"] }, async ({ request }) => {
    await expectRejected(request, validExpense({ category: "Games" }), "Invalid category");
  });

  test("rejects a date that is not YYYY-MM-DD", { tag: ["@regression", "@api", "@validation", "@v2"] }, async ({ request }) => {
    await expectRejected(request, validExpense({ date: "06-10-2026" }), "Invalid date");
  });
});
