import api from "./apiClient";

export function getEmployees(page = 0, size = 25) {
  return api.get(`/api/admin/employees?page=${page}&size=${size}`);
}

export function getEmployee(employeeId) {
  return api.get(`/api/admin/employees/${employeeId}`);
}

export function createEmployee({
  fullName,
  phoneNumber,
  email,
  role,
  imageUrl,
}) {
  return api.post("/api/admin/employees", {
    fullName,
    phoneNumber,
    email,
    role,
    imageUrl,
  });
}

export function updateEmployee(
  employeeId,
  {
    fullName,
    phoneNumber,
    email,
    role,
    imageUrl,
  }
) {
  return api.put(`/api/admin/employees/${employeeId}`, {
    fullName,
    phoneNumber,
    email,
    role,
    imageUrl,
  });
}

export function updateEmployeeStatus(
  employeeId,
  employeeStatus
) {
  return api.patch(
    `/api/admin/employees/${employeeId}/status`,
    {
      employeeStatus,
    }
  );
}