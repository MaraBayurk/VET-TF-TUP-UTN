import { Navigate, Outlet } from "react-router-dom";
import { AUTH_TOKEN_KEY, getAuthUser } from "../../features/auth/services/authStorage";

function RequireStaff() {
  const user = getAuthUser();
  if (!localStorage.getItem(AUTH_TOKEN_KEY) || !user) return <Navigate to="/login" replace />;
  const role = user.rol?.trim().toLocaleLowerCase("es");
  if (role !== "administrador" && role !== "veterinario") return <Navigate to="/inicio" replace />;
  return <Outlet />;
}

export default RequireStaff;
