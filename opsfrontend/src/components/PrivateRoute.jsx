import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../services/Auth";

export default function PrivateRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/" />;
}
