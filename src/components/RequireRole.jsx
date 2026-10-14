import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RequireRole({ allow = [], children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="page-loading">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allow.length > 0 && !allow.includes(user.userRole)) {
    return (
      <div className="access-denied">
        <h2>Access denied</h2>
        <p>You do not have permission to access this page.</p>
      </div>
    );
  }

  return children;
}