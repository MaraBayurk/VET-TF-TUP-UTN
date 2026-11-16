import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";

import logo from "../../../assets/logo.png";

function LandingHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

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
          <Link to="/login" className="landing-login" onClick={closeMenu}>
            Iniciar sesión
          </Link>

          <Link to="/registro" className="landing-register" onClick={closeMenu}>
            Registrarse
          </Link>
        </div>
      </nav>
    </header>
  );
}

export default LandingHeader;
