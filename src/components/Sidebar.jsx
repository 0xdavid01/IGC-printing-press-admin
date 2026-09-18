import { NavLink, useLocation } from "react-router-dom";
import { useEffect } from "react";
import "../css/sidebar.css";

function DashboardIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="8" height="8" rx="1.5" fill="currentColor" />
      <rect x="13" y="3" width="8" height="5" rx="1.5" fill="currentColor" opacity="0.55" />
      <rect x="13" y="10" width="8" height="11" rx="1.5" fill="currentColor" opacity="0.55" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" fill="currentColor" opacity="0.55" />
    </svg>
  );
}
function InventoryIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8l9-5 9 5-9 5-9-5Z" />
      <path d="M3 8v8l9 5 9-5V8" />
      <path d="M12 13v8" />
    </svg>
  );
}
function JobsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9V3h12v6" />
      <rect x="4" y="9" width="16" height="8" rx="1.5" />
      <path d="M6 14h12v7H6v-7Z" />
    </svg>
  );
}
function EmployeesIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="8" r="3.2" />
      <path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
      <circle cx="18" cy="8.5" r="2.3" />
      <path d="M15.5 14.3c2.5.3 4.5 2.3 4.5 5.7" />
    </svg>
  );
}
function CustomersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="8" r="3.5" />
      <path d="M3 20c0-3.9 3.1-6.5 7-6.5s7 2.6 7 6.5" />
      <path d="M18 4.5l2 2-2 2" />
      <path d="M20.5 6.5H16" />
    </svg>
  );
}
function ReportsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 3h7l4 4v14H7V3Z" />
      <path d="M14 3v4h4" />
      <path d="M9.5 13h5M9.5 16.5h5" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

const links = [
  { to: "/", label: "Dashboard", icon: DashboardIcon, end: true },
  { to: "/inventory", label: "Inventory", icon: InventoryIcon },
  { to: "/jobs", label: "Jobs", icon: JobsIcon },
  { to: "/employees", label: "Employees", icon: EmployeesIcon },
  { to: "/customers", label: "Customers", icon: CustomersIcon },
  { to: "/reports", label: "Reports", icon: ReportsIcon },
];

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();

  // Close the mobile drawer automatically whenever the route changes
  useEffect(() => {
    onClose();
  }, [location.pathname]);

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}

      <aside className={"sidebar" + (isOpen ? " is-open" : "")}>
        <div className="sidebar-brand">
          <span className="brand-badge">IA</span>
          <div className="brand-text">
            <span className="brand-name">IGC Print Press</span>
            <span className="brand-tag">PHC • Print • Packaging</span>
          </div>
          <button className="sidebar-close" onClick={onClose} aria-label="Close menu">
            <CloseIcon />
          </button>
        </div>

        <nav className="sidebar-nav">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => "sidebar-link" + (isActive ? " is-active" : "")}
            >
              <Icon />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-profile">
          <span className="profile-badge">IE</span>
          <div className="profile-text">
            <span className="profile-name">IGC Admin</span>
            <span className="profile-sub">Isoni Edisua</span>
          </div>
        </div>
      </aside>
    </>
  );
}