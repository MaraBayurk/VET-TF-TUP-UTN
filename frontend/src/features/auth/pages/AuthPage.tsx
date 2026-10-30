import LoginForm from "../components/LoginForm";
import "../styles/ auth.scss"

function AuthPage() {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <aside className="auth-card__sidebar">
          <div className="auth-card__decoration auth-card__decoration--top" />
          <div className="auth-card__decoration auth-card__decoration--bottom" />

          <div className="auth-card__sidebar-content">
            <h1>
              Siempre
              <br />
              junto a ellos
            </h1>

            <p>
              Salud, bienestar y
              <br />
              una vida más feliz
              <br />
              para tus mascotas.
            </p>
          </div>
        </aside>

        <section className="auth-card__content">
          <div className="auth-card__brand">
            <div className="auth-card__brand-icon">V</div>
            <span>VET</span>
            <small>GESTIÓN VETERINARIA</small>
          </div>

          <div className="auth-card__heading">
            <h2>¡Bienvenido/a!</h2>
            <p>Iniciá sesión para continuar.</p>
          </div>

          <LoginForm />
        </section>
      </section>
    </main>
  );
}

export default AuthPage;