import api from "./apiClient";

// POST /api/admin/users — ADMIN, SUPER_ADMIN
// userRole: "STAFF" | "ADMIN" | "SUPER_ADMIN"
// Rule enforced server-side: ADMIN can only create STAFF; SUPER_ADMIN can create any role.
export function createUser({ firstName, lastName, email, password, userRole }) {
  return api.post("/api/admin/users", { firstName, lastName, email, password, userRole });
}