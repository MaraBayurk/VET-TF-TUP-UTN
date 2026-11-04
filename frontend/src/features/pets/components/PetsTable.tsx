
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MoreVertical,
  Eye,
  Pencil,
  UserRoundX,
} from "lucide-react";

import ConfirmModal from "../../../components/commons/ConfirmModal/ConfirmModal";
import type { PetItem } from "../types/pet";

interface PetsTableProps {
  pets: PetItem[];
  onDeactivate: (pet: PetItem) => void;
}

const calculateAge = (birthDate: string | null): string => {
  if (!birthDate) return "No especificada";

  const birth = new Date(`${birthDate}T00:00:00`);
  const today = new Date();

  if (Number.isNaN(birth.getTime())) return "No especificada";

  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();

  if (today.getDate() < birth.getDate()) months -= 1;

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  if (years < 0) return "Fecha inválida";
  if (years === 0 && months === 0) return "Menos de un mes";
  if (years === 0) return `${months} ${months === 1 ? "mes" : "meses"}`;
  if (months === 0) return `${years} ${years === 1 ? "año" : "años"}`;

  return `${years} a ${months} m`;
};

function PetsTable({ pets, onDeactivate }: PetsTableProps) {
  const navigate = useNavigate();

  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [selectedPet, setSelectedPet] = useState<PetItem | null>(null);

  const handleDeactivate = () => {
    if (!selectedPet) return;

    onDeactivate(selectedPet);
    setSelectedPet(null);
  };

  if (pets.length === 0) {
    return (
      <div className="pets-table__empty">
        No se encontraron mascotas con los filtros seleccionados.
      </div>
    );
  }

  return (
    <>
      <div className="pets-table__wrapper">
        <table className="pets-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Especie</th>
              <th>Raza</th>
              <th>Cliente responsable</th>
              <th>Documento</th>
              <th>Fecha nac.</th>
              <th>Edad</th>
              <th>Sexo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {pets.map((pet) => {
              const ownerName =
                `${pet.cliente.nombre} ${pet.cliente.apellido}`;

              return (
                <tr key={pet.id_mascota}>
                  <td>
                    <strong className="pets-table__name">
                      {pet.nombre}
                    </strong>
                  </td>

                  <td>{pet.especie}</td>
                  <td>{pet.raza || "—"}</td>
                  <td>{ownerName}</td>
                  <td>{pet.cliente.numero_documento}</td>

                  <td>
                    {pet.fecha_nacimiento
                      ? new Date(`${pet.fecha_nacimiento}T00:00:00`).toLocaleDateString("es-AR")
                      : "—"}
                  </td>

                  <td>{calculateAge(pet.fecha_nacimiento)}</td>
                  <td>{pet.sexo}</td>

                  <td>
                    <span
                      className={`pets-table__status pets-table__status--${
                        pet.activo ? "activa" : "inactiva"
                      }`}
                    >
                      {pet.activo ? "Activa" : "Inactiva"}
                    </span>
                  </td>

                  <td>
                    <div className="pets-table__actions-wrapper">
                      <button
                        type="button"
                        className="pets-table__actions"
                        aria-label={`Opciones de ${pet.nombre}`}
                        onClick={() =>
                          setOpenMenuId(
                            openMenuId === pet.id_mascota
                              ? null
                              : pet.id_mascota
                          )
                        }
                      >
                        <MoreVertical size={18} />
                      </button>

                      {openMenuId === pet.id_mascota && (
                        <div className="pets-table__dropdown">
                          <button
                            type="button"
                            onClick={() => {
                              setOpenMenuId(null);
                              navigate(`/mascotas/${pet.id_mascota}`);
                            }}
                          >
                            <Eye size={16} />
                            Ver perfil
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setOpenMenuId(null);
                              navigate(`/mascotas/${pet.id_mascota}/editar`);
                            }}
                          >
                            <Pencil size={16} />
                            Editar
                          </button>

                          {pet.activo && (
                            <button
                              type="button"
                              className="pets-table__delete-action"
                              onClick={() => {
                                setOpenMenuId(null);
                                setSelectedPet(pet);
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
              );
            })}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        isOpen={selectedPet !== null}
        title="Dar de baja mascota"
        description="¿Estás segura de que querés dar de baja a"
        highlightedText={`${selectedPet?.nombre ?? ""}?`}
        details="La mascota quedará inactiva y no podrá recibir nuevos turnos ni atenciones. Se conservarán sus datos y su historial clínico. Los turnos futuros pendientes o aprobados serán cancelados."
        confirmText="Dar de baja"
        cancelText="Cancelar"
        onConfirm={handleDeactivate}
        onCancel={() => setSelectedPet(null)}
      />
    </>
  );
}

export default PetsTable;
