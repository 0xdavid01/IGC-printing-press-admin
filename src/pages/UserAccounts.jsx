import { useEffect, useState } from "react";
import {
  createUser,
  getUsers,
  updateUserStatus
} from "../services/adminUsersService";
import { useAuth } from "../context/AuthContext";
import "../css/useraccounts.css";
import "../css/forms.css";

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  userRole: "STAFF"
};

export default function UserAccounts() {
  const { user } = useAuth();

  const [form, setForm] = useState(initialForm);
  const [users, setUsers] = useState([]);

  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState(null);

  const [message, setMessage] = useState(null);

  const isSuperAdmin = user?.userRole === "SUPER_ADMIN";
  const currentUserId = user?.userId;

  useEffect(() => {
    loadUsers();
  }, [page, roleFilter, statusFilter]);

  async function loadUsers() {
    setLoading(true);

    try {
      const response = await getUsers({
        userRole: roleFilter,
        status: statusFilter,
        page,
        size: 25
      });

      setUsers(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (err) {
      if (err.status === 401) {
        window.location.href = "/login";
        return;
      }

      if (err.status === 403) {
        setMessage({
          type: "error",
          text: "You do not have permission to view user accounts."
        });
      } else {
        setMessage({
          type: "error",
          text: "Something went wrong while loading user accounts."
        });
      }
    } finally {
      setLoading(false);
    }
  }

  function update(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  function handleRoleFilter(value) {
    setRoleFilter(value);
    setPage(0);
  }

  function handleStatusFilter(value) {
    setStatusFilter(value);
    setPage(0);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setSaving(true);
    setMessage(null);

    try {
      const account = await createUser(form);

      setForm(initialForm);

      setMessage({
        type: "success",
        text: `${account.firstName} ${account.lastName}'s account was created successfully.`
      });

      setPage(0);

      await loadUsers();
    } catch (err) {
      if (err.status === 401) {
        window.location.href = "/login";
        return;
      }

      if (err.status === 403) {
        setMessage({
          type: "error",
          text: "You do not have permission to create this account."
        });
      } else if (err.status === 400) {
        setMessage({
          type: "error",
          text: "Please check your input."
        });
      } else {
        setMessage({
          type: "error",
          text: "Something went wrong while creating the account. Please try again."
        });
      }
    } finally {
      setSaving(false);
    }
  }

  function canChangeStatus(account) {
    if (!user) {
      return false;
    }

    if (account.userId === currentUserId) {
      return false;
    }

    if (isSuperAdmin) {
      return true;
    }

    if (user.userRole === "ADMIN") {
      return account.userRole === "STAFF";
    }

    return false;
  }

  async function handleStatusChange(account) {
    if (!canChangeStatus(account)) {
      return;
    }

    const nextStatus =
      account.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    setUpdatingUserId(account.userId);
    setMessage(null);

    try {
      const updatedUser = await updateUserStatus(
        account.userId,
        nextStatus
      );

      setUsers((current) =>
        current.map((item) =>
          item.userId === updatedUser.userId
            ? updatedUser
            : item
        )
      );

      setMessage({
        type: "success",
        text: `${updatedUser.firstName} ${updatedUser.lastName} is now ${updatedUser.status.toLowerCase()}.`
      });
    } catch (err) {
      if (err.status === 401) {
        window.location.href = "/login";
        return;
      }

      if (err.status === 403) {
        setMessage({
          type: "error",
          text: "You don't have permission to change this user's status."
        });
      } else if (err.status === 400) {
        setMessage({
          type: "error",
          text: "Please check the request."
        });
      } else {
        setMessage({
          type: "error",
          text: "Something went wrong while changing the user's status."
        });
      }
    } finally {
      setUpdatingUserId(null);
    }
  }

  function formatDate(value) {
    if (!value) {
      return "—";
    }

    return new Date(value).toLocaleDateString("en-NG", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  }

  function formatRole(role) {
    if (!role) {
      return "";
    }

    return role
      .replace("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">User Accounts</h1>
          <p className="page-sub">
            Manage login accounts and system access.
          </p>
        </div>
      </div>

      <div className="user-account-layout">
        <div className="form-panel user-account-panel">
          <h2 className="form-panel-title">Create Login Account</h2>

          <p className="user-account-note">
            This creates a system login account. It does not create an employee record.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="field-grid">
              <label className="field">
                <span>First Name *</span>

                <input
                  type="text"
                  required
                  value={form.firstName}
                  onChange={(e) =>
                    update("firstName", e.target.value)
                  }
                  placeholder="Ada"
                />
              </label>

              <label className="field">
                <span>Last Name *</span>

                <input
                  type="text"
                  required
                  value={form.lastName}
                  onChange={(e) =>
                    update("lastName", e.target.value)
                  }
                  placeholder="Okafor"
                />
              </label>
            </div>

            <label className="field user-account-field">
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

            <label className="field user-account-field">
              <span>Password *</span>

              <input
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={(e) =>
                  update("password", e.target.value)
                }
                placeholder="Enter password"
              />
            </label>

            <label className="field user-account-field">
              <span>System Role *</span>

              <select
                value={form.userRole}
                onChange={(e) =>
                  update("userRole", e.target.value)
                }
              >
                <option value="STAFF">Staff</option>

                {isSuperAdmin && (
                  <option value="ADMIN">Admin</option>
                )}

                {isSuperAdmin && (
                  <option value="SUPER_ADMIN">
                    Super Admin
                  </option>
                )}
              </select>
            </label>

            {!isSuperAdmin && (
              <p className="user-account-role-note">
                As an ADMIN, you can only create STAFF accounts.
              </p>
            )}

            {message && (
              <p className={`form-message form-message--${message.type}`}>
                {message.text}
              </p>
            )}

            <button
              type="submit"
              className="form-btn"
              disabled={saving}
            >
              {saving ? "Creating…" : "Create Account"}
            </button>
          </form>
        </div>
      </div>

      <div className="user-list-panel">
        <div className="user-list-header">
          <div>
            <h2 className="section-title">User Accounts</h2>

            <p className="user-list-count">
              {totalElements} account
              {totalElements === 1 ? "" : "s"}
            </p>
          </div>

          <div className="user-filters">
            <select
              value={roleFilter}
              onChange={(e) =>
                handleRoleFilter(e.target.value)
              }
            >
              <option value="">All Roles</option>
              <option value="STAFF">Staff</option>
              <option value="ADMIN">Admin</option>
              <option value="SUPER_ADMIN">
                Super Admin
              </option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) =>
                handleStatusFilter(e.target.value)
              }
            >
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>

        {message && (
          <div className={`user-list-message user-list-message--${message.type}`}>
            {message.text}
          </div>
        )}

        {loading ? (
          <div className="user-list-loading">
            Loading user accounts...
          </div>
        ) : users.length === 0 ? (
          <div className="user-list-empty">
            No user accounts found.
          </div>
        ) : (
          <div className="user-table-wrap">
            <table className="user-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {users.map((account) => {
                  const canChange = canChangeStatus(account);
                  const updating =
                    updatingUserId === account.userId;

                  return (
                    <tr key={account.userId}>
                      <td>
                        <div className="user-table-person">
                          <div className="user-table-avatar">
                            {account.firstName
                              ?.charAt(0)
                              ?.toUpperCase() || "?"}
                          </div>

                          <div>
                            <strong>
                              {account.firstName}{" "}
                              {account.lastName}
                            </strong>

                            <span>
                              {account.userId}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>{account.email}</td>

                      <td>
                        <span
                          className={`account-role account-role--${account.userRole.toLowerCase()}`}
                        >
                          {formatRole(account.userRole)}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`user-status user-status--${account.status.toLowerCase()}`}
                        >
                          {account.status}
                        </span>
                      </td>

                      <td>
                        {formatDate(account.createdAt)}
                      </td>

                      <td>
                        {canChange ? (
                          <button
                            type="button"
                            className={
                              account.status === "ACTIVE"
                                ? "user-status-btn user-status-btn--deactivate"
                                : "user-status-btn user-status-btn--activate"
                            }
                            disabled={updating}
                            onClick={() =>
                              handleStatusChange(account)
                            }
                          >
                            {updating
                              ? "Updating..."
                              : account.status === "ACTIVE"
                                ? "Deactivate"
                                : "Activate"}
                          </button>
                        ) : (
                          <span className="user-status-action-muted">
                            —
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="user-pagination">
            <button
              type="button"
              disabled={page === 0}
              onClick={() =>
                setPage((current) => current - 1)
              }
            >
              Previous
            </button>

            <span>
              Page {page + 1} of {totalPages}
            </span>

            <button
              type="button"
              disabled={page >= totalPages - 1}
              onClick={() =>
                setPage((current) => current + 1)
              }
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}