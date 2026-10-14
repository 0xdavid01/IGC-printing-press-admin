import api from "./apiClient";

export function createJob(requestData, artworkFiles = [], designFiles = []) {
  const formData = new FormData();

  formData.append(
    "request",
    new Blob(
      [JSON.stringify(requestData)],
      { type: "application/json" }
    )
  );

  artworkFiles.forEach((file) => {
    formData.append("artworkFiles", file);
  });

  designFiles.forEach((file) => {
    formData.append("designFiles", file);
  });

  return api.post(
    "/api/public/jobs",
    formData,
    { isForm: true }
  );
}
