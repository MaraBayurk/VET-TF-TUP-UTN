import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MoreVertical, Eye, Pencil } from "lucide-react";

export interface UserItem {
  id: number;
  name: string;
  document: string;
  email: string;
  role: "Administrador" | "Veterinario" | "Cliente";
  specialty: string;
  status: "Activo" | "Inactivo";
}

interface UsersTableProps {
  users: UserItem[];
}

function UsersTable({ users }: UsersTableProps) {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const navigate = useNavigate();

  if (users.length === 0) {
    return (
      <div className="users-table__empty">
        No se encontraron usuarios con los filtros seleccionados.
      </div>
    );
  }

  return (
    <div className="users-table__wrapper">
      <table className="users-table">
        <thead>
          <tr>
            <th>Usuario</th>
            <th>Documento</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Especialidad</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>
                <div className="users-table__user">
                  <span className="users-table__avatar">
                    {user.name
                      .split(" ")
                      .map((part) => part[0])
                      .slice(0, 2)
                      .join("")}
                  </span>
                  <strong>{user.name}</strong>
                </div>
              </td>

              <td>{user.document}</td>
              <td>{user.email}</td>

              <td>
                <span
                  className={`users-table__role users-table__role--${user.role.toLowerCase()}`}
                >
                  {user.role}
                </span>
              </td>

              <td>{user.specialty}</td>

              <td>
                <span
                  className={`users-table__status users-table__status--${user.status.toLowerCase()}`}
                >
                  {user.status}
                </span>
              </td>

              <td>
                <div className="users-table__actions-wrapper">
                  <button
                    type="button"
                    className="users-table__actions"
                    aria-label={`Opciones de ${user.name}`}
                    onClick={() =>
                      setOpenMenuId(openMenuId === user.id ? null : user.id)
                    }
                  >
                    <MoreVertical size={18} />
                  </button>

                  {openMenuId === user.id && (
                    <div className="users-table__dropdown">
                      <button
                        type="button"
                        onClick={() => {
                          setOpenMenuId(null);
                          navigate(`/usuarios/${user.id}`);
                        }}
                      >
                        <Eye size={16} />
                        Detalle
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setOpenMenuId(null);
                          navigate(`/usuarios/${user.id}/editar`);
                        }}
                      >
                        <Pencil size={16} />
                        Editar
                      </button>
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UsersTable;
