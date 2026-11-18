import { Link } from "react-router-dom";
import { ChevronDown, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

import logo from "../../../assets/logo.png";
import { logout } from "../../auth/services/authService";
import { AUTH_TOKEN_KEY, getAuthUser } from "../../auth/services/authStorage";

function LandingHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [user, setUser] = useState(() =>
    localStorage.getItem(AUTH_TOKEN_KEY) ? getAuthUser() : null,
  );
  const isAuthenticated = Boolean(user && localStorage.getItem(AUTH_TOKEN_KEY));
  const fullName = user ? `${user.nombre} ${user.apellido}` : "Usuario";
  const initials = user
    ? `${user.nombre.charAt(0)}${user.apellido.charAt(0)}`.toLocaleUpperCase("es")
    : "U";
  const role = typeof user?.rol === "string"
    ? user.rol.charAt(0).toLocaleUpperCase("es") + user.rol.slice(1)
    : "";

  const closeMenu = () => {
    setMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  const handleLogout = async () => {
    setIsUserMenuOpen(false);
    try {
      await logout();
    } catch {
      // La sesión local se limpia aunque el servidor no responda.
    } finally {
      setUser(null);
      closeMenu();
    }
  };

  return (
    <header className="landing-header">
      <Link to="/" className="landing-logo" onClick={closeMenu}>
        <img
          src={logo}
          alt="VET - Gestión Veterinaria Integral"
          className="landing-logo-image"
        />

        <span>
          <strong>VET</strong>
          <small>Gestión Veterinaria Integral</small>
        </span>
      </Link>

      <button
        className="landing-menu-toggle"
        type="button"
        aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {menuOpen ? <X /> : <Menu />}
      </button>

      <nav className={`landing-nav ${menuOpen ? "is-open" : ""}`}>
        <a href="#inicio" onClick={closeMenu}>Inicio</a>
        <a href="#servicios" onClick={closeMenu}>Servicios</a>
        <a href="#nosotros" onClick={closeMenu}>Nosotros</a>
        <a href="#contacto" onClick={closeMenu}>Contacto</a>

        <div className="landing-nav-actions">
          {isAuthenticated ? (
            <div className="main-layout__user-menu landing-user-menu">
              <button
                type="button"
                className="main-layout__user-trigger landing-user-trigger"
                onClick={() => setIsUserMenuOpen(previous => !previous)}
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
                <div className="main-layout__dropdown" role="menu">
                  <button
                    type="button"
                    className="main-layout__dropdown-item"
                    onClick={handleLogout}
                    role="menuitem"
                  >
                    <LogOut size={18} />
                    <span>Cerrar sesión</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="landing-login" onClick={closeMenu}>
                Iniciar sesión
              </Link>
              <Link to="/registro" className="landing-register" onClick={closeMenu}>
                Registrarse
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

export default LandingHeader;
