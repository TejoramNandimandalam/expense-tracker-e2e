import { APIRequestContext, expect } from "@playwright/test";
import type { NewExpense } from "./data";

export type SavedExpense = { id: number; title: string; amount: number; category: string; date: string };

export async function createExpense(request: APIRequestContext, data: NewExpense): Promise<SavedExpense> {
  const res = await request.post("/api/expenses", { data });
  expect(res.status(), "create expense status").toBe(201);
  return res.json();
}

export async function listExpenses(request: APIRequestContext, query = ""): Promise<SavedExpense[]> {
  const res = await request.get(`/api/expenses${query}`);
  expect(res.status(), "list expenses status").toBe(200);
  return res.json();
}

export async function deleteExpense(request: APIRequestContext, id: number): Promise<void> {
  await request.delete(`/api/expenses/${id}`);
}

// Delete every expense. Used by tests that need an empty database (never run on prod).
export async function resetData(request: APIRequestContext): Promise<void> {
  const all = await listExpenses(request);
  for (const e of all) await deleteExpense(request, e.id);
}
