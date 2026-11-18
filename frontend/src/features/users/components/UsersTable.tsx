
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MoreVertical, Eye, Pencil, UserRoundX } from "lucide-react";
import ConfirmModal from "../../../components/commons/ConfirmModal/ConfirmModal";

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
  onDeactivate?: (user: UserItem) => void;
}

function UsersTable({ users, onDeactivate }: UsersTableProps) {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);

  const navigate = useNavigate();

  const handleDeactivate = () => {
    if (!selectedUser) return;

    onDeactivate?.(selectedUser);
    setSelectedUser(null);
  };

  if (users.length === 0) {
    return (
      <div className="users-table__empty">
        No se encontraron usuarios con los filtros seleccionados.
      </div>
    );
  }

  return (
    <>
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

                        {user.status === "Activo" && (
                          <button
                            type="button"
                            onClick={() => {
                              setOpenMenuId(null);
                              setSelectedUser(user);
                            }}
                          >
                            <UserRoundX size={16} />
                            Dar de baja
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        isOpen={selectedUser !== null}
        title="Dar de baja usuario"
        description="¿Estás segura de que querés dar de baja a"
        highlightedText={`${selectedUser?.name ?? ""}?`}
        details="La cuenta quedará inactiva y no podrá iniciar sesión. Se conservarán sus datos e historial para mantener la trazabilidad."
        confirmText="Dar de baja"
        cancelText="Cancelar"
        onConfirm={handleDeactivate}
        onCancel={() => setSelectedUser(null)}
      />
    </>
  );
}

export default UsersTable;
