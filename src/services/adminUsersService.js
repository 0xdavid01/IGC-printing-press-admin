import api from "./apiClient";

export function createUser({
  firstName,
  lastName,
  email,
  password,
  userRole
}) {
  return api.post("/api/admin/users", {
    firstName,
    lastName,
    email,
    password,
    userRole
  });
}

export function getUsers({
  userRole = "",
  status = "",
  page = 0,
  size = 25
} = {}) {
  const params = new URLSearchParams();

  if (userRole) {
    params.append("userRole", userRole);
  }

  if (status) {
    params.append("status", status);
  }

  params.append("page", page);
  params.append("size", size);

  return api.get(`/api/admin/users?${params.toString()}`);
}

export function updateUserStatus(userId, status) {
  return api.patch(`/api/admin/users/${userId}/status`, {
    status
  });
}