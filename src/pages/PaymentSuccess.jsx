import { useEffect, useState } from "react";
import { verifyPayment } from "../services/jobsService";
import "../css/paymentsuccess.css";

function formatNaira(amount) {
  return `₦${Number(amount || 0).toLocaleString("en-NG")}`;
}

export default function PaymentSuccess() {
  const [status, setStatus] = useState("loading");
  const [job, setJob] = useState(null);
  const [reference, setReference] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(
      window.location.search
    );

    const urlReference = params.get("reference");

    const storedReference =
      sessionStorage.getItem("paymentReference");

    const paymentReference =
      urlReference || storedReference;

    if (!paymentReference) {
      setStatus("error");
      return;
    }

    setReference(paymentReference);

    verifyPayment(paymentReference)
      .then((data) => {
        setJob(data);
        setStatus("success");

        sessionStorage.removeItem(
          "paymentReference"
        );
        sessionStorage.removeItem("paymentDeposit");
      })
      .catch((err) => {
        console.error(err);
        setStatus("error");
      });
  }, []);

  if (status === "loading") {
    return (
      <main className="payment-success-page">
        <div className="payment-success-card">
          <div className="payment-spinner" />
          <h1>Confirming your payment</h1>
          <p>
            Please wait while we confirm your payment
            with Paystack.
          </p>
        </div>
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="payment-success-page">
        <div className="payment-success-card">
          <div className="payment-status-icon payment-status-error">
            !
          </div>

          <span className="payment-success-eyebrow">
            PAYMENT COULD NOT BE CONFIRMED
          </span>

          <h1>We couldn't confirm your payment</h1>

          <p>
            Your payment could not be confirmed at this
            time. Please keep the reference below and
            contact support.
          </p>

          <div className="payment-reference">
            <span>Payment reference</span>
            <strong>{reference || "Unavailable"}</strong>
          </div>

          <button
            type="button"
            className="payment-home-button"
            onClick={() => {
              window.location.href = "/";
            }}
          >
            Return to website
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="payment-success-page">
      <div className="payment-success-card">
        <div className="payment-status-icon payment-status-success">
          ✓
        </div>

        <span className="payment-success-eyebrow">
          PAYMENT CONFIRMED
        </span>

        <h1>Your job has been created</h1>

        <p>
          Your payment has been confirmed and your print
          job is now with the production team.
        </p>

        <div className="payment-job-id">
          <span>Job ID</span>
          <strong>{job?.jobId}</strong>
        </div>

        <div className="payment-details">
          <div>
            <span>Order total</span>
            <strong>
              {formatNaira(job?.amount)}
            </strong>
          </div>

          <div>
            <span>Amount paid</span>
            <strong>
              {formatNaira(job?.amountPaid)}
            </strong>
          </div>

          <div>
            <span>Payment status</span>
            <strong>
              {job?.paymentStatus || "PAID"}
            </strong>
          </div>

          <div>
            <span>Job status</span>
            <strong>
              {job?.jobStatus || "PENDING"}
            </strong>
          </div>
        </div>

        <div className="payment-reference">
          <span>Payment reference</span>
          <strong>{reference}</strong>
        </div>

        <button
          type="button"
          className="payment-home-button"
          onClick={() => {
            window.location.href = "/";
          }}
        >
          Done
        </button>
      </div>
    </main>
  );
}