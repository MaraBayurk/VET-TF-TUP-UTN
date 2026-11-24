
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock3,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  Search,
  X,
  Save,
  UserRound,
} from "lucide-react";

import {
  createSchedule,
  deactivateSchedule,
  getSchedules,
  getVeterinarians,
  updateSchedule,
} from "../services/scheduleService";

import type {
  Schedule,
  SchedulePayload,
  VeterinarianOption,
} from "../types/schedule.types";

import "../styles/AdminSchedulesPage.scss";

const DAYS = [
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
  { value: 7, label: "Domingo" },
];

const EMPTY_FORM: SchedulePayload = {
  id_veterinario: 0,
  dia_semana: 1,
  hora_inicio: "09:00",
  hora_fin: "13:00",
  intervalo_minutos: 30,
};

const normalizeTime = (value: string) => value.slice(0, 5);

const getVeterinarianName = (veterinarian?: VeterinarianOption) => {
  if (!veterinarian) return "Veterinario no disponible";

  return `${veterinarian.nombre} ${veterinarian.apellido}`;
};

export default function AdminSchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [veterinarians, setVeterinarians] = useState<
    VeterinarianOption[]
  >([]);

  const [selectedVeterinarian, setSelectedVeterinarian] =
    useState("todos");
  const [selectedDay, setSelectedDay] = useState("todos");
  const [search, setSearch] = useState("");

  const [form, setForm] = useState<SchedulePayload>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [scheduleData, veterinarianData] = await Promise.all([
        getSchedules(),
        getVeterinarians(),
      ]);

      setSchedules(scheduleData);
      setVeterinarians(veterinarianData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar los horarios.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filteredSchedules = useMemo(() => {
    return schedules.filter((schedule) => {
      const veterinarian = veterinarians.find(
        (item) =>
          item.id_veterinario === schedule.id_veterinario,
      );

      const veterinarianName = getVeterinarianName(veterinarian)
        .toLocaleLowerCase("es");

      const matchesVeterinarian =
        selectedVeterinarian === "todos" ||
        schedule.id_veterinario === Number(selectedVeterinarian);

      const matchesDay =
        selectedDay === "todos" ||
        schedule.dia_semana === Number(selectedDay);

      const matchesSearch =
        !search.trim() ||
        veterinarianName.includes(search.trim().toLocaleLowerCase("es"));

      return (
        matchesVeterinarian &&
        matchesDay &&
        matchesSearch
      );
    });
  }, [
    schedules,
    veterinarians,
    selectedVeterinarian,
    selectedDay,
    search,
  ]);

  const openCreateForm = () => {
    setEditingId(null);
    setForm({
      ...EMPTY_FORM,
      id_veterinario: veterinarians[0]?.id_veterinario ?? 0,
    });
    setError("");
    setSuccess("");
    setIsFormOpen(true);
  };

  const openEditForm = (schedule: Schedule) => {
    setEditingId(schedule.id_horario);
    setForm({
      id_veterinario: schedule.id_veterinario,
      dia_semana: schedule.dia_semana,
      hora_inicio: normalizeTime(schedule.hora_inicio),
      hora_fin: normalizeTime(schedule.hora_fin),
      intervalo_minutos: schedule.intervalo_minutos,
    });
    setError("");
    setSuccess("");
    setIsFormOpen(true);
  };

  const closeForm = () => {
    if (saving) return;

    setIsFormOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleChange = (
    field: keyof SchedulePayload,
    value: string,
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]:
        field === "hora_inicio" || field === "hora_fin"
          ? value
          : Number(value),
    }));
  };

  const validateForm = (): string | null => {
    if (!form.id_veterinario) {
      return "Seleccioná un veterinario.";
    }

    if (
      !Number.isInteger(form.dia_semana) ||
      form.dia_semana < 1 ||
      form.dia_semana > 7
    ) {
      return "Seleccioná un día válido.";
    }

    if (!form.hora_inicio || !form.hora_fin) {
      return "Completá las horas de inicio y finalización.";
    }

    if (form.hora_inicio >= form.hora_fin) {
      return "La hora de inicio debe ser anterior a la hora de finalización.";
    }

    if (
      !Number.isInteger(form.intervalo_minutos) ||
      form.intervalo_minutos < 1 ||
      form.intervalo_minutos > 480
    ) {
      return "El intervalo debe estar entre 1 y 480 minutos.";
    }

    return null;
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload: SchedulePayload = {
        ...form,
        hora_inicio: `${form.hora_inicio}:00`,
        hora_fin: `${form.hora_fin}:00`,
      };

      if (editingId !== null) {
        await updateSchedule(editingId, payload);
        setSuccess("El horario se actualizó correctamente.");
      } else {
        await createSchedule(payload);
        setSuccess("El horario se registró correctamente.");
      }

      setIsFormOpen(false);
      setEditingId(null);
      setForm(EMPTY_FORM);

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo guardar el horario.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (schedule: Schedule) => {
    const veterinarian = veterinarians.find(
      (item) =>
        item.id_veterinario === schedule.id_veterinario,
    );

    const confirmed = window.confirm(
      `¿Querés dar de baja el horario de ${getVeterinarianName(veterinarian)} del día ${DAYS.find((day) => day.value === schedule.dia_semana)?.label ?? ""}?`,
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await deactivateSchedule(schedule.id_horario);

      setSuccess("El horario se dio de baja correctamente.");
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo dar de baja el horario.",
      );
    }
  };

  const clearFilters = () => {
    setSelectedVeterinarian("todos");
    setSelectedDay("todos");
    setSearch("");
  };

  const totalSchedules = schedules.length;
  const veterinarianCount = new Set(
    schedules.map((schedule) => schedule.id_veterinario),
  ).size;

  return (
    <main className="admin-schedules">
      <header className="admin-schedules__header">
        <div>
          <span className="admin-schedules__eyebrow">
            GESTIÓN VETERINARIA
          </span>
          <h1>Horarios de atención</h1>
          <p>
            Administrá los días y las franjas horarias de cada
            veterinario.
          </p>
        </div>

        <div className="admin-schedules__header-actions">
          <button
            type="button"
            className="admin-schedules__refresh"
            onClick={() => void loadData()}
            disabled={loading}
          >
            <RefreshCw
              size={17}
              className={loading ? "is-spinning" : ""}
            />
            Actualizar
          </button>

          <button
            type="button"
            className="admin-schedules__add"
            onClick={openCreateForm}
            disabled={veterinarians.length === 0}
          >
            <Plus size={18} />
            Nuevo horario
          </button>
        </div>
      </header>

      <section className="admin-schedules__stats">
        <article className="schedule-stat">
          <div className="schedule-stat__icon total">
            <CalendarDays size={21} />
          </div>
          <div>
            <span>Horarios registrados</span>
            <strong>{totalSchedules}</strong>
          </div>
        </article>

        <article className="schedule-stat">
          <div className="schedule-stat__icon vets">
            <UserRound size={21} />
          </div>
          <div>
            <span>Veterinarios con horarios</span>
            <strong>{veterinarianCount}</strong>
          </div>
        </article>

        <article className="schedule-stat">
          <div className="schedule-stat__icon time">
            <Clock3 size={21} />
          </div>
          <div>
            <span>Intervalo habitual</span>
            <strong>30 min</strong>
          </div>
        </article>
      </section>

      {error && !isFormOpen && (
        <div className="admin-schedules__alert error" role="alert">
          <span>{error}</span>
          <button type="button" onClick={() => setError("")}>
            <X size={17} />
          </button>
        </div>
      )}

      {success && (
        <div className="admin-schedules__alert success" role="status">
          <span>{success}</span>
          <button type="button" onClick={() => setSuccess("")}>
            <X size={17} />
          </button>
        </div>
      )}

      <section className="admin-schedules__content">
        <div className="admin-schedules__section-header">
          <div>
            <h2>Listado de horarios</h2>
            <p>
              {filteredSchedules.length} horario(s) encontrados
            </p>
          </div>
        </div>

        <div className="admin-schedules__filters">
          <div className="schedule-search">
            <Search size={18} />
            <input
              type="search"
              placeholder="Buscar veterinario..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <select
            aria-label="Filtrar por veterinario"
            value={selectedVeterinarian}
            onChange={(event) =>
              setSelectedVeterinarian(event.target.value)
            }
          >
            <option value="todos">Todos los veterinarios</option>
            {veterinarians.map((veterinarian) => (
              <option
                key={veterinarian.id_veterinario}
                value={veterinarian.id_veterinario}
              >
                {getVeterinarianName(veterinarian)}
              </option>
            ))}
          </select>

          <select
            aria-label="Filtrar por día"
            value={selectedDay}
            onChange={(event) => setSelectedDay(event.target.value)}
          >
            <option value="todos">Todos los días</option>
            {DAYS.map((day) => (
              <option key={day.value} value={day.value}>
                {day.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="admin-schedules__clear"
            onClick={clearFilters}
          >
            Limpiar
          </button>
        </div>

        {loading ? (
          <div className="admin-schedules__message">
            <RefreshCw size={25} className="is-spinning" />
            <p>Cargando horarios de atención...</p>
          </div>
        ) : filteredSchedules.length === 0 ? (
          <div className="admin-schedules__empty">
            <CalendarDays size={38} />
            <h3>No se encontraron horarios</h3>
            <p>
              No hay horarios que coincidan con los filtros
              seleccionados.
            </p>
            {schedules.length === 0 && (
              <button
                type="button"
                onClick={openCreateForm}
                disabled={veterinarians.length === 0}
              >
                <Plus size={17} />
                Registrar primer horario
              </button>
            )}
          </div>
        ) : (
          <div className="admin-schedules__table-wrapper">
            <table className="admin-schedules__table">
              <thead>
                <tr>
                  <th>Veterinario</th>
                  <th>Especialidad</th>
                  <th>Día</th>
                  <th>Horario</th>
                  <th>Intervalo</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {filteredSchedules.map((schedule) => {
                  const veterinarian = veterinarians.find(
                    (item) =>
                      item.id_veterinario ===
                      schedule.id_veterinario,
                  );

                  const dayName =
                    DAYS.find(
                      (day) => day.value === schedule.dia_semana,
                    )?.label ?? "Día no disponible";

                  return (
                    <tr key={schedule.id_horario}>
                      <td>
                        <div className="schedule-veterinarian">
                          <div className="schedule-veterinarian__avatar">
                            <UserRound size={17} />
                          </div>
                          <div>
                            <strong>
                              {getVeterinarianName(veterinarian)}
                            </strong>
                            <span>
                              {veterinarian?.matricula
                                ? `Matrícula: ${veterinarian.matricula}`
                                : "Matrícula no disponible"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        {veterinarian?.especialidad ||
                          "Sin especialidad"}
                      </td>

                      <td>
                        <span className="schedule-day">
                          {dayName}
                        </span>
                      </td>

                      <td>
                        <div className="schedule-time">
                          <Clock3 size={16} />
                          <strong>
                            {normalizeTime(schedule.hora_inicio)}
                            {" - "}
                            {normalizeTime(schedule.hora_fin)}
                          </strong>
                        </div>
                      </td>

                      <td>
                        {schedule.intervalo_minutos} minutos
                      </td>

                      <td>
                        <div className="schedule-actions">
                          <button
                            type="button"
                            className="schedule-actions__edit"
                            title="Editar horario"
                            aria-label="Editar horario"
                            onClick={() => openEditForm(schedule)}
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            type="button"
                            className="schedule-actions__delete"
                            title="Dar de baja"
                            aria-label="Dar de baja el horario"
                            onClick={() =>
                              void handleDeactivate(schedule)
                            }
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {isFormOpen && (
        <div
          className="schedule-modal__overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeForm();
          }}
        >
          <section
            className="schedule-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="schedule-modal-title"
          >
            <header className="schedule-modal__header">
              <div>
                <span>CONFIGURACIÓN DE AGENDA</span>
                <h2 id="schedule-modal-title">
                  {editingId !== null
                    ? "Modificar horario"
                    : "Nuevo horario"}
                </h2>
                <p>
                  Definí la disponibilidad semanal del veterinario.
                </p>
              </div>

              <button
                type="button"
                aria-label="Cerrar formulario"
                onClick={closeForm}
                disabled={saving}
              >
                <X size={20} />
              </button>
            </header>

            <form
              className="schedule-modal__form"
              onSubmit={handleSubmit}
            >
              {error && (
                <div
                  className="admin-schedules__alert error"
                  role="alert"
                >
                  {error}
                </div>
              )}

              <label>
                Veterinario
                <select
                  value={form.id_veterinario}
                  onChange={(event) =>
                    handleChange(
                      "id_veterinario",
                      event.target.value,
                    )
                  }
                  required
                >
                  <option value={0} disabled>
                    Seleccioná un veterinario
                  </option>
                  {veterinarians.map((veterinarian) => (
                    <option
                      key={veterinarian.id_veterinario}
                      value={veterinarian.id_veterinario}
                    >
                      {getVeterinarianName(veterinarian)}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Día de atención
                <select
                  value={form.dia_semana}
                  onChange={(event) =>
                    handleChange("dia_semana", event.target.value)
                  }
                  required
                >
                  {DAYS.map((day) => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="schedule-modal__time-fields">
                <label>
                  Hora de inicio
                  <input
                    type="time"
                    value={form.hora_inicio}
                    onChange={(event) =>
                      handleChange(
                        "hora_inicio",
                        event.target.value,
                      )
                    }
                    required
                  />
                </label>

                <label>
                  Hora de finalización
                  <input
                    type="time"
                    value={form.hora_fin}
                    onChange={(event) =>
                      handleChange("hora_fin", event.target.value)
                    }
                    required
                  />
                </label>
              </div>

              <label>
                Intervalo entre turnos
                <select
                  value={form.intervalo_minutos}
                  onChange={(event) =>
                    handleChange(
                      "intervalo_minutos",
                      event.target.value,
                    )
                  }
                  required
                >
                  <option value={15}>15 minutos</option>
                  <option value={20}>20 minutos</option>
                  <option value={30}>30 minutos</option>
                  <option value={45}>45 minutos</option>
                  <option value={60}>60 minutos</option>
                  <option value={90}>90 minutos</option>
                  <option value={120}>120 minutos</option>
                </select>
              </label>

              <footer className="schedule-modal__actions">
                <button
                  type="button"
                  className="schedule-modal__cancel"
                  onClick={closeForm}
                  disabled={saving}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="schedule-modal__save"
                  disabled={saving}
                >
                  {saving ? (
                    <RefreshCw size={17} className="is-spinning" />
                  ) : (
                    <Save size={17} />
                  )}
                  {saving
                    ? "Guardando..."
                    : editingId !== null
                      ? "Guardar cambios"
                      : "Registrar horario"}
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}

