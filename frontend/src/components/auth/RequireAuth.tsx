import { Navigate, Outlet } from "react-router-dom";
import { AUTH_TOKEN_KEY, getAuthUser } from "../../features/auth/services/authStorage";

function RequireAuth() {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const user = getAuthUser();
  if (!token || !user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export default RequireAuth;
