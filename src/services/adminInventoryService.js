import api from "./apiClient";

// POST /api/admin/inventory — ADMIN, SUPER_ADMIN
export function createInventoryItem({ category, item, price, size, pricingUnit, minArea }) {
  return api.post("/api/admin/inventory", { category, item, price, size, pricingUnit, minArea });
}