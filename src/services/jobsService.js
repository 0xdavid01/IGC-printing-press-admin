import api from "./apiClient";

// GET /api/staff/jobs/pending?page=&size= — STAFF, ADMIN, SUPER_ADMIN
export function getPendingJobs(page = 0, size = 25) {
  return api.get(`/api/staff/jobs/pending?page=${page}&size=${size}`);
}

// GET /api/staff/jobs/completed?page=&size= — jobStatus COMPLETED or CANCELLED
export function getCompletedJobs(page = 0, size = 25) {
  return api.get(`/api/staff/jobs/completed?page=${page}&size=${size}`);
}

// GET /api/staff/jobs/today?page=&size= — all statuses, created today
export function getTodayJobs(page = 0, size = 25) {
  return api.get(`/api/staff/jobs/today?page=${page}&size=${size}`);
}

// GET /api/staff/jobs/by-date?date=YYYY-MM-DD&page=&size=
export function getJobsByDate(date, page = 0, size = 25) {
  return api.get(`/api/staff/jobs/by-date?date=${date}&page=${page}&size=${size}`);
}

// PATCH /api/staff/jobs/{jobId}/status — { jobStatus: "PENDING"|"IN_PROGRESS"|"COMPLETED"|"CANCELLED" }
export function updateJobStatus(jobId, jobStatus) {
  return api.patch(`/api/staff/jobs/${jobId}/status`, { jobStatus });
}