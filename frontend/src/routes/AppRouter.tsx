
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import AuthPage from "../features/auth/pages/AuthPage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import HomePage from "../features/dashboard/pages/HomePage";
import MainLayout from "../components/layouts/MainLayout";
import UsersPage from "../features/users/pages/UsersPage";
import UserDetailPage from "../features/users/pages/UserDetailPage";
import CreateUserPage from "../features/users/pages/CreateUserPage";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<AuthPage />} />
        <Route path="/registro" element={<RegisterPage />} />

        {/* Rutas internas */}
        <Route element={<MainLayout />}>
          <Route path="/inicio" element={<HomePage />} />
          <Route path="/usuarios" element={<UsersPage />} />
          <Route path="/usuarios/nuevo" element={<CreateUserPage />} />
          <Route path="/usuarios/:id" element={<UserDetailPage />} />
        </Route>

        {/* Redirección inicial */}
        <Route path="/" element={<Navigate to="/inicio" replace />} />

         {/* Ruta desconocida */}
        <Route path="*" element={<Navigate to="/inicio" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
