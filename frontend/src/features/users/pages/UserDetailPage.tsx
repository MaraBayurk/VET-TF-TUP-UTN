import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  UserRound,
  Pencil,
  UserRoundX,
} from "lucide-react";

import ConfirmModal from "../../../components/commons/ConfirmModal/ConfirmModal";
import "../styles/UserDetailPage.scss";

type UserDetail = {
  id: number;
  name: string;
  document: string;
  email: string;
  phone: string;
  address: string;
  registrationDate: string;
  role: string;
  specialty: string;
  professionalLicense: string;
  status: "Activo" | "Inactivo";
};

const users: UserDetail[] = [
  {
    id: 1,
    name: "María González",
    document: "12.345.678",
    email: "maria.gonzalez@email.com",
    phone: "381 234 5678",
    address: "San Miguel de Tucumán, Tucumán",
    registrationDate: "12/03/2026",
    role: "Cliente",
    specialty: "—",
    professionalLicense: "—",
    status: "Activo",
  },
  {
    id: 2,
    name: "Pedro Ramírez",
    document: "23.456.789",
    email: "pedro.ramirez@email.com",
    phone: "381 234 5678",
    address: "San Miguel de Tucumán, Tucumán",
    registrationDate: "12/03/2026",
    role: "Veterinario",
    specialty: "Clínica médica",
    professionalLicense: "MP 4587",
    status: "Activo",
  },
  {
    id: 3,
    name: "Lucía Fernández",
    document: "34.567.890",
    email: "lucia.fernandez@email.com",
    phone: "381 234 5678",
    address: "Yerba Buena, Tucumán",
    registrationDate: "12/03/2026",
    role: "Administrador",
    specialty: "—",
    professionalLicense: "—",
    status: "Activo",
  },
];

function UserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("personal");
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);

  const user = users.find((item) => item.id === Number(id));

  const handleDeactivate = () => {
    // TODO: conectar con el almacenamiento compartido o backend.
    setIsDeactivateModalOpen(false);
    navigate("/usuarios");
  };

  if (!user) {
    return (
      <div className="user-detail__not-found">
        <h2>Usuario no encontrado</h2>
        <button onClick={() => navigate("/usuarios")}>
          Volver al listado
        </button>
      </div>
    );
  }

  return (
    <>
      <section className="user-detail">
        <header className="user-detail__heading">
          <div>
            <h1>Detalle de usuario</h1>
            <p>
              Consultá la información personal y los datos del perfil
              seleccionado.
            </p>
          </div>
        </header>

        <section className="user-detail__profile">
          <div className="user-detail__identity">
            <div className="user-detail__avatar">
              <UserRound size={28} />
            </div>

            <div>
              <h2>{user.name}</h2>
              <p>
                DNI: {user.document} <span>·</span> {user.email}
              </p>
              <p>Tel. {user.phone}</p>
            </div>
          </div>

          <span
            className={`user-detail__status user-detail__status--${user.status.toLowerCase()}`}
          >
            {user.status}
          </span>

          <div className="user-detail__buttons">
            <button
              type="button"
              className="user-detail__edit"
              onClick={() => navigate(`/usuarios/${user.id}/editar`)}
            >
              <Pencil size={15} />
              Editar
            </button>

            {user.status === "Activo" && (
              <button
                type="button"
                className="user-detail__deactivate"
                onClick={() => setIsDeactivateModalOpen(true)}
              >
                <UserRoundX size={15} />
                Dar de baja
              </button>
            )}
          </div>
        </section>

        <nav className="user-detail__tabs">
          <button
            className={activeTab === "personal" ? "active" : ""}
            onClick={() => setActiveTab("personal")}
          >
            Información personal
          </button>

          <button
            className={activeTab === "professional" ? "active" : ""}
            onClick={() => setActiveTab("professional")}
          >
            Datos profesionales
          </button>

          <button
            className={activeTab === "activity" ? "active" : ""}
            onClick={() => setActiveTab("activity")}
          >
            Actividad reciente
          </button>
        </nav>

        {activeTab === "personal" && (
          <div className="user-detail__cards">
            <article className="user-detail__card">
              <h3>Datos personales</h3>

              <div className="user-detail__information">
                <div>
                  <span>Nombre completo</span>
                  <strong>{user.name}</strong>
                </div>

                <div>
                  <span>Documento</span>
                  <strong>{user.document}</strong>
                </div>

                <div>
                  <span>Correo electrónico</span>
                  <strong>{user.email}</strong>
                </div>

                <div>
                  <span>Teléfono</span>
                  <strong>{user.phone}</strong>
                </div>

                <div>
                  <span>Dirección</span>
                  <strong>{user.address}</strong>
                </div>

                <div>
                  <span>Fecha de registro</span>
                  <strong>{user.registrationDate}</strong>
                </div>
              </div>
            </article>

            <article className="user-detail__card">
              <h3>Datos profesionales</h3>

              <div className="user-detail__professional">
                <div>
                  <span>Rol asignado</span>
                  <strong className="user-detail__role">
                    {user.role}
                  </strong>
                </div>

                <div>
                  <span>Matrícula profesional</span>
                  <strong>{user.professionalLicense}</strong>
                </div>

                <div>
                  <span>Especialidad</span>
                  <strong>{user.specialty}</strong>
                </div>

                <div>
                  <span>Estado de la cuenta</span>
                  <strong className="user-detail__account">
                    Cuenta {user.status.toLowerCase()}
                  </strong>
                </div>
              </div>
            </article>
          </div>
        )}

        {activeTab === "professional" && (
          <article className="user-detail__card">
            <h3>Información profesional</h3>
            <p>Rol: {user.role}</p>
            <p>Matrícula: {user.professionalLicense}</p>
            <p>Especialidad: {user.specialty}</p>
          </article>
        )}

        {activeTab === "activity" && (
          <article className="user-detail__card">
            <h3>Actividad reciente</h3>
            <p>Sin actividad registrada por el momento.</p>
          </article>
        )}
      </section>

      <ConfirmModal
        isOpen={isDeactivateModalOpen}
        title="Dar de baja usuario"
        description="¿Estás segura de que querés dar de baja a"
        highlightedText={`${user.name}?`}
        details="La cuenta quedará inactiva y no podrá iniciar sesión. Se conservarán sus datos e historial para mantener la trazabilidad."
        confirmText="Dar de baja"
        cancelText="Cancelar"
        onConfirm={handleDeactivate}
        onCancel={() => setIsDeactivateModalOpen(false)}
      />
    </>
  );
}

export default UserDetailPage;