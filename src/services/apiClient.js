// Base API client — talks to the Spring Boot backend using session-cookie auth.
// credentials: "include" is required so the browser sends the JSESSIONID cookie
// on every request (per the API docs' auth model).

const BASE_URL = "http://localhost:8082";

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
      // response wasn't JSON (e.g. the stacktrace page mentioned in the docs) — keep default message
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
  patch: (path, body) => request(path, { method: "PATCH", body }),
  delete: (path) => request(path, { method: "DELETE" }),
};

export default api;