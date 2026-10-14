import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Pagination from "../components/Pagination";
import JobForm from "../components/JobForm";
import CreateQuote from "../components/CreateQuote";
import {
  getPendingJobs,
  getCompletedJobs,
  getTodayJobs,
  updateJobStatus
} from "../services/jobsService";
import "../css/jobspage.css";

const TABS = [
  {
    key: "pending",
    label: "Pending",
    fetcher: getPendingJobs
  },
  {
    key: "completed",
    label: "Completed",
    fetcher: getCompletedJobs
  },
  {
    key: "today",
    label: "Today",
    fetcher: getTodayJobs
  }
];

const STATUS_OPTIONS = [
  "PENDING",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED"
];

const REASON_MIN = 5;
const REASON_MAX = 500;

function formatNaira(amount) {
  return "₦" + Number(amount || 0).toLocaleString("en-NG");
}

function formatDateTime(iso) {
  if (!iso) return "—";

  return new Date(iso).toLocaleString("en-NG", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function formatSource(source) {
  if (source === "WEBSITE") return "Website";
  if (source === "STAFF") return "Staff";

  return source || "—";
}

function getErrorMessage(err, fallback) {
  return (
    err?.response?.data?.message ||
    err?.message ||
    fallback
  );
}

export default function Jobs() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("pending");
  const [page, setPage] = useState(0);
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showCreateQuote, setShowCreateQuote] = useState(false);

  // Cancellation modal
  const [cancelJobId, setCancelJobId] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelError, setCancelError] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const tab = TABS.find((item) => item.key === activeTab);

  useEffect(() => {
    setPage(0);
  }, [activeTab]);

  useEffect(() => {
    let cancelled = false;

    const currentTab = TABS.find(
      (item) => item.key === activeTab
    );

    setLoading(true);
    setError(null);

    currentTab.fetcher(page)
      .then((res) => {
        if (!cancelled) {
          setPageData(res);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err.message || "Couldn't load jobs."
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeTab, page]);

  function applyStatusToRow(jobId, newStatus) {
    setPageData((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        content: prev.content.map((job) =>
          job.jobId === jobId
            ? {
                ...job,
                jobStatus: newStatus
              }
            : job
        )
      };
    });
  }

  async function handleStatusChange(jobId, newStatus) {
    // Cancelling needs a reason, so open the modal instead
    if (newStatus === "CANCELLED") {
      setCancelJobId(jobId);
      setCancelReason("");
      setCancelError("");
      return;
    }

    setUpdatingId(jobId);
    setError(null);

    try {
      await updateJobStatus(jobId, newStatus);
      applyStatusToRow(jobId, newStatus);
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Couldn't update job status."
        )
      );
    } finally {
      setUpdatingId(null);
    }
  }

  function closeCancelModal() {
    if (cancelling) return;

    setCancelJobId(null);
    setCancelReason("");
    setCancelError("");
  }

  async function handleConfirmCancel(event) {
    event.preventDefault();

    const reason = cancelReason.trim();

    if (reason.length < REASON_MIN) {
      setCancelError(
        `Please enter at least ${REASON_MIN} characters.`
      );
      return;
    }

    setCancelling(true);
    setCancelError("");

    try {
      await updateJobStatus(
        cancelJobId,
        "CANCELLED",
        reason
      );

      applyStatusToRow(cancelJobId, "CANCELLED");

      setCancelJobId(null);
      setCancelReason("");
    } catch (err) {
      setCancelError(
        getErrorMessage(
          err,
          "Could not cancel the job."
        )
      );
    } finally {
      setCancelling(false);
    }
  }

  async function handleJobCreated() {
    setShowCreateForm(false);
    setActiveTab("today");
    setPage(0);

    try {
      const res = await getTodayJobs(0);

      setPageData(res);
      setError(null);
    } catch (err) {
      setError(
        err.message ||
          "Job was created, but the list could not refresh."
      );
    }
  }

  function openJob(jobId) {
    navigate(`/staff/jobs/${jobId}`);
  }

  const rows = pageData?.content || [];

  const trimmedReasonLength = cancelReason.trim().length;
  const canConfirmCancel =
    trimmedReasonLength >= REASON_MIN && !cancelling;

  return (
    <div className="jobs-page">
      <div className="page-heading-row">
        <div>
          <h1 className="page-title">Jobs</h1>

          <p className="page-sub">
            All print jobs, by status.
          </p>
        </div>

        <div className="jobs-header-actions">
          <button
            className="secondary-button"
            onClick={() => setShowCreateQuote(true)}
          >
            Create Quote
          </button>

          <button
            className="primary-button"
            onClick={() => setShowCreateForm(true)}
          >
            Create Job
          </button>
        </div>
      </div>

      <div className="jobs-tabs">
        {TABS.map((item) => (
          <button
            key={item.key}
            className={
              "jobs-tab" +
              (activeTab === item.key
                ? " is-active"
                : "")
            }
            onClick={() => setActiveTab(item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      <div className="jobs-list-table">
        <div className="jobs-list-header">
          <span>Job ID</span>
          <span>Customer</span>
          <span>Contact</span>
          <span>Amount</span>
          <span>Paid</span>
          <span>Payment</span>
          <span>Status</span>
          <span>Source</span>
          <span>Created</span>
        </div>

        {loading ? (
          <div className="jobs-list-loading">
            Loading jobs…
          </div>
        ) : rows.length === 0 ? (
          <div className="jobs-list-empty">
            No {tab.label.toLowerCase()} jobs.
          </div>
        ) : (
          rows.map((job) => (
            <div
              className="jobs-list-row jobs-list-row-clickable"
              key={job.jobId}
              onClick={() => openJob(job.jobId)}
            >
              <span>{job.jobId}</span>

              <span>{job.fullName}</span>

              <span>
                {job.phoneNumber}
                <br />
                {job.email}
              </span>

              <span>
                {formatNaira(job.amount)}
              </span>

              <span>
                {formatNaira(job.amountPaid)}
              </span>

              <span>
                {job.paymentStatus || "—"}
              </span>

              <span
                className="jobs-list-row-cell"
                onClick={(e) => e.stopPropagation()}
              >
                <select
                  className="status-select"
                  value={job.jobStatus}
                  disabled={
                    updatingId === job.jobId
                  }
                  onChange={(e) =>
                    handleStatusChange(
                      job.jobId,
                      e.target.value
                    )
                  }
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option
                      key={status}
                      value={status}
                    >
                      {status}
                    </option>
                  ))}
                </select>
              </span>

              <span>
                <span
                  className={
                    "job-source-badge " +
                    (job.source === "STAFF"
                      ? "job-source-staff"
                      : "job-source-website")
                  }
                >
                  <span>●</span>

                  {formatSource(job.source)}
                </span>
              </span>

              <span>
                {formatDateTime(job.createdAt)}
              </span>
            </div>
          ))
        )}
      </div>

      {pageData && (
        <Pagination
          page={page}
          totalPages={pageData.totalPages}
          onChange={setPage}
        />
      )}

      {showCreateForm && (
        <JobForm
          onClose={() =>
            setShowCreateForm(false)
          }
          onSuccess={handleJobCreated}
        />
      )}

      {showCreateQuote && (
        <CreateQuote
          onClose={() =>
            setShowCreateQuote(false)
          }
        />
      )}

      {cancelJobId && (
        <div
          className="cancel-modal-overlay"
          onClick={closeCancelModal}
        >
          <div
            className="cancel-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="cancel-modal-header">
              <div>
                <h2>Cancel this job?</h2>

                <p>
                  Job {cancelJobId}. The reason is
                  emailed to the customer, so keep it
                  professional.
                </p>
              </div>

              <button
                type="button"
                className="cancel-modal-close"
                onClick={closeCancelModal}
                disabled={cancelling}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form
              className="cancel-modal-form"
              onSubmit={handleConfirmCancel}
            >
              <label className="cancel-modal-field">
                <span>Reason for cancellation *</span>

                <textarea
                  value={cancelReason}
                  onChange={(event) =>
                    setCancelReason(
                      event.target.value
                    )
                  }
                  maxLength={REASON_MAX}
                  placeholder="e.g. Customer requested cancellation after reviewing the proof"
                  disabled={cancelling}
                  autoFocus
                />

                <small>
                  {cancelReason.length}/{REASON_MAX}
                </small>
              </label>

              {cancelError && (
                <p className="cancel-modal-error">
                  {cancelError}
                </p>
              )}

              <div className="cancel-modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeCancelModal}
                  disabled={cancelling}
                >
                  Back
                </button>

                <button
                  type="submit"
                  className="cancel-confirm-button"
                  disabled={!canConfirmCancel}
                >
                  {cancelling
                    ? "Cancelling…"
                    : "Confirm Cancellation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}