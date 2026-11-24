
import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, RefreshCw, Search, PawPrint, UserRound, Clock, ClipboardList } from "lucide-react";

import { getAllAppointments } from "../services/appointmentService";
import type { Appointment } from "../types/appointment.types";

import "../styles/AdminAppointmentsPage.scss";

const formatDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Fecha no disponible";
  }

  return date.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatTime = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "--:--";
  }

  return date.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const normalize = (value?: string | null) =>
  (value ?? "").trim().toLocaleLowerCase("es");

const getStatusClass = (status: string) => {
  const normalized = normalize(status);

  if (normalized.includes("pendiente")) return "pending";
  if (normalized.includes("confirmado")) return "confirmed";
  if (normalized.includes("cancelado")) return "cancelled";
  if (normalized.includes("terminado") || normalized.includes("finalizado")) {
    return "completed";
  }

  return "default";
};

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [dateFilter, setDateFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAllAppointments();
      setAppointments(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar los turnos.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAppointments();
  }, [loadAppointments]);

  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      const searchText = normalize(search);

      const clientName = [
        appointment.nombre_cliente,
        appointment.apellido_cliente,
      ]
        .filter(Boolean)
        .join(" ");

      const veterinarianName = [
        appointment.nombre_veterinario,
        appointment.apellido_veterinario,
      ]
        .filter(Boolean)
        .join(" ");

      const searchableText = [
        String(appointment.id_turno),
        appointment.nombre_mascota,
        clientName,
        veterinarianName,
        appointment.motivo,
        appointment.estado,
      ]
        .map(normalize)
        .join(" ");

      const matchesSearch =
        !searchText || searchableText.includes(searchText);

      const matchesStatus =
        statusFilter === "todos" ||
        normalize(appointment.estado) === normalize(statusFilter);

      const appointmentDate = appointment.fecha_hora.slice(0, 10);
      const matchesDate =
        !dateFilter || appointmentDate === dateFilter;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [appointments, search, statusFilter, dateFilter]);

  const statusOptions = useMemo(() => {
    return Array.from(
      new Set(
        appointments
          .map((appointment) => appointment.estado)
          .filter(Boolean),
      ),
    );
  }, [appointments]);

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("todos");
    setDateFilter("");
  };

  const pendingCount = appointments.filter(
    (appointment) => getStatusClass(appointment.estado) === "pending",
  ).length;

  const confirmedCount = appointments.filter(
    (appointment) => getStatusClass(appointment.estado) === "confirmed",
  ).length;

  const cancelledCount = appointments.filter(
    (appointment) => getStatusClass(appointment.estado) === "cancelled",
  ).length;

  return (
    <main className="admin-appointments">
      <header className="admin-appointments__header">
        <div>
          <span className="admin-appointments__eyebrow">
            GESTIÓN VETERINARIA
          </span>

          <h1>Gestión de turnos</h1>

          <p>
            Consultá y supervisá los turnos registrados en el sistema.
          </p>
        </div>

        <button
          type="button"
          className="admin-appointments__refresh"
          onClick={() => void loadAppointments()}
          disabled={loading}
        >
          <RefreshCw size={17} className={loading ? "is-spinning" : ""} />
          Actualizar
        </button>
      </header>

      <section className="admin-appointments__stats">
        <article className="appointment-stat">
          <div className="appointment-stat__icon total">
            <CalendarDays size={21} />
          </div>
          <div>
            <span>Total de turnos</span>
            <strong>{appointments.length}</strong>
          </div>
        </article>

        <article className="appointment-stat">
          <div className="appointment-stat__icon pending">
            <Clock size={21} />
          </div>
          <div>
            <span>Pendientes</span>
            <strong>{pendingCount}</strong>
          </div>
        </article>

        <article className="appointment-stat">
          <div className="appointment-stat__icon confirmed">
            <ClipboardList size={21} />
          </div>
          <div>
            <span>Confirmados</span>
            <strong>{confirmedCount}</strong>
          </div>
        </article>

        <article className="appointment-stat">
          <div className="appointment-stat__icon cancelled">
            <CalendarDays size={21} />
          </div>
          <div>
            <span>Cancelados</span>
            <strong>{cancelledCount}</strong>
          </div>
        </article>
      </section>

      <section className="admin-appointments__content">
        <div className="admin-appointments__section-header">
          <div>
            <h2>Listado de turnos</h2>
            <p>
              {filteredAppointments.length} resultado(s) encontrados
            </p>
          </div>
        </div>

        <div className="admin-appointments__filters">
          <div className="appointment-search">
            <Search size={18} />
            <input
              type="search"
              placeholder="Buscar por mascota, cliente o veterinario..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <select
            aria-label="Filtrar por estado"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="todos">Todos los estados</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <input
            type="date"
            aria-label="Filtrar por fecha"
            value={dateFilter}
            onChange={(event) => setDateFilter(event.target.value)}
          />

          <button
            type="button"
            className="admin-appointments__clear"
            onClick={clearFilters}
          >
            Limpiar
          </button>
        </div>

        {error && (
          <div className="admin-appointments__error" role="alert">
            <p>{error}</p>
            <button type="button" onClick={() => void loadAppointments()}>
              Reintentar
            </button>
          </div>
        )}

        {loading ? (
          <div className="admin-appointments__message">
            <RefreshCw size={24} className="is-spinning" />
            <p>Cargando turnos...</p>
          </div>
        ) : !error && filteredAppointments.length === 0 ? (
          <div className="admin-appointments__empty">
            <CalendarDays size={36} />
            <h3>No se encontraron turnos</h3>
            <p>
              No hay turnos que coincidan con los filtros seleccionados.
            </p>
          </div>
        ) : !error ? (
          <div className="admin-appointments__table-wrapper">
            <table className="admin-appointments__table">
              <thead>
                <tr>
                  <th>N.º</th>
                  <th>Fecha y hora</th>
                  <th>Mascota</th>
                  <th>Cliente</th>
                  <th>Veterinario</th>
                  <th>Motivo</th>
                  <th>Estado</th>
                </tr>
              </thead>

              <tbody>
                {filteredAppointments.map((appointment) => {
                  const clientName = [
                    appointment.nombre_cliente,
                    appointment.apellido_cliente,
                  ]
                    .filter(Boolean)
                    .join(" ");

                  const veterinarianName = [
                    appointment.nombre_veterinario,
                    appointment.apellido_veterinario,
                  ]
                    .filter(Boolean)
                    .join(" ");

                  return (
                    <tr key={appointment.id_turno}>
                      <td className="appointment-number">
                        #{appointment.id_turno}
                      </td>

                      <td>
                        <div className="appointment-date">
                          <strong>{formatDate(appointment.fecha_hora)}</strong>
                          <span>{formatTime(appointment.fecha_hora)} hs</span>
                        </div>
                      </td>

                      <td>
                        <div className="appointment-person">
                          <PawPrint size={17} />
                          <strong>{appointment.nombre_mascota}</strong>
                        </div>
                      </td>

                      <td>
                        <div className="appointment-person">
                          <UserRound size={17} />
                          <span>{clientName || "No disponible"}</span>
                        </div>
                      </td>

                      <td>
                        {veterinarianName || "No asignado"}
                      </td>

                      <td className="appointment-reason">
                        {appointment.motivo || "Sin especificar"}
                      </td>

                      <td>
                        <span
                          className={`appointment-status appointment-status--${getStatusClass(
                            appointment.estado,
                          )}`}
                        >
                          {appointment.estado}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </main>
  );
}

