import { test, expect } from "../fixtures";
import { uniqueTitle } from "../helpers/data";

const HEADER = "id,title,amount,category,date";

// Download the CSV and split it into lines
async function getCsv(request: import("@playwright/test").APIRequestContext, query = "") {
  const res = await request.get(`/api/export${query}`);
  expect(res.status()).toBe(200);
  return { res, text: await res.text() };
}

test.describe("GET /api/export - CSV export (release 4)", () => {
  test("returns 200", { tag: ["@smoke", "@api", "@export", "@v4"] }, async ({ request }) => {
    const res = await request.get("/api/export");
    expect(res.status()).toBe(200);
  });

  test("sends the file as text/csv", { tag: ["@regression", "@api", "@export", "@v4"] }, async ({ request }) => {
    const { res } = await getCsv(request);
    expect(res.headers()["content-type"]).toContain("text/csv");
  });

  test("asks the browser to download expenses.csv", { tag: ["@regression", "@api", "@export", "@v4"] }, async ({ request }) => {
    const { res } = await getCsv(request);
    expect(res.headers()["content-disposition"]).toBe('attachment; filename="expenses.csv"');
  });

  test("the first line is the header", { tag: ["@regression", "@api", "@export", "@v4"] }, async ({ request }) => {
    const { text } = await getCsv(request);
    expect(text.split("\n")[0]).toBe(HEADER);
  });

  test("contains a line for a new expense", { tag: ["@regression", "@api", "@export", "@v4"] }, async ({ request, tracker }) => {
    const saved = await tracker.create({ amount: 42.5, category: "Bills", date: "2026-09-09" });
    const { text } = await getCsv(request);
    expect(text.split("\n")).toContain(`${saved.id},${saved.title},42.5,Bills,2026-09-09`);
  });

  test("puts quotes around a title that contains a comma", { tag: ["@regression", "@api", "@export", "@v4"] }, async ({ request, tracker }) => {
    const title = `${uniqueTitle("Tea")}, biscuits`;
    await tracker.create({ title });
    const { text } = await getCsv(request);
    expect(text).toContain(`"${title}"`);
  });

  test("doubles the quotes inside a title", { tag: ["@regression", "@api", "@export", "@v4"] }, async ({ request, tracker }) => {
    const base = uniqueTitle("Quote");
    await tracker.create({ title: `${base} "best"` });
    const { text } = await getCsv(request);
    expect(text).toContain(`"${base} ""best"""`);
  });

  test("?category= exports only that category", { tag: ["@regression", "@api", "@export", "@v4"] }, async ({ request, tracker }) => {
    const food = await tracker.create({ category: "Food" });
    const travel = await tracker.create({ category: "Travel" });
    const { text } = await getCsv(request, "?category=Travel");
    const lines = text.split("\n").slice(1);
    expect(lines.every((l) => l.includes(",Travel,"))).toBe(true);
    expect(lines.some((l) => l.startsWith(`${travel.id},`))).toBe(true);
    expect(lines.some((l) => l.startsWith(`${food.id},`))).toBe(false);
  });

  test("an empty database gives only the header", { tag: ["@regression", "@api", "@export", "@v4"] }, async ({ request, tracker }) => {
    await tracker.cleanDb();
    const { text } = await getCsv(request);
    expect(text).toBe(HEADER);
  });

  test("an unused category gives only the header", { tag: ["@regression", "@api", "@export", "@v4"] }, async ({ request }) => {
    const { text } = await getCsv(request, "?category=NoSuchCategory");
    expect(text).toBe(HEADER);
  });
});
