import { Navigate, Outlet } from "react-router-dom";
import { AUTH_TOKEN_KEY, getAuthUser } from "../../features/auth/services/authStorage";

function RequireAdmin() {
  const user = getAuthUser();
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (!token || !user) return <Navigate to="/login" replace />;
  if (typeof user.rol !== "string" || user.rol.trim().toLocaleLowerCase("es") !== "administrador") {
    return <Navigate to="/inicio" replace />;
  }
  return <Outlet />;
}

export default RequireAdmin;
