import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  logout,
  changePassword,
} from "../services/authService";
import logo from "../assets/igc-logo.png";
import "../css/sidebar.css";

function DashboardIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect
        x="3"
        y="3"
        width="8"
        height="8"
        rx="1.5"
        fill="currentColor"
      />
      <rect
        x="13"
        y="3"
        width="8"
        height="5"
        rx="1.5"
        fill="currentColor"
        opacity="0.55"
      />
      <rect
        x="13"
        y="10"
        width="8"
        height="11"
        rx="1.5"
        fill="currentColor"
        opacity="0.55"
      />
      <rect
        x="3"
        y="13"
        width="8"
        height="8"
        rx="1.5"
        fill="currentColor"
        opacity="0.55"
      />
    </svg>
  );
}

function InventoryIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 8l9-5 9 5-9 5-9-5Z" />
      <path d="M3 8v8l9 5 9-5V8" />
      <path d="M12 13v8" />
    </svg>
  );
}

function JobsIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9V3h12v6" />
      <rect
        x="4"
        y="9"
        width="16"
        height="8"
        rx="1.5"
      />
      <path d="M6 14h12v7H6v-7Z" />
    </svg>
  );
}

function EmployeesIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="8" r="3.2" />
      <path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
      <circle cx="18" cy="8.5" r="2.3" />
      <path d="M15.5 14.3c2.5.3 4.5 2.3 4.5 5.7" />
    </svg>
  );
}

function CustomersIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="10" cy="8" r="3.5" />
      <path d="M3 20c0-3.9 3.1-6.5 7-6.5s7 2.6 7 6.5" />
      <path d="M18 4.5l2 2-2 2" />
      <path d="M20.5 6.5H16" />
    </svg>
  );
}

function UserAccountsIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 21c0-4 3-6.5 7-6.5s7 2.5 7 6.5" />
      <path d="M19 5v4M17 7h4" />
    </svg>
  );
}

function ExpensesIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 3h12v18H6z" />
      <path d="M9 7h6" />
      <path d="M9 11h6" />
      <path d="M9 15h3" />
      <path d="M15 15h0" />
    </svg>
  );
}

function ReportsIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 3h7l4 4v14H7V3Z" />
      <path d="M14 3v4h4" />
      <path d="M9.5 13h5M9.5 16.5h5" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 4H5.5A1.5 1.5 0 0 0 4 5.5v13A1.5 1.5 0 0 0 5.5 20H9" />
      <path d="M14 8l4 4-4 4" />
      <path d="M18 12H9" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect
        x="5"
        y="10"
        width="14"
        height="10"
        rx="2"
      />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

