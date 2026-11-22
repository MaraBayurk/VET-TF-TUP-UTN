import { NavLink } from "react-router-dom";
import {
  BellRing,
  House,
  PawPrint,
  Users,
} from "lucide-react";

import "./Navbar.scss";
import { getAuthUser } from "../../features/auth/services/authStorage";

const navigationItems = [
  { label: "Inicio", path: "/inicio", icon: House },
  { label: "Mascotas", path: "/mascotas", icon: PawPrint },
  { label: "Alertas", path: "/alertas", icon: BellRing },
];

function Navbar() {
  const role = getAuthUser()?.rol;
  const isAdmin = typeof role === "string" && role.trim().toLocaleLowerCase("es") === "administrador";
  const isStaff = isAdmin || (typeof role === "string" && role.trim().toLocaleLowerCase("es") === "veterinario");
  const items = isStaff
    ? [...navigationItems, { label: "Clientes", path: "/clientes", icon: Users }, ...(isAdmin ? [{ label: "Usuarios", path: "/usuarios", icon: Users }] : [])]
    : navigationItems;
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