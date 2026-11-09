import { Link } from "react-router-dom";
import {
  ArrowRight,
  Heart,
  PawPrint,
  Users,
} from "lucide-react";

import LandingHeader from "../components/LandingHeader";
import CategoryCard from "../components/CategoryCard";
import { services } from "../data/services";
import { categories } from "../data/categories";

import heroImage from "../../../assets/img.1.png";
import aboutImage from "../../../assets/img.2.png";

import "../styles/landing.scss";

function Landing() {
  return (
    <main className="landing">
      <LandingHeader />

      {/* Sección principal */}
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

        <div className="landing-hero-image">
          <img
            src={heroImage}
            alt="Perro y gato, protagonistas del cuidado veterinario"
          />
          <div className="landing-hero-decoration" aria-hidden="true">
            <PawPrint size={42} />
            <Heart size={28} />
          </div>
        </div>
      </section>

      {/* Servicios veterinarios */}
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
              <article
                className="landing-service-card"
                key={service.title}
              >
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

      {/* Categorías y especialidades veterinarias */}
      <section className="landing-categories" id="categorias">
        <div className="landing-section-heading">
          <span className="landing-label">
            Nuestras especialidades
          </span>

          <h2>Atención veterinaria para cada necesidad</h2>

          <p>
            Conocé las distintas áreas de atención pensadas para
            acompañar la salud y el bienestar de tus mascotas.
          </p>
        </div>

        <div className="landing-categories-grid">
          {categories.map((category) => (
            <CategoryCard
              key={category.title}
              title={category.title}
              description={category.description}
              icon={category.icon}
            />
          ))}
        </div>
      </section>

      {/* Sobre VET */}
      <section className="landing-about" id="nosotros">
        <div className="landing-about-content">
          <span className="landing-label">Sobre VET</span>

          <h2>
            Una gestión más simple para un cuidado integral
          </h2>

          <p>
            VET es un sistema pensado para centralizar la información
            veterinaria y facilitar la organización de las actividades
            de atención.
          </p>
        </div>

        <div className="landing-about-image">
          <img
            src={aboutImage}
            alt="Un gato y un perro descansando juntos"
          />
          <div className="landing-about-icon" aria-hidden="true">
            <Users size={42} />
          </div>
        </div>
      </section>

      {/* Contacto */}
      <section className="landing-contact" id="contacto">
        <span className="landing-label">
          Estamos para acompañarte
        </span>

        <h2>
          Comenzá a organizar el cuidado de tus mascotas
        </h2>

        <p>
          Accedé al sistema y conocé las funcionalidades de VET.
        </p>

        <Link to="/login" className="landing-button">
          Conocé nuestro sistema <ArrowRight size={18} />
        </Link>
      </section>

      {/* Pie de página */}
      <footer className="landing-footer">
        <div className="landing-footer-brand">
          <PawPrint size={24} />
          <strong>VET</strong>
        </div>

        <p>Gestión Veterinaria Integral</p>

        <p>
          © {new Date().getFullYear()} VET. Todos los derechos reservados.
        </p>
      </footer>
    </main>
  );
}

export default Landing;
