import { useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import {
  Bell,
  Search,
  ChevronDown,
  LogOut,
} from "lucide-react";

import Navbar from "../../Navbar/Navbar";
import "./MainLayout.scss";

function MainLayout() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsUserMenuOpen(false);
    navigate("/login");
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
                <div className="main-layout__avatar">U</div>

                <div className="main-layout__user-info">
                  <strong>Usuario</strong>
                  <span>Administrador</span>
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
