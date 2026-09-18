import { useEffect, useState } from "react";
import StatCard from "../components/StatCard";
import JobsTable from "../components/JobsTable";
import { getDashboard } from "../services/dashboardService";
import "../css/statcard.css";

function formatNaira(amount) {
  return "₦" + Number(amount || 0).toLocaleString("en-NG");
}

function formatTime(isoString) {
  if (!isoString) return "—";
  return new Date(isoString).toLocaleTimeString("en-NG", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    getDashboard()
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Couldn't load the dashboard.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const rows = (data?.unresolvedJobs?.content || []).map((job) => ({
    jobId: job.jobId,
    customerName: job.fullName,
    customerEmail: job.email,
    customerPhone: job.phoneNumber,
    time: formatTime(job.createdAt),
  }));

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>
      <p className="page-sub">Overview of today's operations.</p>

      {error && <div className="dashboard-error">{error}</div>}

      <div className="stat-row">
        <StatCard
          label="Today's Sales"
          value={loading ? "…" : formatNaira(data?.totalSales)}
          variant="sales"
        />
        <StatCard
          label="Today's Expenses"
          value={loading ? "…" : formatNaira(data?.totalExpenses)}
          variant="expenses"
        />
        <StatCard
          label="Active Employees"
          value={loading ? "…" : String(data?.activeEmployees ?? 0)}
          variant="neutral"
        />
      </div>

      <JobsTable title="Unresolved Jobs" rows={loading ? [] : rows} />
    </div>
  );
}