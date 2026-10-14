import { useEffect, useState } from "react";
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  updateEmployeeStatus,
} from "../services/employeeService";
import "../css/employees.css";
import "../css/forms.css";

const initialForm = {
  fullName: "",
  phoneNumber: "",
  email: "",
  role: "",
  imageUrl: "",
};

function formatDate(value) {
  if (!value) return "—";

  return new Date(value).toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  async function loadEmployees(currentPage = page) {
    setLoading(true);
    setError("");

    console.log("[Employees] Loading employees...", {
      page: currentPage,
      size: 25,
    });

    try {
      console.log("[Employees] Calling getEmployees()");

      const data = await getEmployees(currentPage, 25);

      console.log("[Employees] Response received:", data);

      setEmployees(data.content || []);
      setPage(data.number ?? currentPage);
      setTotalPages(data.totalPages || 0);
    } catch (err) {
      console.error("[Employees] Failed to load employees:", err);
      console.error("[Employees] Error message:", err?.message);
      console.error("[Employees] Error status:", err?.status);
      console.error("[Employees] Error stack:", err?.stack);

      if (err?.status === 401) {
        window.location.href = "/login";
        return;
      }

      if (err?.status === 403) {
        setError("You do not have permission to manage employees.");
      } else {
        setError(err?.message || "Couldn't load employees.");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEmployees(0);
  }, []);

  function update(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function openCreateModal() {
    setEditingEmployee(null);
    setForm(initialForm);
    setMessage(null);
    setShowModal(true);
  }

  function openEditModal(employee) {
    setEditingEmployee(employee);

    setForm({
      fullName: employee.fullName || "",
      phoneNumber: employee.phoneNumber || "",
      email: employee.email || "",
      role: employee.role || "",
      imageUrl: employee.imageUrl || "",
    });

    setMessage(null);
    setShowModal(true);
  }

  function closeModal() {
    if (saving) return;

    setShowModal(false);
    setEditingEmployee(null);
    setMessage(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setSaving(true);
    setMessage(null);

    try {
      if (editingEmployee) {
        await updateEmployee(editingEmployee.employeeId, form);

        setMessage({
          type: "success",
          text: "Employee updated successfully.",
        });
      } else {
        await createEmployee(form);

        setMessage({
          type: "success",
          text: "Employee added successfully.",
        });
      }

      await loadEmployees(page);

      setTimeout(() => {
        setShowModal(false);
        setEditingEmployee(null);
        setMessage(null);
      }, 700);
    } catch (err) {
      console.error("[Employees] Save failed:", err);

      if (err?.status === 401) {
        window.location.href = "/login";
        return;
      }

      if (err?.status === 403) {
        setMessage({
          type: "error",
          text: "You are not allowed to perform this action.",
        });
      } else {
        setMessage({
          type: "error",
          text: err?.message || "Something went wrong. Please try again.",
        });
      }
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(employee) {
    const nextStatus =
      employee.employeeStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    try {
      await updateEmployeeStatus(employee.employeeId, nextStatus);

      await loadEmployees(page);
    } catch (err) {
      console.error("[Employees] Status update failed:", err);

      if (err?.status === 401) {
        window.location.href = "/login";
        return;
      }

      if (err?.status === 403) {
        setError("You do not have permission to update employee status.");
      } else {
        setError(err?.message || "Couldn't update employee status.");
      }
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Employees</h1>
          <p className="page-sub">
            Manage employee records and status.
          </p>
        </div>

        <button
          className="form-btn employees-add-btn"
          onClick={openCreateModal}
        >
          + Add Employee
        </button>
      </div>

      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      <div className="employees-table">
        <div className="employees-header">
          <span>Employee</span>
          <span>Phone</span>
          <span>Email</span>
          <span>Role</span>
          <span>Status</span>
          <span>Joined</span>
          <span></span>
        </div>

        {loading ? (
          <div className="employees-empty">
            Loading employees…
          </div>
        ) : employees.length === 0 ? (
          <div className="employees-empty">
            No employees found.
          </div>
        ) : (
          employees.map((employee) => (
            <div
              className="employees-row"
              key={employee.employeeId}
            >
              <div className="employee-name-cell">
                <div className="employee-avatar">
                  {employee.fullName?.charAt(0)?.toUpperCase() || "?"}
                </div>

                <div>
                  <strong>{employee.fullName}</strong>
                  <small>{employee.employeeId}</small>
                </div>
              </div>

              <span>{employee.phoneNumber}</span>

              <span>{employee.email}</span>

              <span>{employee.role}</span>

              <span>
                <span
                  className={`employee-status employee-status--${employee.employeeStatus?.toLowerCase()}`}
                >
                  {employee.employeeStatus}
                </span>
              </span>

              <span>
                {formatDate(employee.createdAt)}
              </span>

              <div className="employee-actions">
                <button
                  onClick={() => openEditModal(employee)}
                >
                  Edit
                </button>

                <button
                  onClick={() => toggleStatus(employee)}
                >
                  {employee.employeeStatus === "ACTIVE"
                    ? "Deactivate"
                    : "Activate"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="employees-pagination">
          <button
            disabled={page === 0}
            onClick={() => loadEmployees(page - 1)}
          >
            Previous
          </button>

          <span>
            Page {page + 1} of {totalPages}
          </span>

          <button
            disabled={page >= totalPages - 1}
            onClick={() => loadEmployees(page + 1)}
          >
            Next
          </button>
        </div>
      )}

      {showModal && (
        <div
          className="employee-modal-overlay"
          onClick={closeModal}
        >
          <div
            className="employee-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="employee-modal-header">
              <div>
                <h2>
                  {editingEmployee
                    ? "Edit Employee"
                    : "Add Employee"}
                </h2>

                <p>
                  {editingEmployee
                    ? "Update employee information."
                    : "Add a staff member to the employee directory."}
                </p>
              </div>

              <button
                className="employee-modal-close"
                onClick={closeModal}
                disabled={saving}
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="employee-form"
            >
              <label className="field">
                <span>Full Name *</span>

                <input
                  type="text"
                  required
                  value={form.fullName}
                  onChange={(e) =>
                    update("fullName", e.target.value)
                  }
                  placeholder="Ada Okafor"
                />
              </label>

              <div className="field-grid">
                <label className="field">
                  <span>Phone Number *</span>

                  <input
                    type="tel"
                    required
                    value={form.phoneNumber}
                    onChange={(e) =>
                      update("phoneNumber", e.target.value)
                    }
                    placeholder="+2348031234567"
                  />
                </label>

                <label className="field">
                  <span>Email *</span>

                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) =>
                      update("email", e.target.value)
                    }
                    placeholder="ada@igc.com"
                  />
                </label>
              </div>

              <label className="field">
                <span>Role *</span>

                <input
                  type="text"
                  required
                  value={form.role}
                  onChange={(e) =>
                    update("role", e.target.value)
                  }
                  placeholder="PRINTER"
                />
              </label>

              <label className="field">
                <span>Image URL</span>

                <input
                  type="url"
                  value={form.imageUrl}
                  onChange={(e) =>
                    update("imageUrl", e.target.value)
                  }
                  placeholder="https://example.com/photo.jpg"
                />
              </label>

              {message && (
                <p
                  className={`form-message form-message--${message.type}`}
                >
                  {message.text}
                </p>
              )}

              <div className="employee-modal-actions">
                <button
                  type="button"
                  className="employee-cancel-btn"
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
                    : editingEmployee
                      ? "Save Changes"
                      : "Add Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}