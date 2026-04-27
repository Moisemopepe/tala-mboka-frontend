import { Navigate } from "react-router-dom";

export default function ProtectedAdminRoute({ children }) {
  const token = localStorage.getItem("token") || localStorage.getItem("tala_token");
  return token ? children : <Navigate to="/admin/login" replace />;
}
