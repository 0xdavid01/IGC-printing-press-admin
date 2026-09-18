import api from "./apiClient";

// GET /api/public/inventory — public
export function getInventory() {
  return api.get("/api/public/inventory");
}

// POST /api/public/jobs — public, multipart/form-data
// requestData: the JSON job payload (fullName, phoneNumber, email, items[])
// artworkFiles: File[] (matches "artworkFiles" part)
// designFiles: File[] (matches "designFiles" part)
export function createJob(requestData, artworkFiles = [], designFiles = []) {
  const formData = new FormData();
  formData.append(
    "request",
    new Blob([JSON.stringify(requestData)], { type: "application/json" })
  );
  artworkFiles.forEach((file) => formData.append("artworkFiles", file));
  designFiles.forEach((file) => formData.append("designFiles", file));

  return api.post("/api/public/jobs", formData, { isForm: true });
}