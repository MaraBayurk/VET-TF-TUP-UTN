import RegisterForm from "../components/RegisterForm";
import "../styles/auth.scss";
import "../styles/register-page.scss";

function RegisterPage() {
  return (
    <main className="auth-page register-page">
      <section className="auth-card register-card">
        <aside className="auth-card__sidebar">
          <div className="auth-card__decoration auth-card__decoration--top" />
          <div className="auth-card__decoration auth-card__decoration--bottom" />

          <div className="register-card__decoration register-card__decoration--circle" />
          <div className="register-card__decoration register-card__decoration--leaf" />

          <div className="auth-card__sidebar-content">
            <h1>Creá tu cuenta</h1>
            <p>
              Accedé a todos nuestros servicios y comenzá a cuidar la salud de
              tus mascotas.
            </p>
            <span className="register-card__heart" aria-hidden="true">♡</span>
          </div>
        </aside>

        <section className="auth-card__content register-card__content">
          <div className="auth-card__brand">
            <div className="auth-card__brand-icon">V</div>
            <span>VET</span>
            <small>GESTIÓN VETERINARIA</small>
          </div>

          <div className="auth-card__heading">
            <h2>Registrate</h2>
            <p>Completá tus datos para crear tu cuenta.</p>
          </div>

          <RegisterForm />
        </section>
      </section>
    </main>
  );
}

export default RegisterPage;