
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  Heart,
  Menu,
  PawPrint,
  Stethoscope,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

import "./landing.scss";

const services = [
  {
    title: "Consultas veterinarias",
    description:
      "Atención profesional para controlar la salud y el bienestar de tus mascotas.",
    icon: Stethoscope,
  },
  {
    title: "Vacunación",
    description:
      "Planes de vacunación y prevención para acompañarlos en cada etapa.",
    icon: Heart,
  },
  {
    title: "Turnos",
    description:
      "Organizá las visitas al veterinario de manera sencilla y rápida.",
    icon: CalendarDays,
  },
];

function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <main className="landing">
      <header className="landing-header">
        <Link to="/" className="landing-logo" onClick={closeMenu}>
          <PawPrint size={30} />
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

      <section className="landing-hero" id="inicio">
        <div className="landing-hero-content">
          <span className="landing-label">
            Cuidamos a quienes más querés
          </span>

          <h1>
            Salud y bienestar
            <br />
            para toda su vida
          </h1>

          <p>
            Un espacio pensado para acompañar el cuidado de tus mascotas
            y facilitar la gestión de la atención veterinaria.
          </p>

          <div className="landing-hero-actions">
            <Link to="/registro" className="landing-button">
              Comenzar ahora <ArrowRight size={18} />
            </Link>

            <a href="#servicios" className="landing-secondary-button">
              Conocer nuestros servicios
            </a>
          </div>
        </div>

        <div className="landing-hero-decoration" aria-hidden="true">
          <PawPrint size={150} />
          <Heart size={42} />
        </div>
      </section>

      <section className="landing-services" id="servicios">
        <div className="landing-section-heading">
          <span className="landing-label">Nuestros servicios</span>
          <h2>Todo para cuidar mejor de ellos</h2>
          <p>
            Encontrá en un mismo lugar las herramientas para organizar
            y acompañar su atención veterinaria.
          </p>
        </div>

        <div className="landing-services-grid">
          {services.map((service) => {
            const Icon = service.icon;

            return (
              <article className="landing-service-card" key={service.title}>
                <div className="landing-service-icon">
                  <Icon size={30} />
                </div>

                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="landing-about" id="nosotros">
        <div>
          <span className="landing-label">Sobre VET</span>
          <h2>Una gestión más simple para un cuidado integral</h2>
          <p>
            VET es un sistema pensado para centralizar la información
            veterinaria y facilitar la organización de las actividades
            de atención.
          </p>
        </div>
        <div className="landing-about-icon">
          <Users size={64} />
        </div>
      </section>

      <section className="landing-contact" id="contacto">
        <span className="landing-label">Estamos para acompañarte</span>
        <h2>Comenzá a organizar el cuidado de tus mascotas</h2>
        <p>
          Accedé al sistema y conocé las funcionalidades de VET.
        </p>
        <Link to="/login" className="landing-button">
          Conocé nuestro sistema <ArrowRight size={18} />
        </Link>
      </section>

      <footer className="landing-footer">
        <div className="landing-footer-brand">
          <PawPrint size={24} />
          <strong>VET</strong>
        </div>
        <p>Gestión Veterinaria Integral</p>
        <p>© {new Date().getFullYear()} VET. Todos los derechos reservados.</p>
      </footer>
    </main>
  );
}

export default Landing;

