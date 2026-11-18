import { useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import {
  Bell,
  Search,
  ChevronDown,
  LogOut,
} from "lucide-react";

import Navbar from "../../Navbar/Navbar";
import { logout } from "../../../features/auth/services/authService";
import { getAuthUser } from "../../../features/auth/services/authStorage";
import "./MainLayout.scss";

function MainLayout() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [user] = useState(getAuthUser);
  const navigate = useNavigate();
  const fullName = user ? `${user.nombre} ${user.apellido}` : "Usuario";
  const initials = user
    ? `${user.nombre.charAt(0)}${user.apellido.charAt(0)}`.toUpperCase()
    : "U";
  const role = user?.rol
    ? user.rol.charAt(0).toLocaleUpperCase("es") + user.rol.slice(1)
    : "";

  const handleLogout = async () => {
    setIsUserMenuOpen(false);
    try {
      await logout();
    } catch {
      // La sesión local se limpia aunque el servidor no responda.
    } finally {
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="main-layout">
      <Navbar />

      <div className="main-layout__content">
        <header className="main-layout__topbar">
          <div className="main-layout__search">
            <Search size={18} />

            <input
              type="search"
              placeholder="Buscar cliente, mascota o turno..."
            />
          </div>

          <div className="main-layout__user">
            <button
              type="button"
              className="main-layout__notifications"
              aria-label="Notificaciones"
            >
              <Bell size={20} />
              <span />
            </button>

            <div className="main-layout__user-menu">
              <button
                type="button"
                className="main-layout__user-trigger"
                onClick={() => setIsUserMenuOpen((prev) => !prev)}
                aria-expanded={isUserMenuOpen}
                aria-haspopup="true"
              >
                <div className="main-layout__avatar">{initials}</div>

                <div className="main-layout__user-info">
                  <strong>{fullName}</strong>
                  {role && <span>{role}</span>}
                </div>

                <ChevronDown
                  size={16}
                  className={isUserMenuOpen ? "is-open" : ""}
                />
              </button>

              {isUserMenuOpen && (
                <div className="main-layout__dropdown">
                  <button
                    type="button"
                    className="main-layout__dropdown-item"
                    onClick={handleLogout}
                  >
                    <LogOut size={18} />
                    <span>Cerrar sesión</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="main-layout__main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
