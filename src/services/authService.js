import api from "./apiClient";

// POST /api/auth/login — public

export function login(email, password) {
  return api.post("/api/auth/login", { email, password });
}

// GET /api/auth/me — any logged-in user

export function getCurrentUser() {
  return api.get("/api/auth/me");
}

// POST /api/auth/logout — any logged-in user

export function logout() {
  return api.post("/api/auth/logout");
}

// PUT /api/staff/users/me/password — any logged-in user

export function changePassword(oldPassword, newPassword) {
  return api.put("/api/staff/users/me/password", {
    oldPassword,
    newPassword,
  });
}
