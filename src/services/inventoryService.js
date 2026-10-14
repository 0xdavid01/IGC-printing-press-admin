import api from "./apiClient";

export function getInventory() {
  return api.get("/api/public/inventory");
}

export function getDesignInventory() {
  return api.get("/api/public/inventory/design");
}