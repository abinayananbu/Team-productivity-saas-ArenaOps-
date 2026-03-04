// ✅ Fix — wait for auth to finish loading first
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null; // or a spinner: <div>Loading...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children || <Outlet />;
}