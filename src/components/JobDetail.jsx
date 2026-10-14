import {
  useCallback,
  useEffect,
  useState
} from "react";
import {
  useNavigate,
  useParams
} from "react-router-dom";
import {
  getJob,
  updateJobStatus,
  topUpJob,
  recordJobPayment,
  downloadJobArtwork
} from "../services/jobsService";
import "../css/jobdetail.css";

const STATUS_OPTIONS = [
  "PENDING",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED"
];

const PAYMENT_METHODS = [
  "CASH",
  "POS",
  "TRANSFER"
];

function formatNaira(amount) {
  return (
    "₦" +
    Number(amount || 0).toLocaleString(
      "en-NG",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
    )
  );
}

function formatDateTime(value) {
  if (!value) return "—";

  return new Date(value).toLocaleString(
    "en-NG",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }
  );
}

function formatStatus(value) {
  if (!value) return "—";

  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
}

function formatSource(source) {
  if (source === "WEBSITE") {
    return "Website order";
  }

  if (source === "STAFF") {
    return "Staff order";
  }

  return source || "—";
}

export default function JobDetail() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [changingStatus, setChangingStatus] =
    useState(false);

  const [collecting, setCollecting] =
    useState(false);

  const [topUpData, setTopUpData] =
    useState(null);

  const [topUpError, setTopUpError] =
    useState("");

  const [showPaymentModal, setShowPaymentModal] =
    useState(false);

  const [paymentAmount, setPaymentAmount] =
    useState("");

  const [paymentMethod, setPaymentMethod] =
    useState("");

  const [recordingPayment, setRecordingPayment] =
    useState(false);

  const [paymentError, setPaymentError] =
    useState("");

  const fetchJob = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const res = await getJob(jobId);

      setJob(res);
    } catch (err) {
      setError(
        err?.message ||
          "Could not load this job."
      );
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  async function changeStatus(newStatus) {
    if (!job || changingStatus) {
      return;
    }

    try {
      setChangingStatus(true);
      setError("");

      await updateJobStatus(
        job.jobId,
        newStatus
      );

      await fetchJob();
    } catch (err) {
      setError(
        err?.message ||
          "Could not update job status."
      );
    } finally {
      setChangingStatus(false);
    }
  }

  async function collectBalance() {
    if (
      !job ||
      Number(job.balance || 0) <= 0 ||
      collecting
    ) {
      return;
    }

    try {
      setCollecting(true);
      setTopUpError("");

      const res = await topUpJob(job.jobId);

      setTopUpData(res);
    } catch (err) {
      setTopUpError(
        err?.message ||
          "Could not start payment."
      );
    } finally {
      setCollecting(false);
    }
  }

  function openPayment() {
    if (!topUpData?.authorizationUrl) {
      return;
    }

    sessionStorage.setItem(
      "topupReference",
      topUpData.reference
    );

    sessionStorage.setItem(
      "topupJobId",
      jobId
    );

    window.open(
      topUpData.authorizationUrl,
      "_blank"
    );

    setTopUpData(null);
  }

  function openManualPaymentModal() {
    setPaymentAmount("");
    setPaymentMethod("");
    setPaymentError("");
    setShowPaymentModal(true);
  }

  function closeManualPaymentModal() {
    if (recordingPayment) {
      return;
    }

    setShowPaymentModal(false);
    setPaymentAmount("");
    setPaymentMethod("");
    setPaymentError("");
  }

  async function recordPayment(e) {
    e.preventDefault();

    if (!job) {
      return;
    }

    const amount = Number(paymentAmount);
    const balance = Number(job.balance || 0);

    if (!amount || amount <= 100) {
      setPaymentError(
        "Amount must be greater than ₦100."
      );
      return;
    }

    if (amount > balance) {
      setPaymentError(
        "Payment would exceed the balance."
      );
      return;
    }

    if (!paymentMethod) {
      setPaymentError(
        "Please select a payment method."
      );
      return;
    }

    try {
      setRecordingPayment(true);
      setPaymentError("");

      const res = await recordJobPayment(
        job.jobId,
        amount,
        paymentMethod
      );

      setJob(res);

      setShowPaymentModal(false);
      setPaymentAmount("");
      setPaymentMethod("");
      setPaymentError("");
    } catch (err) {
      setPaymentError(
        err?.response?.data?.message ||
          err?.message ||
          "Could not record payment."
      );
    } finally {
      setRecordingPayment(false);
    }
  }

  async function downloadArtwork(fileKey) {
    try {
      const response =
        await downloadJobArtwork(fileKey);

      const blob = new Blob(
        [response.data],
        {
          type:
            response.headers?.[
              "content-type"
            ] ||
            "application/octet-stream"
        }
      );

      const url =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;

      link.download =
        fileKey.split("/").pop() ||
        "artwork";

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(
        err?.message ||
          "Could not download artwork."
      );
    }
  }

  if (loading) {
    return (
      <div className="job-detail-page">
        <div className="job-detail-loading">
          Loading job…
        </div>
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className="job-detail-page">
        <button
          className="job-detail-back"
          onClick={() => navigate(-1)}
        >
          ← Back to Jobs
        </button>

        <div className="error-banner">
          {error}
        </div>
      </div>
    );
  }

  if (!job) {
    return null;
  }

  const balance = Number(
    job.balance || 0
  );

  return (
    <div className="job-detail-page">
      <button
        className="job-detail-back"
        onClick={() => navigate(-1)}
      >
        ← Back to Jobs
      </button>

      <div className="job-detail-header">
        <div>
          <div className="job-detail-title-row">
            <h1 className="page-title">
              {job.jobId}
            </h1>

            <span
              className={
                "job-detail-status job-detail-status--" +
                String(
                  job.jobStatus || ""
                ).toLowerCase()
              }
            >
              {formatStatus(job.jobStatus)}
            </span>
          </div>

          <p className="page-sub">
            {formatSource(job.source)} · Created{" "}
            {formatDateTime(job.createdAt)}
          </p>
        </div>

        <div className="job-detail-status-control">
          <label>
            <span>Change Status</span>

            <select
              value={job.jobStatus}
              disabled={changingStatus}
              onChange={(e) =>
                changeStatus(e.target.value)
              }
            >
              {STATUS_OPTIONS.map(
                (status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {formatStatus(status)}
                  </option>
                )
              )}
            </select>
          </label>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      <section className="job-detail-card">
        <div className="job-detail-card-header">
          <div>
            <h2>Customer</h2>
          </div>
        </div>

        <div className="job-customer-info">
          <strong>{job.fullName}</strong>

          <span>{job.phoneNumber}</span>

          <span>{job.email}</span>

          {job.createdByName && (
            <span>
              Created by{" "}
              <strong>
                {job.createdByName}
              </strong>
            </span>
          )}
        </div>
      </section>

      <section className="job-detail-card">
        <div className="job-detail-card-header">
          <div>
            <h2>
              Items ({job.items?.length || 0})
            </h2>
          </div>
        </div>

        {!job.items ||
        job.items.length === 0 ? (
          <div className="job-detail-empty">
            No items found.
          </div>
        ) : (
          <div className="job-items">
            {job.items.map((item) => {
              const dimensions =
                item.width &&
                item.height
                  ? `${item.width} × ${item.height} ${
                      item.dimensionUnit || ""
                    }`
                  : null;

              return (
                <div
                  className="job-item"
                  key={item.id}
                >
                  <div className="job-item-main">
                    <div>
                      <div className="job-item-title">
                        <strong>
                          {item.inventory?.item ||
                            "—"}
                        </strong>

                        {item.designRequired && (
                          <span className="job-design-tag">
                            IGC Design
                          </span>
                        )}
                      </div>

                      <div className="job-item-meta">
                        <span>
                          {item.quantity} pcs
                        </span>

                        {dimensions && (
                          <span>
                            {dimensions}
                          </span>
                        )}

                        {item.size && (
                          <span>
                            {item.size}
                          </span>
                        )}
                      </div>

                      {item.specifications && (
                        <p>
                          {item.specifications}
                        </p>
                      )}

                      {item.message && (
                        <p>
                          <strong>
                            Message:
                          </strong>{" "}
                          {item.message}
                        </p>
                      )}

                      {item.designBrief && (
                        <p>
                          <strong>
                            Design brief:
                          </strong>{" "}
                          {item.designBrief}
                        </p>
                      )}
                    </div>

                    <div className="job-item-side">
                      <strong>
                        {formatNaira(
                          item.amount
                        )}
                      </strong>

                      {item.fileKey && (
                        <button
                          className="job-download-btn"
                          onClick={() =>
                            downloadArtwork(
                              item.fileKey
                            )
                          }
                        >
                          Download artwork
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="job-detail-card">
        <div className="job-detail-card-header">
          <div>
            <h2>Payment</h2>
          </div>
        </div>

        <div className="job-payment-summary">
          <div>
            <span>Total</span>

            <strong>
              {formatNaira(job.amount)}
            </strong>
          </div>

          <div>
            <span>Paid</span>

            <strong>
              {formatNaira(
                job.amountPaid
              )}
            </strong>
          </div>

          <div>
            <span>Balance</span>

            <strong>
              {formatNaira(balance)}
            </strong>
          </div>
        </div>

        <div className="job-payment-details">
          <span>
            Payment status:{" "}
            <strong>
              {formatStatus(
                job.paymentStatus
              )}
            </strong>
          </span>

          {job.paymentMethod && (
            <span>
              Payment method:{" "}
              <strong>
                {job.paymentMethod}
              </strong>
            </span>
          )}
        </div>

        {balance > 0 && (
          <div className="job-payment-actions">
            <button
              className="primary-button"
              onClick={collectBalance}
              disabled={collecting}
            >
              {collecting
                ? "Preparing payment…"
                : `Collect via Paystack ${formatNaira(
                    balance
                  )}`}
            </button>

            <button
              className="secondary-button"
              onClick={
                openManualPaymentModal
              }
            >
              Record Manual Payment
            </button>
          </div>
        )}

        {topUpError && (
          <p className="form-message form-message--error">
            {topUpError}
          </p>
        )}
      </section>

      {showPaymentModal && (
        <div
          className="job-payment-overlay"
          onClick={closeManualPaymentModal}
        >
          <div
            className="job-payment-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="job-detail-card-header">
              <div>
                <h2>Record Payment</h2>

                <p>
                  Record a cash, POS, or bank
                  transfer payment.
                </p>
              </div>

              <button
                className="job-topup-close"
                onClick={
                  closeManualPaymentModal
                }
                disabled={recordingPayment}
              >
                ×
              </button>
            </div>

            <div className="job-manual-payment-info">
              <div>
                <span>Job</span>

                <strong>
                  {job.jobId}
                </strong>
              </div>

              <div>
                <span>
                  Current Balance
                </span>

                <strong>
                  {formatNaira(balance)}
                </strong>
              </div>
            </div>

            <form
              className="job-manual-payment-form"
              onSubmit={recordPayment}
            >
              <label className="field">
                <span>Amount *</span>

                <div className="payment-amount-input">
                  <span>₦</span>

                  <input
                    type="number"
                    min="101"
                    max={balance}
                    step="1"
                    value={paymentAmount}
                    onChange={(e) =>
                      setPaymentAmount(
                        e.target.value
                      )
                    }
                    placeholder="3000"
                    disabled={
                      recordingPayment
                    }
                    required
                  />
                </div>
              </label>

              <div className="field">
                <span>
                  Payment Method *
                </span>

                <div className="payment-method-options">
                  {PAYMENT_METHODS.map(
                    (method) => (
                      <label key={method}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method}
                          checked={
                            paymentMethod ===
                            method
                          }
                          onChange={(e) =>
                            setPaymentMethod(
                              e.target.value
                            )
                          }
                          disabled={
                            recordingPayment
                          }
                        />

                        <span>
                          {method === "CASH"
                            ? "Cash"
                            : method === "POS"
                              ? "POS"
                              : "Transfer"}
                        </span>
                      </label>
                    )
                  )}
                </div>
              </div>

              {paymentError && (
                <p className="form-message form-message--error">
                  {paymentError}
                </p>
              )}

              <div className="job-manual-payment-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={
                    closeManualPaymentModal
                  }
                  disabled={
                    recordingPayment
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={
                    recordingPayment
                  }
                >
                  {recordingPayment
                    ? "Recording…"
                    : "Record Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {topUpData && (
        <div className="job-topup-overlay">
          <div className="job-topup-modal">
            <div className="job-detail-card-header">
              <div>
                <h2>
                  Confirm Payment
                </h2>

                <p>
                  Review the payment before
                  opening Paystack.
                </p>
              </div>

              <button
                className="job-topup-close"
                onClick={() =>
                  setTopUpData(null)
                }
              >
                ×
              </button>
            </div>

            <div className="job-topup-breakdown">
              <div>
                <span>Balance</span>

                <strong>
                  {formatNaira(
                    topUpData.topUpAmount
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Payment processing fee
                </span>

                <strong>
                  {formatNaira(
                    Number(
                      topUpData.totalCharged ||
                        0
                    ) -
                      Number(
                        topUpData.topUpAmount ||
                          0
                      )
                  )}
                </strong>
              </div>

              <div className="job-topup-total">
                <span>
                  Customer will be charged
                </span>

                <strong>
                  {formatNaira(
                    topUpData.totalCharged
                  )}
                </strong>
              </div>
            </div>

            <div className="job-topup-actions">
              <button
                className="secondary-button"
                onClick={() =>
                  setTopUpData(null)
                }
              >
                Cancel
              </button>

              <button
                className="primary-button"
                onClick={openPayment}
              >
                Confirm — Open Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}