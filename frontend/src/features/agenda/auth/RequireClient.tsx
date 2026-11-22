
import { Navigate, Outlet } from "react-router-dom";
import {
  AUTH_TOKEN_KEY,
  getAuthUser,
} from "../../auth/services/authStorage";

function RequireClient() {
  const user = getAuthUser();
  const token = localStorage.getItem(AUTH_TOKEN_KEY);

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  const role = user.rol?.trim().toLocaleLowerCase("es");

  if (role !== "cliente") {
    return <Navigate to="/inicio" replace />;
  }

  return <Outlet />;
}

export default RequireClient;

