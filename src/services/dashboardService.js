import api from "./apiClient";

// GET /api/staff/dashboard?page=0&size=25
// Returns { totalSales, totalExpenses, activeEmployees, unresolvedJobs: Page<JobSummary> }
export function getDashboard(page = 0, size = 25) {
  return api.get(`/api/staff/dashboard?page=${page}&size=${size}`);
}