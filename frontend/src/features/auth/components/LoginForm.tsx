import { useState, type FormEvent } from "react";
import "../styles/login-form.scss";

function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!username.trim() || !password) {
      setError("Completá tu usuario y contraseña.");
      return;
    }

    setError("La autenticación todavía no está conectada.");
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <div className="login-form__field">
        <label htmlFor="username">Usuario</label>

        <input
          id="username"
          type="text"
          placeholder="Ingresá tu usuario"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          autoComplete="username"
        />
      </div>

      <div className="login-form__field">
        <label htmlFor="password">Contraseña</label>

        <div className="login-form__password">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Ingresá tu contraseña"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
          />

          <button
            type="button"
            onClick={() => setShowPassword((previous) => !previous)}
            aria-label={
              showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
            }
          >
            {showPassword ? "Ocultar" : "Mostrar"}
          </button>
        </div>
      </div>

      {error && (
        <p className="login-form__error" role="alert">
          {error}
        </p>
      )}

      <button className="login-form__submit" type="submit">
        Iniciar sesión
        <span aria-hidden="true">→</span>
      </button>
    </form>
  );
}

export default LoginForm;