import { Navigate, Outlet } from "react-router-dom";
import { getAuthUser } from "../../features/auth/services/authStorage";

function RequireVet() {
    const role = getAuthUser()?.rol?.trim().toLocaleLowerCase("es");

    if (role !== "veterinario") {
        return <Navigate to="/inicio" replace />;
    }

    return <Outlet />;
}

export default RequireVet;