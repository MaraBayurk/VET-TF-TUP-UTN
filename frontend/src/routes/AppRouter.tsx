
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
import RequireAuth from "../components/auth/RequireAuth";

import RequireClient from "../features/agenda/auth/RequireClient";

import ClientsPage from "../features/clients/pages/ClientsPage";
import ClientDetailPage from "../features/clients/pages/ClientDetailPage";
import CreateEditClientPage from "../features/clients/pages/CreateEditClientPage";

import {
  AdminAppointmentsPage,
  ClientAppointmentsPage,
  NewAppointmentPage,
} from "../features/agenda";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />

        <Route path="/login" element={<AuthPage />} />
        <Route path="/registro" element={<RegisterPage />} />

        <Route element={<RequireAuth />}>
          <Route element={<MainLayout />}>
            <Route path="/inicio" element={<HomePage />} />

            {/* Turnos para clientes */}
            <Route element={<RequireClient />}>
              <Route
                path="/turnos"
                element={<ClientAppointmentsPage />}
              />
              <Route
                path="/turnos/nuevo"
                element={<NewAppointmentPage />}
              />
            </Route>

            {/* Administración de usuarios y turnos */}
            <Route element={<RequireAdmin />}>
              <Route path="/usuarios" element={<UsersPage />} />
              <Route
                path="/usuarios/nuevo"
                element={<CreateEditUserPage />}
              />
              <Route
                path="/usuarios/:id/editar"
                element={<CreateEditUserPage />}
              />
              <Route
                path="/usuarios/:id"
                element={<UserDetailPage />}
              />

              {/* Gestión de turnos del administrador */}
              <Route
                path="/admin/turnos"
                element={<AdminAppointmentsPage />}
              />
            </Route>

            {/* Gestión de clientes */}
            <Route element={<RequireStaff />}>
              <Route path="/clientes" element={<ClientsPage />} />
              <Route
                path="/clientes/nuevo"
                element={<CreateEditClientPage />}
              />
              <Route
                path="/clientes/:id/editar"
                element={<CreateEditClientPage />}
              />
              <Route
                path="/clientes/:id"
                element={<ClientDetailPage />}
              />
            </Route>

            {/* Gestión de mascotas */}
            <Route path="/mascotas" element={<PetsPage />} />
            <Route
              path="/mascotas/nueva"
              element={<CreateEditPetPage />}
            />
            <Route
              path="/mascotas/:id/editar"
              element={<CreateEditPetPage />}
            />
            <Route
              path="/mascotas/:id"
              element={<PetDetailPage />}
            />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;

