
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import AuthPage from "../features/auth/pages/AuthPage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import Landing from "../features/landing/Landing";
import HomePage from "../features/dashboard/pages/HomePage";
import MainLayout from "../components/layouts/MainLayout";
import UsersPage from "../features/users/pages/UsersPage";
import UserDetailPage from "../features/users/pages/UserDetailPage";
import CreateEditUserPage from "../features/users/pages/CreateEditUserPage";

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
        <Route element={<MainLayout />}>
          <Route path="/inicio" element={<HomePage />} />
          <Route path="/usuarios" element={<UsersPage />} />
          <Route path="/usuarios/nuevo" element={<CreateEditUserPage />} />
          <Route path="/usuarios/:id/editar" element={<CreateEditUserPage />} />
          <Route path="/usuarios/:id" element={<UserDetailPage />} />
        </Route>

        {/* Rutas desconocidas */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;

