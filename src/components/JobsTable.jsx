import "../css/jobstable.css";

const COLUMNS = ["Job ID", "Customer Name", "Customer Email", "Customer Phone Number", "Time"];

export default function JobsTable({ title = "Today's Jobs", rows = [] }) {
  return (
    <div className="jobs-table-wrap">
      <h2 className="jobs-table-title">{title}</h2>
      <div className="jobs-table">
        <div className="jobs-table-header">
          {COLUMNS.map((col) => (
            <span key={col}>{col}</span>
          ))}
        </div>
        {rows.length === 0 ? (
          <div className="jobs-table-empty">No jobs logged yet today.</div>
        ) : (
          rows.map((row, i) => (
            <div className="jobs-table-row" key={row.jobId || i}>
              <span>{row.jobId}</span>
              <span>{row.customerName}</span>
              <span>{row.customerEmail}</span>
              <span>{row.customerPhone}</span>
              <span>{row.time}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}