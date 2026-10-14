import "../css/statusbadge.css";

const STYLES = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  IN_PROGRESS: "in-progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

export default function StatusBadge({ status }) {
  const cls = STYLES[status] || "pending";
  return <span className={`status-badge status-badge--${cls}`}>{status}</span>;
}