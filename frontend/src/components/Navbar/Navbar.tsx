
import { NavLink } from "react-router-dom";
import {
  House,
  PawPrint,
  Users,
  CalendarDays,
  Clock3,
} from "lucide-react";

import "./Navbar.scss";
import { getAuthUser } from "../../features/auth/services/authStorage";

const navigationItems = [
  { label: "Inicio", path: "/inicio", icon: House },
  { label: "Mascotas", path: "/mascotas", icon: PawPrint },
];

function Navbar() {
  const role = getAuthUser()?.rol?.trim().toLocaleLowerCase("es");

  const isClient = role === "cliente";
  const isAdmin = role === "administrador";
  const isStaff = isAdmin || role === "veterinario";

  const items = [
    ...navigationItems,

    ...(isClient
      ? [{ label: "Mis turnos", path: "/turnos", icon: CalendarDays }]
      : []),

    ...(isAdmin
      ? [
          {
            label: "Gestión de turnos",
            path: "/admin/turnos",
            icon: CalendarDays,
          },
          {
            label: "Horarios de atención",
            path: "/admin/horarios",
            icon: Clock3,
          },
        ]
      : []),

    ...(isStaff
      ? [{ label: "Clientes", path: "/clientes", icon: Users }]
      : []),

    ...(isAdmin
      ? [{ label: "Usuarios", path: "/usuarios", icon: Users }]
      : []),
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <div className="sidebar__logo">
          <PawPrint size={30} />
        </div>

        <h1>VET</h1>
        <span>GESTIÓN VETERINARIA</span>
      </div>

      <nav className="sidebar__navigation">
        {items.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
            }
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__footer">
        <div className="sidebar__message">
          <PawPrint size={24} />
          <p>Cuidamos lo que más querés.</p>
          <span>♡</span>
        </div>
      </div>
    </aside>
  );
}

export default Navbar;

