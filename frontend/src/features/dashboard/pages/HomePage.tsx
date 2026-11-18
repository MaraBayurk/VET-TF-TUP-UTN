import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock3, PawPrint, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { getAuthUser } from "../../auth/services/authStorage";
import animalHero from "../../../assets/img.1.png";
import {
  getDashboardAppointments,
  getDashboardClients,
  getDashboardPets,
  type DashboardAppointment,
  type DashboardClient,
  type DashboardPet,
} from "../services/dashboardService";
import "../styles/HomePage.scss";

const todayKey = () => {
  const values = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date());
  const part = (type: string) => values.find(value => value.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
};
const formatLongDate = () => new Intl.DateTimeFormat("es-AR", {
  timeZone: "America/Argentina/Buenos_Aires", weekday: "long", day: "numeric", month: "long", year: "numeric",
}).format(new Date());
const appointmentTime = (value: string) => value.slice(11, 16) || "—";
const appointmentDate = (value: string) => {
  const day = value.slice(0, 10);
  if (!day) return "Fecha sin definir";
  return new Date(`${day}T00:00:00`).toLocaleDateString("es-AR", { day: "2-digit", month: "short" });
};
const availableStatuses = new Set(["pendiente", "aprobado"]);
const statusLabel = (status: string) => status.toLocaleLowerCase("es") === "aprobado" ? "Confirmado" : status.toLocaleLowerCase("es") === "pendiente" ? "Pendiente" : status;
const statusClass = (status: string) => status.toLocaleLowerCase("es") === "aprobado" ? "confirmado" : status.toLocaleLowerCase("es");

