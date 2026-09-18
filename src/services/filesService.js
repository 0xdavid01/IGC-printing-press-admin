const BASE_URL = "http://localhost:8082";

// GET /api/files/{key} — any logged-in user. Streams the file with
// Content-Disposition: attachment. {key} is the full object key returned
// by the backend on job creation, e.g. "artwork/uuid-file.pdf".

// Plain URL for use in an <a href> — a normal browser navigation sends the
// session cookie automatically, so this is the simplest way to let someone
// click-to-download.
export function getFileUrl(key) {
  return `${BASE_URL}/api/files/${key}`;
}

// Programmatic download (e.g. triggered from a button's onClick) — fetches
// the file as a blob so we can surface a proper error if the request fails,
// then triggers the browser's save dialog.
export async function downloadFile(key, filename) {
  const res = await fetch(getFileUrl(key), { credentials: "include" });

  if (!res.ok) {
    throw new Error(`Couldn't download file (${res.status})`);
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename || key.split("/").pop();
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}