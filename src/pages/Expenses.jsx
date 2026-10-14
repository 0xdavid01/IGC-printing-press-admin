import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  createExpense,
  getTodayExpenses,
  getAdminExpenses,
  deleteExpense,
} from "../services/expenseService";
import "../css/expenses.css";
import "../css/forms.css";

const initialForm = {
  amount: "",
  category: "",
  description: "",
};

const categories = [
  "Paper",
  "Ink",
  "Rent",
  "Salaries",
  "Utilities",
  "Transport",
  "Maintenance",
  "Miscellaneous",
];

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

export default function Expenses() {
  const { user } = useAuth();

  const isAdmin =
    user?.userRole === "ADMIN" ||
    user?.userRole === "SUPER_ADMIN";

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState(null);

  const [from, setFrom] = useState(getMonthStart());
  const [to, setTo] = useState(getToday());

  const [appliedFrom, setAppliedFrom] = useState(getMonthStart());
  const [appliedTo, setAppliedTo] = useState(getToday());

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  async function loadExpenses() {
    setLoading(true);
    setError("");

    try {
      const response = isAdmin
        ? await getAdminExpenses(appliedFrom, appliedTo)
        : await getTodayExpenses();

      console.log("[Expenses] Response received:", response);

      const list = response?.data ?? response ?? [];

      setExpenses(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("[Expenses] Failed to load expenses:", err);

      if (err?.status === 401) {
        window.location.href = "/login";
        return;
      }

      if (err?.status === 403) {
        setError(
          "You do not have permission to view these expenses."
        );
      } else {
        setError(
          err?.message || "Could not load expenses."
        );
      }

      setExpenses([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadExpenses();
  }, [isAdmin, appliedFrom, appliedTo]);

  function update(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function openModal() {
    setForm(initialForm);
    setMessage(null);
    setShowModal(true);
  }

  function closeModal() {
    if (saving) return;

    setShowModal(false);
    setMessage(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.amount || Number(form.amount) <= 0) {
      setMessage({
        type: "error",
        text: "Amount must be greater than zero.",
      });
      return;
    }

    if (!form.category.trim()) {
      setMessage({
        type: "error",
        text: "Category is required.",
      });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      await createExpense({
        amount: form.amount,
        category: form.category.trim(),
        description: form.description.trim(),
      });

      setMessage({
        type: "success",
        text: "Expense added successfully.",
      });

      setForm(initialForm);

      await loadExpenses();

      setTimeout(() => {
        setShowModal(false);
        setMessage(null);
      }, 700);
    } catch (err) {
      console.error("[Expenses] Create failed:", err);

      if (err?.status === 401) {
        window.location.href = "/login";
        return;
      }

      if (err?.status === 403) {
        setMessage({
          type: "error",
          text: "You are not allowed to create an expense.",
        });
      } else {
        setMessage({
          type: "error",
          text:
            err?.message ||
            "Could not create expense. Please try again.",
        });
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(expense) {
    const confirmed = window.confirm(
      `Delete expense ${expense.expenseId} for ${formatAmount(
        expense.amount
      )}?`
    );

    if (!confirmed) return;

    setDeletingId(expense.expenseId);
    setError("");
    setMessage(null);

    try {
      await deleteExpense(expense.expenseId);

      setMessage({
        type: "success",
        text: "Expense deleted successfully.",
      });

      await loadExpenses();
    } catch (err) {
      console.error("[Expenses] Delete failed:", err);

      if (err?.status === 401) {
        window.location.href = "/login";
        return;
      }

      if (err?.status === 403) {
        setError(
          "You do not have permission to delete expenses."
        );
      } else {
        setError(
          err?.message ||
            "Could not delete expense. Please try again."
        );
      }
    } finally {
      setDeletingId(null);
    }
  }

  function applyDateRange() {
    if (!from || !to) {
      setError("Please select both dates.");
      return;
    }

    if (from > to) {
      setError("The start date cannot be after the end date.");
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

  const total = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount || 0),
    0
  );

  return (
    <div className="expenses-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Expenses</h1>

          <p className="page-sub">
            {isAdmin
              ? "View and manage business expenses."
              : "Record and view today's business expenses."}
          </p>
        </div>

        <button
          className="form-btn expenses-add-btn"
          onClick={openModal}
        >
          + Add Expense
        </button>
      </div>

      {isAdmin && (
        <div className="expenses-filters">
          <div className="expenses-presets">
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

          <div className="expenses-date-fields">
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
      )}

      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      {message && !showModal && (
        <div
          className={`form-message form-message--${message.type}`}
        >
          {message.text}
        </div>
      )}

      <div className="expenses-summary">
        <div className="expenses-summary-card">
          <span>
            {isAdmin
              ? "Total Expenses"
              : "Today's Expenses"}
          </span>

          <strong>{formatAmount(total)}</strong>
        </div>

        <div className="expenses-summary-card">
          <span>Number of Expenses</span>

          <strong>{expenses.length}</strong>
        </div>
      </div>

      <div className="expenses-table">
        <div
          className={
            "expenses-header" +
            (isAdmin
              ? " expenses-header--admin"
              : " expenses-header--staff")
          }
        >
          <span>Date</span>
          <span>ID</span>
          <span>Category</span>
          <span>Description</span>
          <span>Logged By</span>
          <span>Amount</span>

          {isAdmin && <span>Action</span>}
        </div>

        {loading ? (
          <div className="expenses-empty">
            Loading expenses…
          </div>
        ) : expenses.length === 0 ? (
          <div className="expenses-empty">
            No expenses found.
          </div>
        ) : (
          expenses.map((expense) => (
            <div
              className={
                "expenses-row" +
                (isAdmin
                  ? " expenses-row--admin"
                  : " expenses-row--staff")
              }
              key={expense.expenseId}
            >
              <span>
                {formatDate(expense.createdAt)}
              </span>

              <span>{expense.expenseId}</span>

              <span>{expense.category}</span>

              <span>
                {expense.description || "—"}
              </span>

              <span>
                {expense.loggedByName || "—"}
              </span>

              <strong>
                {formatAmount(expense.amount)}
              </strong>

              {isAdmin && (
                <div className="expense-actions">
                  <button
                    type="button"
                    onClick={() => handleDelete(expense)}
                    disabled={
                      deletingId === expense.expenseId
                    }
                  >
                    {deletingId === expense.expenseId
                      ? "Deleting…"
                      : "Delete"}
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {isAdmin && expenses.length > 0 && (
        <div className="expenses-total">
          <span>Total</span>
          <strong>{formatAmount(total)}</strong>
        </div>
      )}

      {showModal && (
        <div
          className="expense-modal-overlay"
          onClick={closeModal}
        >
          <div
            className="expense-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="expense-modal-header">
              <div>
                <h2>Add Expense</h2>

                <p>
                  Record a business expense.
                </p>
              </div>

              <button
                type="button"
                className="expense-modal-close"
                onClick={closeModal}
                disabled={saving}
              >
                ×
              </button>
            </div>

            <form
              className="expense-form"
              onSubmit={handleSubmit}
            >
              <label className="field">
                <span>Amount *</span>

                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  value={form.amount}
                  onChange={(event) =>
                    update(
                      "amount",
                      event.target.value
                    )
                  }
                  placeholder="15000"
                />
              </label>

              <label className="field">
                <span>Category *</span>

                <select
                  required
                  value={form.category}
                  onChange={(event) =>
                    update(
                      "category",
                      event.target.value
                    )
                  }
                >
                  <option value="">
                    Select category
                  </option>

                  {categories.map((category) => (
                    <option
                      key={category}
                      value={category}
                    >
                      {category}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Description</span>

                <textarea
                  rows="4"
                  value={form.description}
                  onChange={(event) =>
                    update(
                      "description",
                      event.target.value
                    )
                  }
                  placeholder="Bought 5 cartridges"
                />
              </label>

              {message && (
                <p
                  className={`form-message form-message--${message.type}`}
                >
                  {message.text}
                </p>
              )}

              <div className="expense-modal-actions">
                <button
                  type="button"
                  className="expense-cancel-btn"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="form-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Saving…"
                    : "Add Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}