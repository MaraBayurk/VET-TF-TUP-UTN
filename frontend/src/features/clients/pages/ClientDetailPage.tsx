import { useEffect, useState } from "react";
import { ArrowLeft, CalendarDays, Dog, Mail, MapPin, Pencil, Phone, UserRound, UserRoundX } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import ConfirmModal from "../../../components/commons/ConfirmModal/ConfirmModal";
import { deactivateClient, getClient, type ClientRecord } from "../services/clientService";
import "../styles/ClientDetailPage.scss";

type Tab = "informacion" | "mascotas" | "turnos";
const formatDate = (value: string | null) => value ? new Date(`${value.slice(0, 10)}T00:00:00`).toLocaleDateString("es-AR") : "—";
function ClientDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState<ClientRecord | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("informacion");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [actionError, setActionError] = useState("");
  useEffect(() => {
    let active = true;
    getClient(id).then(value => { if (active) setClient(value); })
      .catch(e => { if (active) setError(e instanceof Error ? e.message : "No se pudo cargar el cliente"); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);
  const handleDeactivate = async () => {
    if (!client) return;
    try { await deactivateClient(client.id_cliente); navigate("/clientes", { replace: true }); }
    catch (e) { setActionError(e instanceof Error ? e.message : "No se pudo dar de baja al cliente"); }
    finally { setConfirmOpen(false); }
  };
  if (loading) return <p className="client-detail__loading" role="status">Cargando cliente…</p>;
  if (!client) return <div className="client-detail__not-found"><h2>{error || "Cliente no encontrado"}</h2><button type="button" onClick={() => navigate("/clientes")}><ArrowLeft size={16} />Volver a clientes</button></div>;
  const name = `${client.nombre} ${client.apellido}`;
  const active = Boolean(client.activo);
  const pets = client.mascotas ?? [];
  const turns = client.turnos ?? [];
  return <section className="client-detail">
    <button type="button" className="client-detail__back" onClick={() => navigate("/clientes")}><ArrowLeft size={16} />Volver a clientes</button>
    {actionError && <div role="alert" className="client-detail__error">{actionError}</div>}
    <header className="client-detail__profile">
      <div className="client-detail__avatar"><UserRound size={32} /></div>
      <div className="client-detail__identity"><h1>{name}</h1><p>DNI: {client.numero_documento}</p><p>{client.email} <span>·</span> {client.telefono || "Sin teléfono"}</p></div>
      <span className={`client-detail__status client-detail__status--${active ? "activo" : "inactivo"}`}>{active ? "Activo" : "Inactivo"}</span>
      <div className="client-detail__actions"><button type="button" className="client-detail__edit" onClick={() => navigate(`/clientes/${client.id_cliente}/editar`)}><Pencil size={15} />Editar</button>{active && <button type="button" className="client-detail__deactivate" onClick={() => setConfirmOpen(true)}><UserRoundX size={15} />Dar de baja</button>}</div>
    </header>
    <nav className="client-detail__tabs" aria-label="Información del cliente">
      <button type="button" className={tab === "informacion" ? "active" : ""} onClick={() => setTab("informacion")}>Información</button>
      <button type="button" className={tab === "mascotas" ? "active" : ""} onClick={() => setTab("mascotas")}>Mascotas ({pets.length})</button>
      <button type="button" className={tab === "turnos" ? "active" : ""} onClick={() => setTab("turnos")}>Historial de turnos</button>
    </nav>
    {tab === "informacion" && <div className="client-detail__grid">
      <article className="client-detail__card"><div className="client-detail__card-heading"><h2>Datos personales</h2><button type="button" onClick={() => navigate(`/clientes/${client.id_cliente}/editar`)}><Pencil size={14} />Editar</button></div>
        <div className="client-detail__info-item"><UserRound size={17} /><div><span>Nombre completo</span><strong>{name}</strong></div></div>
        <div className="client-detail__info-item"><UserRound size={17} /><div><span>DNI</span><strong>{client.numero_documento}</strong></div></div>
        <div className="client-detail__info-item"><Mail size={17} /><div><span>Email</span><strong>{client.email}</strong></div></div>
        <div className="client-detail__info-item"><Phone size={17} /><div><span>Teléfono</span><strong>{client.telefono || "—"}</strong></div></div>
        <div className="client-detail__info-item"><MapPin size={17} /><div><span>Dirección</span><strong>{client.direccion || "—"}</strong></div></div>
        <div className="client-detail__info-item"><CalendarDays size={17} /><div><span>Fecha de registro</span><strong>{formatDate(client.fecha_creacion)}</strong></div></div>
      </article>
      <div className="client-detail__side">
        <article className="client-detail__card"><div className="client-detail__card-heading"><h2>Mascotas del cliente</h2><button type="button" onClick={() => setTab("mascotas")}>Ver todas</button></div>
          {pets.length ? pets.slice(0, 4).map(pet => <button type="button" className="client-detail__pet" key={pet.id_mascota} onClick={() => navigate(`/mascotas/${pet.id_mascota}`)}><span><Dog size={18} /></span><div><strong>{pet.nombre}</strong><small>{pet.especie}{pet.raza ? ` · ${pet.raza}` : ""}</small></div><span className={`client-detail__pet-state ${pet.activo ? "" : "is-inactive"}`}>{pet.activo ? "Activa" : "Inactiva"}</span></button>) : <p className="client-detail__empty">Este cliente todavía no tiene mascotas registradas.</p>}
        </article>
        <article className="client-detail__card"><div className="client-detail__card-heading"><h2>Últimos turnos</h2><button type="button" onClick={() => setTab("turnos")}>Ver todos</button></div>
          {turns.length ? turns.slice(0, 3).map(turn => <div className="client-detail__turn" key={turn.id_turno}><span><Dog size={18} /></span><div><strong>{turn.nombre_mascota}</strong><small>{turn.motivo || "Consulta veterinaria"}</small></div><time>{formatDate(turn.fecha_hora)}<small>{new Date(turn.fecha_hora).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}</small></time></div>) : <p className="client-detail__empty">No hay turnos registrados.</p>}
        </article>
      </div>
    </div>}
    {tab === "mascotas" && <article className="client-detail__card client-detail__list-card"><h2>Mascotas de {client.nombre}</h2>{pets.length ? <div className="client-detail__pet-grid">{pets.map(pet => <button type="button" className="client-detail__pet client-detail__pet--large" key={pet.id_mascota} onClick={() => navigate(`/mascotas/${pet.id_mascota}`)}><span><Dog size={20} /></span><div><strong>{pet.nombre}</strong><small>{pet.especie}{pet.raza ? ` · ${pet.raza}` : ""} · {pet.sexo}</small></div><span className={`client-detail__pet-state ${pet.activo ? "" : "is-inactive"}`}>{pet.activo ? "Activa" : "Inactiva"}</span></button>)}</div> : <p className="client-detail__empty">Este cliente todavía no tiene mascotas registradas.</p>}</article>}
    {tab === "turnos" && <article className="client-detail__card client-detail__list-card"><h2>Historial de turnos</h2>{turns.length ? <div className="client-detail__turn-list">{turns.map(turn => <div className="client-detail__turn client-detail__turn--large" key={turn.id_turno}><span><CalendarDays size={18} /></span><div><strong>{turn.nombre_mascota} · {turn.motivo || "Consulta veterinaria"}</strong><small>Dr/a. {turn.nombre_veterinario} {turn.apellido_veterinario}</small></div><time>{formatDate(turn.fecha_hora)} · {new Date(turn.fecha_hora).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}<small>{turn.estado}</small></time></div>)}</div> : <p className="client-detail__empty">No hay turnos registrados para este cliente.</p>}</article>}
    <ConfirmModal isOpen={confirmOpen} title="Dar de baja cliente" description="¿Estás segura de que querés dar de baja a" highlightedText={`${name}?`} details="El cliente se marcará como inactivo. Se conservarán sus datos, mascotas, turnos e historial clínico." confirmText="Dar de baja" cancelText="Cancelar" onConfirm={handleDeactivate} onCancel={() => setConfirmOpen(false)} />
  </section>;
}
export default ClientDetailPage;
