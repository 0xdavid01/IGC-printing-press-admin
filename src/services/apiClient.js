const BASE_URL = "https://api.igcprintingpress.com";

async function request(path, { method = "GET", body, isForm = false, headers = {} } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    credentials: "include",
    headers: isForm ? headers : { "Content-Type": "application/json", ...headers },
    body: isForm ? body : body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;

    try {
      const errBody = await res.json();
      message = errBody.message || errBody.error || message;
    } catch {
      // Keep default message when response isn't JSON.
    }

    const error = new Error(message);
    error.status = res.status;
    throw error;
  }

  if (res.status === 204) return null;

  const contentType = res.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return res.json();
  }

  return res;
}

const api = {
  get: (path) => request(path),
  post: (path, body, opts = {}) => request(path, { method: "POST", body, ...opts }),
  put: (path, body) => request(path, { method: "PUT", body }),
  patch: (path, body) => request(path, { method: "PATCH", body }),
  delete: (path) => request(path, { method: "DELETE" }),
};

export default api;