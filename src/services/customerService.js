import api from "./apiClient";

export function getCustomers(page = 0, size = 25) {
  return api.get(`/api/staff/customers?page=${page}&size=${size}`);
}

export function searchCustomers(name, page = 0, size = 25) {
  return api.get(`/api/staff/customers/search?name=${encodeURIComponent(name)}&page=${page}&size=${size}`);
}

export function createCustomer({ customerName, customerPhone, customerEmail }) {
  return api.post("/api/staff/customers", {
    customerName,
    customerPhone,
    customerEmail,
  });
}

export function updateCustomer(customerId, { customerName, customerPhone, customerEmail }) {
  return api.put(`/api/staff/customers/${customerId}`, {
    customerName,
    customerPhone,
    customerEmail,
  });
}
