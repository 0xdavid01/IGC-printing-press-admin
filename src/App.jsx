import { useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import {
  AuthProvider,
  useAuth,
} from "./context/AuthContext";

import RequireRole from "./components/RequireRole";

import Sidebar from "./components/Sidebar";
import MobileTopbar from "./components/MobileTopbar";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Jobs from "./pages/Jobs";
import Employees from "./pages/Employees";
import Customers from "./pages/Customers";
import UserAccounts from "./pages/UserAccounts";
import Expenses from "./pages/Expenses";
import JobDetail from "./components/JobDetail";
import Reports from "./pages/Reports";

function ProtectedAdmin() {
  const { user, loading } = useAuth();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);

  if (loading) {
    return (
      <div className="page-loading">
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  return (
    <div className="app-shell">
      <Sidebar
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
      />

      <div className="app-content">
        <MobileTopbar
          onOpen={() => setMenuOpen(true)}
        />

        <main className="app-main">
          <Routes>
            <Route
              path="/"
              element={<Dashboard />}
            />

            <Route
              path="/inventory"
              element={<Inventory />}
            />

            <Route
              path="/jobs"
              element={<Jobs />}
            />

            <Route
              path="/customers"
              element={<Customers />}
            />

            <Route
              path="/expenses"
              element={<Expenses />}
            />

            <Route
              path="/employees"
              element={
                <RequireRole
                  allow={["ADMIN", "SUPER_ADMIN"]}
                >
                  <Employees />
                </RequireRole>
              }
            />

            <Route
              path="/user-accounts"
              element={
                <RequireRole
                  allow={["ADMIN", "SUPER_ADMIN"]}
                >
                  <UserAccounts />
                </RequireRole>
              }
            />

            <Route
              path="/reports"
              element={
                <RequireRole
                  allow={["ADMIN", "SUPER_ADMIN"]}
                >
                  <Reports />
                </RequireRole>
              }
            />

            <Route
              path="/staff/jobs/:jobId"
              element={<JobDetail />}
            />

            <Route
              path="*"
              element={
                <Navigate
                  to="/"
                  replace
                />
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/*"
          element={<ProtectedAdmin />}
        />
      </Routes>
    </AuthProvider>
  );
}