import api from "./apiClient";

// GET /api/admin/expenses?from=YYYY-MM-DD&to=YYYY-MM-DD — ADMIN, SUPER_ADMIN
// Both params required.
export function getExpensesByRange(from, to) {
  return api.get(`/api/admin/expenses?from=${from}&to=${to}`);
}

// DELETE /api/admin/expenses/{erpId} — ADMIN, SUPER_ADMIN, hard delete
export function deleteExpense(erpId) {
  return api.delete(`/api/admin/expenses/${erpId}`);
}