const links = [
  {
    to: "/",
    label: "Dashboard",
    icon: DashboardIcon,
    end: true,
  },
  {
    to: "/inventory",
    label: "Inventory",
    icon: InventoryIcon,
  },
  {
    to: "/jobs",
    label: "Jobs",
    icon: JobsIcon,
  },
  {
    to: "/employees",
    label: "Employees",
    icon: EmployeesIcon,
    adminOnly: true,
  },
  {
    to: "/customers",
    label: "Customers",
    icon: CustomersIcon,
  },
  {
    to: "/user-accounts",
    label: "User Accounts",
    icon: UserAccountsIcon,
    adminOnly: true,
  },
  {
    to: "/expenses",
    label: "Expenses",
    icon: ExpensesIcon,
  },
  {
    to: "/reports",
    label: "Reports",
    icon: ReportsIcon,
    adminOnly: true,
  },
];

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const { user } = useAuth();

  const [showPasswordModal, setShowPasswordModal] =
    useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [passwordError, setPasswordError] = useState("");
  const [passwordMessage, setPasswordMessage] =
    useState("");

  const [changingPassword, setChangingPassword] =
    useState(false);

  const isAdmin =
    user?.userRole === "ADMIN" ||
    user?.userRole === "SUPER_ADMIN";

  const visibleLinks = links.filter(
    (link) => !link.adminOnly || isAdmin
  );

  const fullName = user
    ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
    : "";

  const initials = user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase()
    : "";

  useEffect(() => {
    onClose();
  }, [location.pathname]);

  function openPasswordModal() {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
    setPasswordMessage("");
    setShowPasswordModal(true);
  }

  function closePasswordModal() {
    if (changingPassword) return;

    setShowPasswordModal(false);
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
    setPasswordMessage("");
  }

  async function handleChangePassword(event) {
    event.preventDefault();

    setPasswordError("");
    setPasswordMessage("");

    if (!oldPassword.trim()) {
      setPasswordError("Current password is required.");
      return;
    }

    if (!newPassword.trim()) {
      setPasswordError("New password is required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setChangingPassword(true);

    try {
      await changePassword(
        oldPassword,
        newPassword
      );

      setPasswordMessage(
        "Password updated. Redirecting to login..."
      );

      setTimeout(() => {
        window.location.href = "/login";
      }, 700);
    } catch (err) {
      console.error(
        "[Auth] Password change failed:",
        err
      );

      if (err?.status === 401) {
        window.location.href = "/login";
        return;
      }

      if (err?.status === 400) {
        setPasswordError(
          err?.message ||
            "Current password is incorrect"
        );
      } else {
        setPasswordError(
          "Could not change password"
        );
      }
    } finally {
      setChangingPassword(false);
    }
  }

  async function handleLogout() {
    try {
      await logout();
    } catch (err) {
      console.error(
        "[Auth] Logout failed:",
        err
      );
    } finally {
      window.location.href = "/login";
    }
  }

  return (
    <>
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
        />
      )}

      <aside
        className={
          "sidebar" + (isOpen ? " is-open" : "")
        }
      >
        <div className="sidebar-brand">
          <div className="brand-text">
            <span className="brand-logo">
              <img
                src={logo}
                alt="IGC Print Press"
                className="brand-logo-img"
              />
            </span>

            <span className="brand-tag">
              PHC • Print • Packaging
            </span>
          </div>

          <button
            className="sidebar-close"
            onClick={onClose}
            aria-label="Close menu"
          >
            <CloseIcon />
          </button>
        </div>

        <nav className="sidebar-nav">
          {visibleLinks.map(
            ({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  "sidebar-link" +
                  (isActive ? " is-active" : "")
                }
              >
                <Icon />
                <span>{label}</span>
              </NavLink>
            )
          )}
        </nav>

        <div className="sidebar-profile">
          <span className="profile-badge">
            {initials}
          </span>

          <div className="profile-text">
            <span className="profile-name">
              {user?.userRole || ""}
            </span>

            <span className="profile-sub">
              {fullName}
            </span>
          </div>

          <div className="sidebar-profile-actions">
            <button
              type="button"
              className="sidebar-profile-action"
              onClick={openPasswordModal}
              aria-label="Change password"
              title="Change password"
            >
              <LockIcon />
            </button>

            <button
              type="button"
              className="sidebar-profile-action sidebar-logout"
              onClick={handleLogout}
              aria-label="Logout"
              title="Logout"
            >
              <LogoutIcon />
            </button>
          </div>
        </div>
      </aside>

      {showPasswordModal && (
        <div
          className="password-modal-overlay"
          onClick={closePasswordModal}
        >
          <div
            className="password-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="password-modal-header">
              <div>
                <h2>Change Password</h2>

                <p>
                  Update your account password.
                </p>
              </div>

              <button
                type="button"
                className="password-modal-close"
                onClick={closePasswordModal}
                disabled={changingPassword}
              >
                ×
              </button>
            </div>

            <form
              className="password-form"
              onSubmit={handleChangePassword}
            >
              <label className="password-field">
                <span>Current password *</span>

                <input
                  type="password"
                  value={oldPassword}
                  onChange={(event) =>
                    setOldPassword(
                      event.target.value
                    )
                  }
                  autoComplete="current-password"
                  placeholder="Enter current password"
                  disabled={changingPassword}
                />
              </label>

              <label className="password-field">
                <span>New password *</span>

                <input
                  type="password"
                  value={newPassword}
                  onChange={(event) =>
                    setNewPassword(
                      event.target.value
                    )
                  }
                  autoComplete="new-password"
                  placeholder="Enter new password"
                  disabled={changingPassword}
                />
              </label>

              <label className="password-field">
                <span>Confirm new password *</span>

                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value
                    )
                  }
                  autoComplete="new-password"
                  placeholder="Confirm new password"
                  disabled={changingPassword}
                />
              </label>

              {passwordError && (
                <p className="password-message password-message--error">
                  {passwordError}
                </p>
              )}

              {passwordMessage && (
                <p className="password-message password-message--success">
                  {passwordMessage}
                </p>
              )}

              <div className="password-modal-actions">
                <button
                  type="button"
                  className="password-cancel-btn"
                  onClick={closePasswordModal}
                  disabled={changingPassword}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="form-btn"
                  disabled={changingPassword}
                >
                  {changingPassword
                    ? "Updating…"
                    : "Change Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}