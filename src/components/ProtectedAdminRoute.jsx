import { Navigate } from "react-router-dom";

export default function ProtectedAdminRoute({ children }) {
  const token = localStorage.getItem("token") || localStorage.getItem("tala_token");
  const storedUser = localStorage.getItem("tala_user");
  let role = "";

  try {
    role = storedUser ? JSON.parse(storedUser)?.role : "";
  } catch {
    localStorage.removeItem("tala_user");
  }

  return token && ["admin", "moderator", "demo"].includes(role) ? children : <Navigate to="/admin/login" replace />;
}
