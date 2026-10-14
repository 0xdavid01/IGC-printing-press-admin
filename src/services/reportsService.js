import api from "./apiClient";

export function getIncomeReport(from, to) {
  return api.get(
    `/api/admin/reports/income?from=${encodeURIComponent(
      from
    )}&to=${encodeURIComponent(to)}`
  );
}

export function getExpensesReport(from, to) {
  return api.get(
    `/api/admin/reports/expenses?from=${encodeURIComponent(
      from
    )}&to=${encodeURIComponent(to)}`
  );
}

export function getCombinedReport(from, to) {
  return api.get(
    `/api/admin/reports/combined?from=${encodeURIComponent(
      from
    )}&to=${encodeURIComponent(to)}`
  );
}