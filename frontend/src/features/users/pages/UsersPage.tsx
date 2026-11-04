
import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  Users,
  ShieldCheck,
  Stethoscope,
  Heart,
} from "lucide-react";

import UsersTable, { type UserItem } from "../components/UsersTable";
import "../styles/UsersPage.scss";

const mockUsers: UserItem[] = [
  {
    id: 1,
    name: "María González",
    document: "12345678",
    email: "maria.gonzalez@email.com",
    role: "Cliente",
    specialty: "—",
    status: "Activo",
  },
  {
    id: 2,
    name: "Pedro Ramírez",
    document: "23456789",
    email: "pedro.ramirez@email.com",
    role: "Veterinario",
    specialty: "Clínica",
    status: "Activo",
  },
  {
    id: 3,
    name: "Lucía Fernández",
    document: "34567890",
    email: "lucia.fernandez@email.com",
    role: "Administrador",
    specialty: "—",
    status: "Activo",
  },
  {
    id: 4,
    name: "Sofía Vera",
    document: "11222333",
    email: "sofia.vera@email.com",
    role: "Veterinario",
    specialty: "Cirugía",
    status: "Activo",
  },
  {
    id: 5,
    name: "Carlos Méndez",
    document: "55667788",
    email: "carlos.mendez@email.com",
    role: "Cliente",
    specialty: "—",
    status: "Inactivo",
  },
  {
    id: 6,
    name: "Valentina Ruiz",
    document: "66778899",
    email: "valentina.ruiz@email.com",
    role: "Cliente",
    specialty: "—",
    status: "Activo",
  },
];

function UsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("Todos");
  const [statusFilter, setStatusFilter] = useState("Todos");

  const filteredUsers = useMemo(() => {
    return mockUsers.filter((user) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        user.name.toLowerCase().includes(searchValue) ||
        user.email.toLowerCase().includes(searchValue) ||
        user.document.includes(searchValue);

      const matchesRole =
        roleFilter === "Todos" || user.role === roleFilter;

      const matchesStatus =
        statusFilter === "Todos" || user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [search, roleFilter, statusFilter]);

  return (
    <section className="users-page">
      <div className="users-page__heading">
        <div>
          <h1>Usuarios</h1>
          <p>
            Administrá las cuentas, roles y perfiles del equipo de
            Di Salvo Veterinaria.
          </p>
        </div>
      </div>

      <div className="users-page__stats">
        <article className="users-page__stat-card">
          <div className="users-page__stat-icon users-page__stat-icon--green">
            <Users size={20} />
          </div>
          <div>
            <span>Usuarios activos</span>
            <strong>24</strong>
          </div>
        </article>

        <article className="users-page__stat-card">
          <div className="users-page__stat-icon users-page__stat-icon--purple">
            <ShieldCheck size={20} />
          </div>
          <div>
            <span>Administradores</span>
            <strong>3</strong>
          </div>
        </article>

        <article className="users-page__stat-card">
          <div className="users-page__stat-icon users-page__stat-icon--blue">
            <Stethoscope size={20} />
          </div>
          <div>
            <span>Veterinarios</span>
            <strong>8</strong>
          </div>
        </article>

        <article className="users-page__stat-card">
          <div className="users-page__stat-icon users-page__stat-icon--orange">
            <Heart size={20} />
          </div>
          <div>
            <span>Clientes</span>
            <strong>13</strong>
          </div>
        </article>
      </div>

      <div className="users-page__panel">
        <div className="users-page__filters">
          <label className="users-page__search">
            <Search size={16} />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Nombre, apellido, email o DNI"
            />
          </label>

          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
            aria-label="Filtrar por rol"
          >
            <option value="Todos">Todos los roles</option>
            <option value="Administrador">Administrador</option>
            <option value="Veterinario">Veterinario</option>
            <option value="Cliente">Cliente</option>
          </select>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filtrar por estado"
          >
            <option value="Todos">Estado: Todos</option>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>

          <button type="button" className="users-page__new-button">
            <Plus size={16} />
            Nuevo usuario
          </button>
        </div>

        <UsersTable users={filteredUsers} />

        <div className="users-page__results">
          Mostrando {filteredUsers.length} de {mockUsers.length} usuarios
        </div>
      </div>
    </section>
  );
}

export default UsersPage;