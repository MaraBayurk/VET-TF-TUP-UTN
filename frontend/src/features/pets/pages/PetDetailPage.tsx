
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  PawPrint,
  UserRound,
  CalendarDays,
  ClipboardList,
} from "lucide-react";

import type { PetItem } from "../../../types/pet";
import "../styles/PetDetailPage.scss";

const mockPets: PetItem[] = [
  {
    id_mascota: 1,
    id_cliente: 1,
    nombre: "Luna",
    especie: "Canina",
    raza: "Golden Retriever",
    fecha_nacimiento: "2021-03-12",
    sexo: "Hembra",
    observaciones: "Control periódico",
    activo: true,
    cliente: {
      id_usuario: 1,
      nombre: "María",
      apellido: "González",
      numero_documento: "12.345.678",
    },
  },
  {
    id_mascota: 2,
    id_cliente: 2,
    nombre: "Simba",
    especie: "Felina",
    raza: "Europea",
    fecha_nacimiento: "2022-07-05",
    sexo: "Macho",
    observaciones: null,
    activo: true,
    cliente: {
      id_usuario: 2,
      nombre: "Pedro",
      apellido: "Ramírez",
      numero_documento: "23.456.789",
    },
  },
  {
    id_mascota: 3,
    id_cliente: 3,
    nombre: "Nala",
    especie: "Canina",
    raza: "Labrador",
    fecha_nacimiento: "2022-11-18",
    sexo: "Hembra",
    observaciones: "Control periódico",
    activo: true,
    cliente: {
      id_usuario: 3,
      nombre: "Lucía",
      apellido: "Fernández",
      numero_documento: "34.567.890",
    },
  },
];

const formatDate = (date: string | null): string => {
  if (!date) return "No especificada";

  return new Date(`${date}T00:00:00`).toLocaleDateString("es-AR");
};

function PetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const pet = mockPets.find(
    (item) => item.id_mascota === Number(id),
  );

  if (!pet) {
    return (
      <section className="pet-detail">
        <div className="pet-detail__not-found">
          <PawPrint size={40} />
          <h1>Mascota no encontrada</h1>
          <p>No se encontró una mascota con el identificador solicitado.</p>

          <button
            type="button"
            onClick={() => navigate("/mascotas")}
          >
            Volver al listado
          </button>
        </div>
      </section>
    );
  }

  const ownerName = `${pet.cliente.nombre} ${pet.cliente.apellido}`;

  return (
    <section className="pet-detail">
      <button
        type="button"
        className="pet-detail__back"
        onClick={() => navigate("/mascotas")}
      >
        <ArrowLeft size={17} />
        Volver a mascotas
      </button>

      <header className="pet-detail__header">
        <div className="pet-detail__header-main">
          <div className="pet-detail__avatar">
            <PawPrint size={32} />
          </div>

          <div>
            <span className="pet-detail__eyebrow">
              Perfil de mascota
            </span>

            <h1>{pet.nombre}</h1>

            <p>
              {pet.especie}
              {pet.raza ? ` · ${pet.raza}` : ""}
            </p>
          </div>
        </div>

        <div className="pet-detail__header-actions">
          <span
            className={`pet-detail__status ${
              pet.activo
                ? "pet-detail__status--active"
                : "pet-detail__status--inactive"
            }`}
          >
            {pet.activo ? "Activa" : "Inactiva"}
          </span>

          <button
            type="button"
            className="pet-detail__edit"
            disabled={!pet.activo}
            onClick={() =>
              navigate(`/mascotas/${pet.id_mascota}/editar`)
            }
          >
            <Pencil size={16} />
            Editar mascota
          </button>
        </div>
      </header>

      <div className="pet-detail__content">
        <article className="pet-detail__card">
          <div className="pet-detail__card-heading">
            <PawPrint size={19} />
            <h2>Información de la mascota</h2>
          </div>

          <div className="pet-detail__data-grid">
            <div className="pet-detail__data-item">
              <span>Nombre</span>
              <strong>{pet.nombre}</strong>
            </div>

            <div className="pet-detail__data-item">
              <span>Especie</span>
              <strong>{pet.especie}</strong>
            </div>

            <div className="pet-detail__data-item">
              <span>Raza</span>
              <strong>{pet.raza || "No especificada"}</strong>
            </div>

            <div className="pet-detail__data-item">
              <span>Sexo</span>
              <strong>{pet.sexo}</strong>
            </div>

            <div className="pet-detail__data-item">
              <span>Fecha de nacimiento</span>
              <strong>{formatDate(pet.fecha_nacimiento)}</strong>
            </div>
          </div>
        </article>

        <article className="pet-detail__card">
          <div className="pet-detail__card-heading">
            <UserRound size={19} />
            <h2>Cliente responsable</h2>
          </div>

          <div className="pet-detail__owner">
            <div className="pet-detail__owner-avatar">
              <UserRound size={24} />
            </div>

            <div>
              <strong>{ownerName}</strong>
              <span>DNI: {pet.cliente.numero_documento}</span>
            </div>
          </div>
        </article>

        <article className="pet-detail__card">
          <div className="pet-detail__card-heading">
            <ClipboardList size={19} />
            <h2>Observaciones</h2>
          </div>

          <p className="pet-detail__observations">
            {pet.observaciones || "No hay observaciones registradas."}
          </p>
        </article>

        <article className="pet-detail__card pet-detail__history">
          <div className="pet-detail__card-heading">
            <CalendarDays size={19} />
            <h2>Historial clínico</h2>
          </div>

          <p>
            El historial clínico estará disponible cuando se implemente
            el módulo de atenciones veterinarias.
          </p>
        </article>
      </div>
    </section>
  );
}

export default PetDetailPage;
