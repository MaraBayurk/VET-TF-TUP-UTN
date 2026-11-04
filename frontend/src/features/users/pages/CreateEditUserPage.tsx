import { useState } from "react";
import { PawPrint, Plus } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import type { ChangeEvent, FormEvent } from "react";

import "../styles/CreateUserPage.scss";

type UserRole = "Administrador" | "Veterinario" | "Cliente";

interface CreateUserForm {
  nombre: string;
  apellido: string;
  documento: string;
  telefono: string;
  email: string;
  password: string;
  rol: UserRole | "";
  direccion: string;
  matricula: string;
  especialidad: string;
}

const initialForm: CreateUserForm = {
  nombre: "",
  apellido: "",
  documento: "",
  telefono: "",
  email: "",
  password: "",
  rol: "",
  direccion: "",
  matricula: "",
  especialidad: "",
};

const specialties = [
  "Clínica médica",
  "Cirugía",
  "Cardiología",
  "Dermatología",
  "Diagnóstico por imagen",
];

function CreateUserPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEditing = Boolean(id);

  const existingUsers: Record<number, CreateUserForm> = {
    1: {
      nombre: "María",
      apellido: "González",
      documento: "12345678",
      telefono: "3812345678",
      email: "maria.gonzalez@email.com",
      password: "",
      rol: "Cliente",
      direccion: "San Miguel de Tucumán",
      matricula: "",
      especialidad: "",
    },
    2: {
      nombre: "Pedro",
      apellido: "Ramírez",
      documento: "23456789",
      telefono: "3812345678",
      email: "pedro.ramirez@email.com",
      password: "",
      rol: "Veterinario",
      direccion: "",
      matricula: "MP 4587",
      especialidad: "Clínica médica",
    },
  };

  const [form, setForm] = useState<CreateUserForm>(() =>
    id ? (existingUsers[Number(id)] ?? initialForm) : initialForm,
  );
  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleRoleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const role = event.target.value as UserRole | "";

    setForm((previous) => ({
      ...previous,
      rol: role,
      direccion: role === "Cliente" ? previous.direccion : "",
      matricula: role === "Veterinario" ? previous.matricula : "",
      especialidad: role === "Veterinario" ? previous.especialidad : "",
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isEditing) {
      console.log("Usuario a actualizar:", {
        id,
        ...form,
      });

      alert("Formulario validado. La edición se conectará al backend.");
    } else {
      console.log("Usuario a crear:", form);

      alert("Formulario validado. El alta se conectará al backend.");
    }

    navigate("/usuarios");
  };

  return (
    <section className="create-user">
      <header className="create-user__heading">
        <div>
          <h1>{isEditing ? "Editar usuario" : "Crear nuevo usuario"}</h1>{" "}
          <p>
            {isEditing
              ? "Modificá los datos personales y la información del perfil."
              : "Modificá los datos de acceso y completá la información del perfil."}
          </p>
        </div>

        <div className="create-user__heading-icons">
          <PawPrint size={22} />
          <Plus size={22} />
        </div>
      </header>

      <form className="create-user__form" onSubmit={handleSubmit}>
        <div className="create-user__form-heading">
          <h2>Datos personales</h2>
          <p>Completá los campos obligatorios para registrar la cuenta.</p>
        </div>

        <div className="create-user__grid">
          <div className="create-user__field">
            <label htmlFor="nombre">Nombre *</label>
            <input
              id="nombre"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Ej. María"
              required
            />
          </div>

          <div className="create-user__field">
            <label htmlFor="apellido">Apellido *</label>
            <input
              id="apellido"
              name="apellido"
              value={form.apellido}
              onChange={handleChange}
              placeholder="Ej. González"
              required
            />
          </div>

          <div className="create-user__field">
            <label htmlFor="documento">Documento *</label>
            <input
              id="documento"
              name="documento"
              value={form.documento}
              onChange={handleChange}
              placeholder="Ej. 12345678"
              inputMode="numeric"
              required
            />
          </div>

          <div className="create-user__field">
            <label htmlFor="telefono">Teléfono</label>
            <input
              id="telefono"
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
              placeholder="Ej. 381 123 4567"
              type="tel"
            />
          </div>

          <div className="create-user__field">
            <label htmlFor="email">Email *</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Ej. usuario@email.com"
              required
            />
          </div>

          <div className="create-user__field">
            <label htmlFor="password">Contraseña *</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder={
                isEditing
                  ? "Dejar vacío para mantener la contraseña actual"
                  : "Ingresá una contraseña"
              }
              minLength={8}
              required={!isEditing}
            />
          </div>

          <div className="create-user__field create-user__field--full">
            <label htmlFor="rol">Rol *</label>
            <select
              id="rol"
              name="rol"
              value={form.rol}
              onChange={handleRoleChange}
              required
            >
              <option value="">Seleccioná un rol</option>
              <option value="Administrador">Administrador</option>
              <option value="Veterinario">Veterinario</option>
              <option value="Cliente">Cliente</option>
            </select>
          </div>

          {form.rol === "Cliente" && (
            <div className="create-user__field create-user__field--full">
              <label htmlFor="direccion">Dirección</label>
              <input
                id="direccion"
                name="direccion"
                value={form.direccion}
                onChange={handleChange}
                placeholder="Ingresá la dirección"
              />
            </div>
          )}

          {form.rol === "Veterinario" && (
            <>
              <div className="create-user__field">
                <label htmlFor="matricula">Matrícula profesional *</label>
                <input
                  id="matricula"
                  name="matricula"
                  value={form.matricula}
                  onChange={handleChange}
                  placeholder="Ej. MP 4587"
                  required
                />
              </div>

              <div className="create-user__field">
                <label htmlFor="especialidad">Especialidad *</label>
                <select
                  id="especialidad"
                  name="especialidad"
                  value={form.especialidad}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccioná una especialidad</option>

                  {specialties.map((specialty) => (
                    <option key={specialty} value={specialty}>
                      {specialty}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>

        <div className="create-user__actions">
          <button
            type="button"
            className="create-user__cancel"
            onClick={() => navigate("/usuarios")}
          >
            Cancelar
          </button>

          <button type="submit" className="create-user__submit">
            {isEditing ? "Guardar cambios" : "Crear usuario"} <span>→</span>
          </button>
        </div>
      </form>
    </section>
  );
}

export default CreateUserPage;
