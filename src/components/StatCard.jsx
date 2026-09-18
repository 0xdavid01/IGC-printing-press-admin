import "../css/statcard.css";

export default function StatCard({ label, value, variant }) {
  return (
    <div className={"stat-card stat-card--" + variant}>
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
    </div>
  );
}