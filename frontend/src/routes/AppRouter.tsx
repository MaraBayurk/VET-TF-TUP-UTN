import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import AuthPage from "../features/auth/pages/AuthPage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import Landing from "../features/landing/pages/landing";
import HomePage from "../features/dashboard/pages/HomePage";
import MainLayout from "../components/layouts/MainLayout";
import UsersPage from "../features/users/pages/UsersPage";
import UserDetailPage from "../features/users/pages/UserDetailPage";
import CreateEditUserPage from "../features/users/pages/CreateEditUserPage";
import PetsPage from "../features/pets/pages/PetsPage";
import CreateEditPetPage from "../features/pets/pages/CreateEditPetPage";
import PetDetailPage from "../features/pets/pages/PetDetailPage";
import RequireAdmin from "../components/auth/RequireAdmin";
import RequireStaff from "../components/auth/RequireStaff";
import ClientsPage from "../features/clients/pages/ClientsPage";
import ClientDetailPage from "../features/clients/pages/ClientDetailPage";
import CreateEditClientPage from "../features/clients/pages/CreateEditClientPage";
import RequireAuth from "../components/auth/RequireAuth";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Página pública */}
        <Route path="/" element={<Landing />} />

        {/* Autenticación */}
        <Route path="/login" element={<AuthPage />} />
        <Route path="/registro" element={<RegisterPage />} />

        {/* Secciones internas */}
        <Route element={<RequireAuth />}>
          <Route element={<MainLayout />}>
            <Route path="/inicio" element={<HomePage />} />
            <Route element={<RequireAdmin />}>
              <Route path="/usuarios" element={<UsersPage />} />
              <Route path="/usuarios/nuevo" element={<CreateEditUserPage />} />
              <Route path="/usuarios/:id/editar" element={<CreateEditUserPage />} />
              <Route path="/usuarios/:id" element={<UserDetailPage />} />
            </Route>
            <Route element={<RequireStaff />}>
              <Route path="/clientes" element={<ClientsPage />} />
              <Route path="/clientes/nuevo" element={<CreateEditClientPage />} />
              <Route path="/clientes/:id/editar" element={<CreateEditClientPage />} />
              <Route path="/clientes/:id" element={<ClientDetailPage />} />
            </Route>
            <Route path="/mascotas" element={<PetsPage />} />
            <Route path="/mascotas/nueva" element={<CreateEditPetPage />} />
            <Route path="/mascotas/:id/editar" element={<CreateEditPetPage />} />
            <Route path="/mascotas/:id" element={<PetDetailPage />} />
          </Route>
        </Route>

        {/* Rutas desconocidas */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;

