import api from "./apiClient";

export function getPendingJobs(page = 0, size = 25) {
  return api.get(
    `/api/staff/jobs/pending?page=${page}&size=${size}`
  );
}

export function getCompletedJobs(page = 0, size = 25) {
  return api.get(
    `/api/staff/jobs/completed?page=${page}&size=${size}`
  );
}

export function getTodayJobs(page = 0, size = 25) {
  return api.get(
    `/api/staff/jobs/today?page=${page}&size=${size}`
  );
}

export function getJobsByDate(
  date,
  page = 0,
  size = 25
) {
  return api.get(
    `/api/staff/jobs/by-date?date=${date}&page=${page}&size=${size}`
  );
}

export function getJob(jobId) {
  return api.get(`/api/staff/jobs/${jobId}`);
}

// `reason` is only sent when provided. The backend requires it for CANCELLED.
export function updateJobStatus(
  jobId,
  jobStatus,
  reason
) {
  const body = { jobStatus };

  if (reason && reason.trim()) {
    body.reason = reason.trim();
  }

  return api.patch(
    `/api/staff/jobs/${jobId}/status`,
    body
  );
}

export function topUpJob(jobId) {
  return api.post(
    `/api/staff/jobs/${jobId}/topup`
  );
}

export function recordJobPayment(
  jobId,
  amount,
  paymentMethod
) {
  return api.post(
    `/api/staff/jobs/${jobId}/record-payment`,
    {
      amount,
      paymentMethod
    }
  );
}

export function downloadJobArtwork(fileKey) {
  return api.get(`/api/files/${fileKey}`, {
    responseType: "blob"
  });
}

export function initializePayment(
  requestData,
  artworkFiles = [],
  designFiles = [],
  depositAmount
) {
  const formData = new FormData();

  formData.append(
    "request",
    new Blob(
      [JSON.stringify(requestData)],
      {
        type: "application/json"
      }
    )
  );

  artworkFiles.forEach((file) => {
    formData.append(
      "artworkFiles",
      file
    );
  });

  designFiles.forEach((file) => {
    formData.append(
      "designFiles",
      file
    );
  });

  return api.post(
    `/api/public/payments/initialize?depositAmount=${depositAmount}`,
    formData,
    {
      isForm: true
    }
  );
}

export function verifyPayment(reference) {
  return api.post(
    `/api/public/payments/verify?reference=${encodeURIComponent(
      reference
    )}`
  );
}

export function createStaffJob(requestData) {
  return api.post(
    "/api/staff/jobs",
    requestData
  );
}