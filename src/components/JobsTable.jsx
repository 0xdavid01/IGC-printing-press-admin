import "../css/jobstable.css";

const COLUMNS = [
  "Job ID",
  "Customer",
  "Email",
  "Phone",
  "Time"
];

function formatTime(value) {
  if (!value) return "—";

  if (value instanceof Date) {
    return value.toLocaleTimeString("en-NG", {
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  if (typeof value === "string" && value.includes("T")) {
    return new Date(value).toLocaleTimeString("en-NG", {
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  return value;
}

export default function JobsTable({
  title = "Today's Jobs",
  rows = []
}) {
  return (
    <section className="jobs-table-wrap">
      <div className="jobs-table-heading">
        <div>
          <h2 className="jobs-table-title">{title}</h2>
          <p className="jobs-table-subtitle">
            Recent print jobs logged today.
          </p>
        </div>

        <span className="jobs-table-count">
          {rows.length} {rows.length === 1 ? "job" : "jobs"}
        </span>
      </div>

      <div className="jobs-table-card">
        <div className="jobs-table-scroll">
          <div className="jobs-table">
            <div className="jobs-table-header">
              {COLUMNS.map((column) => (
                <span key={column}>{column}</span>
              ))}
            </div>

            {rows.length === 0 ? (
              <div className="jobs-table-empty">
                <div className="jobs-table-empty-icon">—</div>
                <strong>No jobs logged yet</strong>
                <span>
                  Jobs created today will appear here.
                </span>
              </div>
            ) : (
              rows.map((row, index) => {
                const customer =
                  row.customerName || row.fullName || "—";

                const email =
                  row.customerEmail || row.email || "—";

                const phone =
                  row.customerPhone || row.phoneNumber || "—";

                const time =
                  row.time || row.createdAt;

                return (
                  <div
                    className="jobs-table-row"
                    key={row.jobId || index}
                  >
                    <span className="jobs-table-id">
                      {row.jobId || "—"}
                    </span>

                    <span className="jobs-table-customer">
                      {customer}
                    </span>

                    <span className="jobs-table-email">
                      {email}
                    </span>

                    <span className="jobs-table-phone">
                      {phone}
                    </span>

                    <span className="jobs-table-time">
                      {formatTime(time)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
