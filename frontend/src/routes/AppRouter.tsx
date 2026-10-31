import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import AuthPage from "../features/auth/pages/AuthPage";
import RegisterPage from "../features/auth/pages/RegisterPage";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route path="/registro" element={<RegisterPage />} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;