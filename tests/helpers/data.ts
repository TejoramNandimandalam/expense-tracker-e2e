// Test data helpers. Titles are unique so tests never clash with other data in the shared DB.
let counter = 0;

export function uniqueTitle(prefix = "Item"): string {
  counter += 1;
  return `${prefix}-${Date.now().toString(36)}${counter}`;
}

export type NewExpense = { title: string; amount: number | string; category: string; date: string };

// A valid expense; pass overrides to change fields
export function validExpense(overrides: Partial<NewExpense> = {}): NewExpense {
  return { title: uniqueTitle(), amount: 100, category: "Food", date: "2026-10-06", ...overrides };
}
