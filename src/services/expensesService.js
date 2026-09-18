import api from "./apiClient";

// POST /api/staff/expenses — any logged-in user
export function createExpense({ amount, category, description }) {
  return api.post("/api/staff/expenses", { amount, category, description });
}

// GET /api/staff/expenses/today — any logged-in user
export function getTodayExpenses() {
  return api.get("/api/staff/expenses/today");
}