function HomePage() {
  const user = getAuthUser();
  const role = user?.rol?.trim().toLocaleLowerCase("es") ?? "cliente";
  const isClient = role === "cliente";
  const firstName = user?.nombre?.trim() || "bienvenido";
  const [appointments, setAppointments] = useState<DashboardAppointment[]>([]);
  const [pets, setPets] = useState<DashboardPet[]>([]);
  const [clients, setClients] = useState<DashboardClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const request = isClient
      ? Promise.all([getDashboardAppointments("cliente"), getDashboardPets()]).then(([turns, registeredPets]) => ({ turns, registeredPets, registeredClients: [] as DashboardClient[] }))
      : Promise.all([
          getDashboardAppointments(role === "veterinario" ? "veterinario" : "administrador"),
          getDashboardPets(),
          getDashboardClients(),
        ]).then(([turns, registeredPets, registeredClients]) => ({ turns, registeredPets, registeredClients }));
    request.then(data => {
      if (!active) return;
      setAppointments(data.turns);
      setPets(data.registeredPets);
      setClients(data.registeredClients);
    }).catch(reason => {
      if (active) setError(reason instanceof Error ? reason.message : "No se pudo cargar el inicio");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [isClient, role]);

  const today = todayKey();
  const availableToday = useMemo(() => appointments
    .filter(turn => turn.fecha_hora.slice(0, 10) === today && availableStatuses.has(turn.estado.toLocaleLowerCase("es")))
    .sort((a, b) => a.fecha_hora.localeCompare(b.fecha_hora)), [appointments, today]);
  const activePets = pets.filter(pet => Boolean(pet.activo));
  const upcomingAppointments = appointments.slice(0, 5);
  const activeClients = clients.filter(client => Boolean(client.activo)).length;

  if (isClient) {
    return <section className="dashboard dashboard--client">
      <header className="dashboard__welcome">
        <img src={animalHero} alt="Un perro y un gato" />
        <div className="dashboard__welcome-copy"><span>VET · TU ESPACIO</span><h1>¡Hola, {firstName}!</h1><p>Nos alegra acompañarte en el cuidado de tus mascotas.</p></div>
        <PawPrint className="dashboard__welcome-paw" size={90} aria-hidden="true" />
      </header>
      {error && <div className="dashboard__error" role="alert">{error}</div>}
      <div className="dashboard__stats dashboard__stats--client">
        <article className="dashboard__stat"><span className="dashboard__stat-icon dashboard__stat-icon--green"><PawPrint size={21} /></span><div><span>Mis mascotas</span><strong>{loading ? "—" : activePets.length}</strong></div></article>
        <article className="dashboard__stat"><span className="dashboard__stat-icon dashboard__stat-icon--purple"><CalendarDays size={21} /></span><div><span>Próximos turnos</span><strong>{loading ? "—" : appointments.length}</strong></div></article>
        <article className="dashboard__stat"><span className="dashboard__stat-icon dashboard__stat-icon--blue"><Clock3 size={21} /></span><div><span>Pendientes</span><strong>{loading ? "—" : appointments.filter(turn => turn.estado.toLocaleLowerCase("es") === "pendiente").length}</strong></div></article>
      </div>
      <div className="dashboard__client-grid">
        <section className="dashboard__panel">
          <div className="dashboard__panel-heading"><div><span className="dashboard__eyebrow">TU AGENDA</span><h2>Próximos turnos</h2></div></div>
          {loading ? <p className="dashboard__empty" role="status">Cargando tus turnos…</p> : upcomingAppointments.length ? <div className="dashboard__appointments dashboard__appointments--client">{upcomingAppointments.map(turn => <AppointmentRow key={turn.id_turno} appointment={turn} />)}</div> : <p className="dashboard__empty">Todavía no tenés turnos próximos.</p>}
        </section>
        <section className="dashboard__panel">
          <div className="dashboard__panel-heading"><div><span className="dashboard__eyebrow">FAMILIA VET</span><h2>Mis mascotas</h2></div><Link to="/mascotas">Ver todas</Link></div>
          {loading ? <p className="dashboard__empty" role="status">Cargando mascotas…</p> : activePets.length ? <div className="dashboard__pets">{activePets.slice(0, 4).map(pet => <Link className="dashboard__pet" to={`/mascotas/${pet.id_mascota}`} key={pet.id_mascota}><span className="dashboard__pet-icon"><PawPrint size={19} /></span><span><strong>{pet.nombre}</strong><small>{pet.especie}{pet.raza ? ` · ${pet.raza}` : ""}</small></span></Link>)}</div> : <p className="dashboard__empty">Aún no hay mascotas registradas.</p>}
        </section>
      </div>
    </section>;
  }

  return <section className="dashboard dashboard--staff">
    <div className="dashboard__staff-top">
      <header className="dashboard__welcome">
        <img src={animalHero} alt="Un perro y un gato" />
        <div className="dashboard__welcome-copy"><span>PANEL DE GESTIÓN</span><h1>Buen día, {firstName}</h1><p>Revisá la agenda y el movimiento de la veterinaria.</p></div>
        <PawPrint className="dashboard__welcome-paw" size={90} aria-hidden="true" />
      </header>
      <aside className="dashboard__date-card"><span><CalendarDays size={22} /></span><div><strong>{formatLongDate()}</strong><small>{role === "veterinario" ? "Agenda profesional" : "Vista general de la clínica"}</small></div></aside>
    </div>
    {error && <div className="dashboard__error" role="alert">{error}</div>}
    <div className="dashboard__stats">
      <article className="dashboard__stat"><span className="dashboard__stat-icon dashboard__stat-icon--purple"><CalendarDays size={21} /></span><div><span>Turnos disponibles hoy</span><strong>{loading ? "—" : availableToday.length}</strong></div></article>
      <article className="dashboard__stat"><span className="dashboard__stat-icon dashboard__stat-icon--orange"><Clock3 size={21} /></span><div><span>Pendientes</span><strong>{loading ? "—" : availableToday.filter(turn => turn.estado.toLocaleLowerCase("es") === "pendiente").length}</strong></div></article>
      <article className="dashboard__stat"><span className="dashboard__stat-icon dashboard__stat-icon--green"><PawPrint size={21} /></span><div><span>Mascotas activas</span><strong>{loading ? "—" : activePets.length}</strong></div></article>
      <article className="dashboard__stat"><span className="dashboard__stat-icon dashboard__stat-icon--blue"><Users size={21} /></span><div><span>Clientes activos</span><strong>{loading ? "—" : activeClients}</strong></div></article>
    </div>
    <section className="dashboard__panel">
      <div className="dashboard__panel-heading"><div><span className="dashboard__eyebrow">{formatLongDate()}</span><h2>Turnos disponibles hoy</h2><p>Se muestran turnos pendientes y confirmados; la gestión de reservas estará disponible más adelante.</p></div><span className="dashboard__count">{loading ? "…" : availableToday.length}</span></div>
      {loading ? <p className="dashboard__empty" role="status">Cargando agenda…</p> : availableToday.length ? <AppointmentsTable appointments={availableToday} /> : <p className="dashboard__empty">No hay turnos disponibles para hoy.</p>}
    </section>
  </section>;
}

function AppointmentRow({ appointment }: { appointment: DashboardAppointment }) {
  return <article className="dashboard__appointment"><span className="dashboard__appointment-time"><strong>{appointmentDate(appointment.fecha_hora)}</strong><small>{appointmentTime(appointment.fecha_hora)}</small></span><span className="dashboard__appointment-pet"><PawPrint size={18} /></span><div className="dashboard__appointment-info"><strong>{appointment.nombre_mascota}</strong><small>{appointment.motivo || "Consulta veterinaria"}</small></div><span className={`dashboard__status dashboard__status--${statusClass(appointment.estado)}`}>{statusLabel(appointment.estado)}</span></article>;
}
function AppointmentsTable({ appointments }: { appointments: DashboardAppointment[] }) {
  return <div className="dashboard__table-wrap"><table className="dashboard__table"><thead><tr><th>Hora</th><th>Mascota</th><th>Cliente</th><th>Motivo</th><th>Estado</th></tr></thead><tbody>{appointments.map(appointment => <tr key={appointment.id_turno}><td><strong>{appointmentTime(appointment.fecha_hora)}</strong></td><td><span className="dashboard__table-pet"><PawPrint size={17} /><strong>{appointment.nombre_mascota}</strong></span></td><td>{appointment.nombre_cliente ? `${appointment.nombre_cliente} ${appointment.apellido_cliente ?? ""}` : "—"}</td><td>{appointment.motivo || "Consulta veterinaria"}</td><td><span className={`dashboard__status dashboard__status--${statusClass(appointment.estado)}`}>{statusLabel(appointment.estado)}</span></td></tr>)}</tbody></table></div>;
}

export default HomePage;
