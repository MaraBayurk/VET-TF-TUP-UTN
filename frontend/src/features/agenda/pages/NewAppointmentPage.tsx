
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getAppointmentPets,
  type AppointmentPet,
} from "../services/appointmentOptionsService";

import {
  getAvailableSlots,
  requestAppointment,
} from "../services/appointmentService";

import "../styles/NewAppointmentPage.scss";

export default function NewAppointmentPage() {
  const navigate = useNavigate();

  const [mascotas, setMascotas] = useState<AppointmentPet[]>([]);
  const [mascotaId, setMascotaId] = useState("");

  const [veterinarioId, setVeterinarioId] = useState("");
  const [fecha, setFecha] = useState("");
  const [horario, setHorario] = useState("");
  const [horarios, setHorarios] = useState<string[]>([]);

  const [motivo, setMotivo] = useState("");
  const [observaciones, setObservaciones] = useState("");

  const [loadingMascotas, setLoadingMascotas] = useState(true);
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const [errorMascotas, setErrorMascotas] = useState("");
  const [errorHorarios, setErrorHorarios] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [solicitudExitosa, setSolicitudExitosa] = useState(false);

  useEffect(() => {
    const cargarMascotas = async () => {
      try {
        setLoadingMascotas(true);
        setErrorMascotas("");

        const resultado = await getAppointmentPets();
        setMascotas(resultado);
      } catch (error) {
        setErrorMascotas(
          error instanceof Error
            ? error.message
            : "No se pudieron cargar las mascotas.",
        );
      } finally {
        setLoadingMascotas(false);
      }
    };

    void cargarMascotas();
  }, []);

  useEffect(() => {
    setHorario("");
    setHorarios([]);
    setErrorHorarios("");

    const id = Number(veterinarioId);

    if (!id || !fecha) {
      setLoadingHorarios(false);
      return;
    }

    let cancelado = false;

    const consultarHorarios = async () => {
      try {
        setLoadingHorarios(true);

        const resultado = await getAvailableSlots(id, fecha);

        if (!cancelado) {
          setHorarios(resultado.horarios_disponibles);
        }
      } catch (error) {
        if (!cancelado) {
          setHorarios([]);
          setErrorHorarios(
            error instanceof Error
              ? error.message
              : "No se pudieron consultar los horarios.",
          );
        }
      } finally {
        if (!cancelado) {
          setLoadingHorarios(false);
        }
      }
    };

    void consultarHorarios();

    return () => {
      cancelado = true;
    };
  }, [veterinarioId, fecha]);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (
      !mascotaId ||
      !veterinarioId ||
      !fecha ||
      !horario ||
      !motivo.trim()
    ) {
      setMensaje("Completá todos los campos obligatorios.");
      return;
    }

    try {
      setEnviando(true);
      setMensaje("");

      const fechaHora = new Date(
        `${fecha}T${horario}`,
      ).toISOString();

      const resultado = await requestAppointment({
        id_mascota: Number(mascotaId),
        id_veterinario: Number(veterinarioId),
        fecha_hora: fechaHora,
        motivo: motivo.trim(),
        observaciones: observaciones.trim() || null,
      });

      setSolicitudExitosa(true);
      setMensaje(
        `¡Turno solicitado correctamente! Número de solicitud: ${resultado.id_turno}.`,
      );
    } catch (error) {
      setMensaje(
        error instanceof Error
          ? error.message
          : "No se pudo registrar la solicitud del turno.",
      );
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main className="new-appointment">
      <header className="new-appointment__header">
        <button
          type="button"
          className="new-appointment__back"
          onClick={() => navigate("/turnos")}
        >
          ← Volver a mis turnos
        </button>

        <span className="new-appointment__eyebrow">
          GESTIÓN VETERINARIA
        </span>

        <h1>Solicitar un turno</h1>

        <p>
          Completá los datos para gestionar una atención para tu mascota.
        </p>
      </header>

      <section className="new-appointment__card">
        <div className="new-appointment__section-title">
          <span className="new-appointment__number">01</span>

          <div>
            <h2>Datos de la consulta</h2>
            <p>Seleccioná tu mascota y el profesional.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="new-appointment__field">
            <label htmlFor="mascota">Mascota</label>

            <select
              id="mascota"
              value={mascotaId}
              onChange={(event) => setMascotaId(event.target.value)}
              disabled={loadingMascotas || mascotas.length === 0}
              required
            >
              <option value="">
                {loadingMascotas
                  ? "Cargando mascotas..."
                  : mascotas.length === 0
                    ? "No hay mascotas disponibles"
                    : "Seleccioná una mascota"}
              </option>

              {mascotas.map((mascota) => (
                <option
                  key={mascota.id_mascota}
                  value={mascota.id_mascota}
                >
                  {mascota.nombre} — {mascota.especie}
                </option>
              ))}
            </select>

            {errorMascotas && (
              <div className="new-appointment__error">
                <p>{errorMascotas}</p>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                >
                  Reintentar
                </button>
              </div>
            )}
          </div>

          <div className="new-appointment__field">
            <label htmlFor="veterinario">Veterinario</label>

            <select
              id="veterinario"
              value={veterinarioId}
              onChange={(event) => setVeterinarioId(event.target.value)}
              disabled
              required
            >
              <option value="">
                Veterinarios no disponibles todavía
              </option>
            </select>

            <small>
              La selección se habilitará al conectar el listado de
              veterinarios.
            </small>
          </div>

          <div className="new-appointment__section-title new-appointment__section-title--second">
            <span className="new-appointment__number">02</span>

            <div>
              <h2>Fecha y horario</h2>
              <p>Consultá la disponibilidad para tu atención.</p>
            </div>
          </div>

          <div className="new-appointment__grid">
            <div className="new-appointment__field">
              <label htmlFor="fecha">Fecha</label>

              <input
                id="fecha"
                type="date"
                value={fecha}
                min={new Date().toISOString().split("T")[0]}
                onChange={(event) => {
                  setFecha(event.target.value);
                  setHorario("");
                }}
                required
              />
            </div>

            <div className="new-appointment__field">
              <label htmlFor="horario">Horario disponible</label>

              <select
                id="horario"
                value={horario}
                onChange={(event) => setHorario(event.target.value)}
                disabled={
                  !veterinarioId ||
                  !fecha ||
                  loadingHorarios ||
                  horarios.length === 0
                }
                required
              >
                <option value="">
                  {loadingHorarios
                    ? "Consultando horarios..."
                    : !veterinarioId
                      ? "Esperando veterinario"
                      : !fecha
                        ? "Seleccioná una fecha"
                        : "Seleccioná un horario"}
                </option>

                {horarios.map((hora) => (
                  <option key={hora} value={hora}>
                    {hora}
                  </option>
                ))}
              </select>

              {errorHorarios && (
                <small className="new-appointment__error-text">
                  {errorHorarios}
                </small>
              )}
            </div>
          </div>

          <div className="new-appointment__field">
            <label htmlFor="motivo">Motivo de la consulta</label>

            <input
              id="motivo"
              type="text"
              placeholder="Ej. Control general, vacunación..."
              value={motivo}
              onChange={(event) => setMotivo(event.target.value)}
              maxLength={150}
              required
            />
          </div>

          <div className="new-appointment__field">
            <label htmlFor="observaciones">
              Observaciones <span>(opcional)</span>
            </label>

            <textarea
              id="observaciones"
              placeholder="Agregá información importante..."
              value={observaciones}
              onChange={(event) => setObservaciones(event.target.value)}
              rows={4}
              maxLength={500}
            />
          </div>

          {mensaje && (
            <div className="new-appointment__notice">
              <span>{solicitudExitosa ? "✓" : "ℹ"}</span>
              <p>{mensaje}</p>
            </div>
          )}

          <div className="new-appointment__actions">
            {solicitudExitosa ? (
              <button
                type="button"
                className="new-appointment__submit"
                onClick={() => navigate("/turnos")}
              >
                Volver a mis turnos
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="new-appointment__cancel"
                  onClick={() => navigate("/turnos")}
                  disabled={enviando}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="new-appointment__submit"
                  disabled={
                    enviando ||
                    loadingMascotas ||
                    loadingHorarios ||
                    !mascotaId ||
                    !veterinarioId ||
                    !fecha ||
                    !horario ||
                    !motivo.trim()
                  }
                >
                  {enviando
                    ? "Enviando solicitud..."
                    : "Confirmar solicitud"}
                </button>
              </>
            )}
          </div>
        </form>
      </section>
    </main>
  );
}

