
import { useState, type FormEvent } from "react";
import "../styles/register-form.scss";

function RegisterForm() {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (
      !nombre.trim() ||
      !apellido.trim() ||
      !username.trim() ||
      !password ||
      !confirmPassword
    ) {
      setError("Completá todos los campos obligatorios.");
      return;
    }

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setSuccess("Los datos son válidos. El registro aún no está conectado.");
  };

  return (
    <form className="register-form" onSubmit={handleSubmit}>
      <div className="register-form__field">
        <label htmlFor="nombre">
          Nombre <span className="required">*</span>
        </label>
        <input
          id="nombre"
          type="text"
          placeholder="Tu nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          autoComplete="given-name"
          required
        />
      </div>

      <div className="register-form__field">
        <label htmlFor="apellido">
          Apellido <span className="required">*</span>
        </label>
        <input
          id="apellido"
          type="text"
          placeholder="Tu apellido"
          value={apellido}
          onChange={(e) => setApellido(e.target.value)}
          autoComplete="family-name"
          required
        />
      </div>

      <div className="register-form__field">
        <label htmlFor="register-username">
          Usuario <span className="required">*</span>
        </label>
        <input
          id="register-username"
          type="text"
          placeholder="Elegí un usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          required
        />
      </div>

      <div className="register-form__field">
        <label htmlFor="register-password">
          Contraseña <span className="required">*</span>
        </label>
        <div className="register-form__password">
          <input
            id="register-password"
            type={showPassword ? "text" : "password"}
            placeholder="Creá una contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
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

      <div className="register-form__field">
        <label htmlFor="confirm-password">
          Confirmar contraseña <span className="required">*</span>
        </label>
        <div className="register-form__password">
          <input
            id="confirm-password"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Repetí tu contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
          <button
            type="button"
            onClick={() =>
              setShowConfirmPassword((previous) => !previous)
            }
            aria-label={
              showConfirmPassword
                ? "Ocultar contraseña"
                : "Mostrar contraseña"
            }
          >
            {showConfirmPassword ? "Ocultar" : "Mostrar"}
          </button>
        </div>
      </div>

      <p className="register-form__required-info">
        <span className="required">*</span> Campos obligatorios
      </p>

      {error && (
        <p
          className="register-form__message register-form__message--error"
          role="alert"
        >
          {error}
        </p>
      )}

      {success && (
        <p
          className="register-form__message register-form__message--success"
          role="status"
        >
          {success}
        </p>
      )}

      <button className="register-form__submit" type="submit">
        Crear cuenta <span aria-hidden="true">→</span>
      </button>
    </form>
  );
}

export default RegisterForm;
