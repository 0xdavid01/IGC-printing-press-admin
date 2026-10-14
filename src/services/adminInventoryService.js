import api from "./apiClient";

export function getAdminInventory() {
  return api.get("/api/admin/inventory");
}

export function createInventoryItem(requestData) {
  return api.post("/api/admin/inventory", requestData);
}

export function updateInventoryItem(inventoryId, requestData) {
  return api.put(
    `/api/admin/inventory/${inventoryId}`,
    requestData
  );
}