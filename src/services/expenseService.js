import api from "./apiClient";

export function createExpense({
  amount,
  category,
  description,
}) {
  return api.post("/api/staff/expenses", {
    amount: Number(amount),
    category,
    description: description || null,
  });
}

export function getTodayExpenses() {
  return api.get("/api/staff/expenses/today");
}

export function getAdminExpenses(from, to) {
  return api.get(
    `/api/admin/expenses?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
  );
}

export function deleteExpense(expenseId) {
  return api.delete(
    `/api/admin/expenses/${encodeURIComponent(expenseId)}`
  );
}

