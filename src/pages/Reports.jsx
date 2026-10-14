import { useEffect, useState } from "react";
import {
  getIncomeReport,
  getExpensesReport,
  getCombinedReport,
} from "../services/reportsService";
import "../css/reports.css";

const TABS = {
  INCOME: "income",
  EXPENSES: "expenses",
  COMBINED: "combined",
};

function localDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getToday() {
  return localDateString();
}

function getMonthStart() {
  const now = new Date();

  return `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}-01`;
}

function getYearStart() {
  const now = new Date();

  return `${now.getFullYear()}-01-01`;
}

function formatDate(value) {
  if (!value) return "—";

  return new Date(value).toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatAmount(value) {
  return Number(value || 0).toLocaleString("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  });
}

function escapeCsv(value) {
  if (value === null || value === undefined) {
    return "";
  }

  const text = String(value);

  if (
    text.includes(",") ||
    text.includes('"') ||
    text.includes("\n")
  ) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

function downloadCsv(filename, headers, rows) {
  const csv = [
    headers.map(escapeCsv).join(","),
    ...rows.map((row) =>
      row.map(escapeCsv).join(",")
    ),
  ].join("\n");

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

export default function Reports() {
  const [activeTab, setActiveTab] = useState(
    TABS.INCOME
  );

  const [from, setFrom] = useState(getMonthStart());
  const [to, setTo] = useState(getToday());

  const [appliedFrom, setAppliedFrom] = useState(
    getMonthStart()
  );
  const [appliedTo, setAppliedTo] = useState(
    getToday()
  );

  const [incomeData, setIncomeData] = useState(null);
  const [expensesData, setExpensesData] = useState(null);
  const [combinedData, setCombinedData] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadReport() {
    setLoading(true);
    setError("");

    try {
      if (activeTab === TABS.INCOME) {
        const response = await getIncomeReport(
          appliedFrom,
          appliedTo
        );

        console.log(
          "[Reports] Income response:",
          response
        );

        setIncomeData(response?.data ?? response);
      }

      if (activeTab === TABS.EXPENSES) {
        const response = await getExpensesReport(
          appliedFrom,
          appliedTo
        );

        console.log(
          "[Reports] Expenses response:",
          response
        );

        setExpensesData(response?.data ?? response);
      }

      if (activeTab === TABS.COMBINED) {
        const response = await getCombinedReport(
          appliedFrom,
          appliedTo
        );

        console.log(
          "[Reports] Combined response:",
          response
        );

        setCombinedData(response?.data ?? response);
      }
    } catch (err) {
      console.error(
        "[Reports] Failed to load report:",
        err
      );

      if (err?.status === 401) {
        window.location.href = "/login";
        return;
      }

      if (err?.status === 403) {
        setError(
          "You do not have permission to view reports."
        );
      } else {
        setError(
          err?.message ||
            "Could not load report. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReport();
  }, [activeTab, appliedFrom, appliedTo]);

  function applyDateRange() {
    if (!from || !to) {
      setError("Please select both dates.");
      return;
    }

    if (from > to) {
      setError(
        "The start date cannot be after the end date."
      );
      return;
    }

    setError("");
    setAppliedFrom(from);
    setAppliedTo(to);
  }

  function setThisMonth() {
    const monthStart = getMonthStart();
    const today = getToday();

    setFrom(monthStart);
    setTo(today);

    setAppliedFrom(monthStart);
    setAppliedTo(today);

    setError("");
  }

  function setThisYear() {
    const yearStart = getYearStart();
    const today = getToday();

    setFrom(yearStart);
    setTo(today);

    setAppliedFrom(yearStart);
    setAppliedTo(today);

    setError("");
  }

  function handleTabChange(tab) {
    setActiveTab(tab);
    setError("");
  }

  function exportIncomeCsv() {
    if (!incomeData) return;

    const rows = incomeData.rows || [];

    downloadCsv(
      `income-report-${appliedFrom}-to-${appliedTo}.csv`,
      [
        "Date",
        "Job ID",
        "Customer",
        "Phone",
        "Item",
        "Quantity",
        "Item Amount",
        "Job Total",
        "Amount Paid",
        "Outstanding",
      ],
      rows.map((row) => [
        row.createdAt,
        row.jobId,
        row.customerName,
        row.phoneNumber,
        row.itemName,
        row.quantity,
        row.itemAmount,
        row.jobTotal,
        row.amountPaid,
        row.outstanding,
      ])
    );
  }

  function exportExpensesCsv() {
    if (!expensesData) return;

    const rows = expensesData.rows || [];

    downloadCsv(
      `expenses-report-${appliedFrom}-to-${appliedTo}.csv`,
      [
        "Date",
        "Expense ID",
        "Category",
        "Description",
        "Logged By",
        "Amount",
      ],
      rows.map((row) => [
        row.createdAt,
        row.expenseId,
        row.category,
        row.description,
        row.loggedByName,
        row.amount,
      ])
    );
  }

  function exportCombinedCsv() {
    if (!combinedData) return;

    const incomeRows = combinedData.incomeRows || [];
    const expenseRows = combinedData.expenseRows || [];

    const rows = [];

    incomeRows.forEach((row) => {
      rows.push([
        "Income",
        row.createdAt,
        row.jobId,
        row.customerName,
        row.itemName,
        row.quantity,
        row.itemAmount,
        row.jobTotal,
        row.amountPaid,
        row.outstanding,
        "",
        "",
        "",
      ]);
    });

    expenseRows.forEach((row) => {
      rows.push([
        "Expense",
        row.createdAt,
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        row.expenseId,
        row.category,
        row.amount,
      ]);
    });

    downloadCsv(
      `combined-report-${appliedFrom}-to-${appliedTo}.csv`,
      [
        "Type",
        "Date",
        "Job ID",
        "Customer",
        "Item",
        "Quantity",
        "Item Amount",
        "Job Total",
        "Amount Paid",
        "Outstanding",
        "Expense ID",
        "Category",
        "Expense Amount",
      ],
      rows
    );
  }

  const incomeTotals = incomeData?.totals || {};

  const expenseTotal = Number(
    expensesData?.totalExpenses || 0
  );

  const combinedTotals = combinedData?.totals || {};

  return (
    <div className="reports-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports</h1>

          <p className="page-sub">
            Review income, expenses, and overall business
            performance.
          </p>
        </div>
      </div>

      <div className="reports-filters">
        <div className="reports-presets">
          <button
            type="button"
            onClick={setThisMonth}
          >
            This Month
          </button>

          <button
            type="button"
            onClick={setThisYear}
          >
            This Year
          </button>
        </div>

        <div className="reports-date-fields">
          <label className="field">
            <span>From</span>

            <input
              type="date"
              value={from}
              onChange={(event) =>
                setFrom(event.target.value)
              }
            />
          </label>

          <label className="field">
            <span>To</span>

            <input
              type="date"
              value={to}
              onChange={(event) =>
                setTo(event.target.value)
              }
            />
          </label>

          <button
            type="button"
            className="form-btn"
            onClick={applyDateRange}
          >
            Apply
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      <div className="reports-tabs">
        <button
          type="button"
          className={
            activeTab === TABS.INCOME
              ? "is-active"
              : ""
          }
          onClick={() =>
            handleTabChange(TABS.INCOME)
          }
        >
          Income
        </button>

        <button
          type="button"
          className={
            activeTab === TABS.EXPENSES
              ? "is-active"
              : ""
          }
          onClick={() =>
            handleTabChange(TABS.EXPENSES)
          }
        >
          Expenses
        </button>

        <button
          type="button"
          className={
            activeTab === TABS.COMBINED
              ? "is-active"
              : ""
          }
          onClick={() =>
            handleTabChange(TABS.COMBINED)
          }
        >
          Combined
        </button>
      </div>

      {loading ? (
        <div className="reports-loading">
          Loading report…
        </div>
      ) : (
        <>
          {activeTab === TABS.INCOME && (
            <>
              <div className="reports-summary-grid">
                <div className="reports-summary-card">
                  <span>Total Job Value</span>
                  <strong>
                    {formatAmount(
                      incomeTotals.totalJobValue
                    )}
                  </strong>
                </div>

                <div className="reports-summary-card">
                  <span>Total Paid</span>
                  <strong>
                    {formatAmount(
                      incomeTotals.totalPaid
                    )}
                  </strong>
                </div>

                <div className="reports-summary-card">
                  <span>Total Outstanding</span>
                  <strong>
                    {formatAmount(
                      incomeTotals.totalOutstanding
                    )}
                  </strong>
                </div>
              </div>

              <div className="reports-section-header">
                <div>
                  <h2>Income Report</h2>

                  <p>
                    {incomeData?.period?.from ||
                      appliedFrom}{" "}
                    →{" "}
                    {incomeData?.period?.to ||
                      appliedTo}
                  </p>
                </div>

                <button
                  type="button"
                  className="reports-export-btn"
                  onClick={exportIncomeCsv}
                  disabled={
                    !incomeData?.rows?.length
                  }
                >
                  Export CSV
                </button>
              </div>

              <div className="reports-table">
                <div className="reports-table-header reports-income-grid">
                  <span>Date</span>
                  <span>Job ID</span>
                  <span>Customer</span>
                  <span>Item</span>
                  <span>Qty</span>
                  <span>Item Amount</span>
                  <span>Job Total</span>
                  <span>Paid</span>
                  <span>Outstanding</span>
                </div>

                {!incomeData?.rows?.length ? (
                  <div className="reports-empty">
                    No income found for this period.
                  </div>
                ) : (
                  incomeData.rows.map((row, index) => (
                    <div
                      className="reports-table-row reports-income-grid"
                      key={`${row.jobId}-${index}`}
                    >
                      <span>
                        {formatDate(row.createdAt)}
                      </span>

                      <span>{row.jobId}</span>

                      <span>
                        <strong>
                          {row.customerName}
                        </strong>

                        <small>
                          {row.phoneNumber}
                        </small>
                      </span>

                      <span>
                        {row.itemName || "—"}
                      </span>

                      <span>
                        {row.quantity ?? "—"}
                      </span>

                      <span>
                        {formatAmount(
                          row.itemAmount
                        )}
                      </span>

                      <span>
                        {formatAmount(
                          row.jobTotal
                        )}
                      </span>

                      <span>
                        {formatAmount(
                          row.amountPaid
                        )}
                      </span>

                      <span>
                        {formatAmount(
                          row.outstanding
                        )}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {activeTab === TABS.EXPENSES && (
            <>
              <div className="reports-summary-grid">
                <div className="reports-summary-card">
                  <span>Total Expenses</span>

                  <strong>
                    {formatAmount(expenseTotal)}
                  </strong>
                </div>

                <div className="reports-summary-card">
                  <span>Number of Expenses</span>

                  <strong>
                    {expensesData?.rows?.length || 0}
                  </strong>
                </div>
              </div>

              <div className="reports-section-header">
                <div>
                  <h2>Expenses Report</h2>

                  <p>
                    {expensesData?.period?.from ||
                      appliedFrom}{" "}
                    →{" "}
                    {expensesData?.period?.to ||
                      appliedTo}
                  </p>
                </div>

                <button
                  type="button"
                  className="reports-export-btn"
                  onClick={exportExpensesCsv}
                  disabled={
                    !expensesData?.rows?.length
                  }
                >
                  Export CSV
                </button>
              </div>

              <div className="reports-table">
                <div className="reports-table-header reports-expenses-grid">
                  <span>Date</span>
                  <span>Expense ID</span>
                  <span>Category</span>
                  <span>Description</span>
                  <span>Logged By</span>
                  <span>Amount</span>
                </div>

                {!expensesData?.rows?.length ? (
                  <div className="reports-empty">
                    No expenses found for this period.
                  </div>
                ) : (
                  expensesData.rows.map((row) => (
                    <div
                      className="reports-table-row reports-expenses-grid"
                      key={row.expenseId}
                    >
                      <span>
                        {formatDate(row.createdAt)}
                      </span>

                      <span>
                        {row.expenseId}
                      </span>

                      <span>
                        {row.category}
                      </span>

                      <span>
                        {row.description || "—"}
                      </span>

                      <span>
                        {row.loggedByName || "—"}
                      </span>

                      <strong>
                        {formatAmount(row.amount)}
                      </strong>
                    </div>
                  ))
                )}
              </div>

              <div className="reports-total">
                <span>Total Expenses</span>

                <strong>
                  {formatAmount(expenseTotal)}
                </strong>
              </div>
            </>
          )}

          {activeTab === TABS.COMBINED && (
            <>
              <div className="reports-summary-grid">
                <div className="reports-summary-card">
                  <span>Total Income</span>

                  <strong>
                    {formatAmount(
                      combinedTotals.totalIncome
                    )}
                  </strong>
                </div>

                <div className="reports-summary-card">
                  <span>Total Job Value</span>

                  <strong>
                    {formatAmount(
                      combinedTotals.totalJobValue
                    )}
                  </strong>
                </div>

                <div className="reports-summary-card">
                  <span>Total Expenses</span>

                  <strong>
                    {formatAmount(
                      combinedTotals.totalExpenses
                    )}
                  </strong>
                </div>

                <div className="reports-summary-card">
                  <span>Net</span>

                  <strong>
                    {formatAmount(
                      combinedTotals.net
                    )}
                  </strong>
                </div>

                <div className="reports-summary-card">
                  <span>Outstanding</span>

                  <strong>
                    {formatAmount(
                      combinedTotals.totalOutstanding
                    )}
                  </strong>
                </div>
              </div>

              <div className="reports-section-header">
                <div>
                  <h2>Combined Report</h2>

                  <p>
                    {combinedData?.period?.from ||
                      appliedFrom}{" "}
                    →{" "}
                    {combinedData?.period?.to ||
                      appliedTo}
                  </p>
                </div>

                <button
                  type="button"
                  className="reports-export-btn"
                  onClick={exportCombinedCsv}
                  disabled={
                    !combinedData ||
                    (!combinedData?.incomeRows
                      ?.length &&
                      !combinedData?.expenseRows
                        ?.length)
                  }
                >
                  Export CSV
                </button>
              </div>

              <div className="reports-table">
                <div className="reports-table-header reports-combined-grid">
                  <span>Type</span>
                  <span>Date</span>
                  <span>ID</span>
                  <span>Customer / Logged By</span>
                  <span>Description / Item</span>
                  <span>Amount</span>
                </div>

                {(!combinedData?.incomeRows?.length &&
                  !combinedData?.expenseRows
                    ?.length) ? (
                  <div className="reports-empty">
                    No transactions found for this
                    period.
                  </div>
                ) : (
                  <>
                    {(
                      combinedData?.incomeRows || []
                    ).map((row, index) => (
                      <div
                        className="reports-table-row reports-combined-grid"
                        key={`income-${row.jobId}-${index}`}
                      >
                        <span>
                          <span className="report-type report-type--income">
                            Income
                          </span>
                        </span>

                        <span>
                          {formatDate(
                            row.createdAt
                          )}
                        </span>

                        <span>
                          {row.jobId}
                        </span>

                        <span>
                          <strong>
                            {row.customerName}
                          </strong>

                          <small>
                            {row.phoneNumber}
                          </small>
                        </span>

                        <span>
                          {row.itemName || "—"}
                        </span>

                        <span>
                          {formatAmount(
                            row.amountPaid
                          )}
                        </span>
                      </div>
                    ))}

                    {(
                      combinedData?.expenseRows || []
                    ).map((row) => (
                      <div
                        className="reports-table-row reports-combined-grid"
                        key={`expense-${row.expenseId}`}
                      >
                        <span>
                          <span className="report-type report-type--expense">
                            Expense
                          </span>
                        </span>

                        <span>
                          {formatDate(
                            row.createdAt
                          )}
                        </span>

                        <span>
                          {row.expenseId}
                        </span>

                        <span>
                          {row.loggedByName || "—"}
                        </span>

                        <span>
                          {row.description ||
                            row.category ||
                            "—"}
                        </span>

                        <span>
                          {formatAmount(row.amount)}
                        </span>
                      </div>
                    ))}
                  </>
                )}
              </div>

              <div className="reports-total">
                <span>Net</span>

                <strong>
                  {formatAmount(
                    combinedTotals.net
                  )}
                </strong>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
