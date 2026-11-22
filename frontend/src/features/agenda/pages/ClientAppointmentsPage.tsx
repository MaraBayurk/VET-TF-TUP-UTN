
import { useState } from "react";
import {
  CalendarDays,
  Clock3,
  PawPrint,
  Stethoscope,
  RefreshCw,
  XCircle,
  CalendarPlus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import useAppointments from "../hooks/useAppointments";
import type { Appointment } from "../types/appointment.types";

import "../styles/ClientAppointmentsPage.scss";

const formatDate = (value: string): string => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(date);
};

const formatTime = (value: string): string => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(date);
};

const getStatusClass = (status: string): string => {
  const normalized = status.toLowerCase();

  if (normalized.includes("pendiente")) return "pending";
  if (
    normalized.includes("aprobado") ||
    normalized.includes("confirmado")
  ) {
    return "approved";
  }
  if (normalized.includes("cancelado")) return "cancelled";
  if (
    normalized.includes("finalizado") ||
    normalized.includes("completado")
  ) {
    return "completed";
  }

  return "default";
};

const canCancelAppointment = (status: string): boolean => {
  const normalized = status.toLowerCase();

  return ["pendiente", "aprobado", "confirmado"].includes(normalized);
};

function AppointmentCard({
  appointment,
  onCancel,
  cancelling,
}: {
  appointment: Appointment;
  onCancel: (id: number) => void;
  cancelling: boolean;
}) {
  const statusClass = getStatusClass(appointment.estado);

  return (
    <article className="client-appointments__card">
      <div className="client-appointments__card-date">
        <CalendarDays size={19} />

        <div>
          <span>Fecha de atención</span>
          <strong>{formatDate(appointment.fecha_hora)}</strong>
        </div>
      </div>

      <div className="client-appointments__card-info">
        <div>
          <PawPrint size={17} />
          <span>{appointment.nombre_mascota}</span>
        </div>

        <div>
          <Stethoscope size={17} />
          <span>
            {appointment.nombre_veterinario
              ? `${appointment.nombre_veterinario} ${appointment.apellido_veterinario ?? ""}`
              : "Veterinario asignado"}
          </span>
        </div>

        <div>
          <Clock3 size={17} />
          <span>{formatTime(appointment.fecha_hora)} hs</span>
        </div>
      </div>

      {appointment.motivo && (
        <p className="client-appointments__reason">
          <strong>Motivo:</strong> {appointment.motivo}
        </p>
      )}

      <div className="client-appointments__card-footer">
        <span
          className={`client-appointments__status client-appointments__status--${statusClass}`}
        >
          {appointment.estado}
        </span>

        {canCancelAppointment(appointment.estado) && (
          <button
            type="button"
            className="client-appointments__cancel"
            disabled={cancelling}
            onClick={() => onCancel(appointment.id_turno)}
          >
            <XCircle size={16} />
            {cancelling ? "Cancelando..." : "Cancelar turno"}
          </button>
        )}
      </div>
    </article>
  );
}

function ClientAppointmentsPage() {
  const navigate = useNavigate();

  const {
    appointments,
    loading,
    error,
    refresh,
    cancel,
  } = useAppointments("cliente");

  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState("");

  const upcomingAppointments = appointments
    .filter((appointment) => {
      const appointmentDate = new Date(appointment.fecha_hora);
      const status = appointment.estado.toLowerCase();

      const isActive = ![
        "cancelado",
        "cancelada",
        "finalizado",
        "finalizada",
        "completado",
        "completada",
      ].includes(status);

      return (
        !Number.isNaN(appointmentDate.getTime()) &&
        appointmentDate.getTime() >= Date.now() &&
        isActive
      );
    })
    .sort(
      (a, b) =>
        new Date(a.fecha_hora).getTime() -
        new Date(b.fecha_hora).getTime(),
    );

  const pendingAppointments = appointments.filter((appointment) =>
    appointment.estado.toLowerCase().includes("pendiente"),
  ).length;

  const confirmedAppointments = appointments.filter((appointment) => {
    const status = appointment.estado.toLowerCase();

    return status.includes("aprobado") || status.includes("confirmado");
  }).length;

  const handleCancel = async (idTurno: number) => {
    const confirmed = window.confirm(
      "¿Estás segura de que querés cancelar este turno?",
    );

    if (!confirmed) return;

    setCancellingId(idTurno);
    setActionError("");

    try {
      await cancel(idTurno);
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "No se pudo cancelar el turno.",
      );
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <section className="client-appointments">
      <header className="client-appointments__header">
        <div>
          <span className="client-appointments__eyebrow">
            VET · MI ESPACIO
          </span>

          <h1>Mis turnos</h1>

          <p>
            Consultá tus próximas visitas y mantené al día la atención de tu
            mascota.
          </p>
        </div>

        <button
          type="button"
          className="client-appointments__new-button"
          onClick={() => navigate("/turnos/nuevo")}
        >
          <CalendarPlus size={17} />
          Solicitar turno
        </button>
      </header>

      <div className="client-appointments__summary">
        <div>
          <span>Turnos registrados</span>
          <strong>{loading ? "—" : appointments.length}</strong>
        </div>

        <div>
          <span>Pendientes</span>
          <strong>{loading ? "—" : pendingAppointments}</strong>
        </div>

        <div>
          <span>Confirmados</span>
          <strong>{loading ? "—" : confirmedAppointments}</strong>
        </div>
      </div>

      <div className="client-appointments__section-heading">
        <div>
          <span className="client-appointments__eyebrow">
            TU AGENDA
          </span>

          <h2>Próximas atenciones</h2>

          <p>
            Consultá las fechas y horarios de tus próximas visitas.
          </p>
        </div>

        <button
          type="button"
          className="client-appointments__refresh"
          onClick={() => void refresh()}
          disabled={loading}
          aria-label="Actualizar turnos"
        >
          <RefreshCw size={16} />
          Actualizar
        </button>
      </div>

      {actionError && (
        <div className="client-appointments__error" role="alert">
          {actionError}
        </div>
      )}

      {loading ? (
        <div className="client-appointments__message" role="status">
          Cargando tus turnos...
        </div>
      ) : error ? (
        <div className="client-appointments__message client-appointments__message--error">
          <p>{error}</p>

          <button type="button" onClick={() => void refresh()}>
            Reintentar
          </button>
        </div>
      ) : upcomingAppointments.length === 0 ? (
        <div className="client-appointments__empty">
          <CalendarDays size={40} />

          <h3>No tenés próximas atenciones</h3>

          <p>
            Cuando solicites una atención veterinaria, vas a poder consultarla
            desde acá.
          </p>

          <button
            type="button"
            onClick={() => navigate("/turnos/nuevo")}
          >
            <CalendarPlus size={16} />
            Solicitar mi primer turno
          </button>
        </div>
      ) : (
        <div className="client-appointments__list">
          {upcomingAppointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id_turno}
              appointment={appointment}
              onCancel={handleCancel}
              cancelling={cancellingId === appointment.id_turno}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default ClientAppointmentsPage;


