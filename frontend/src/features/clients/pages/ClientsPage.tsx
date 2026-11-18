import { useEffect, useMemo, useState } from "react";
import { PawPrint, Plus, Search, Users, Heart, CalendarDays, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ClientsTable from "../components/ClientsTable";
import { deactivateClient, getClients, type ClientRecord } from "../services/clientService";
import "../styles/ClientsPage.scss";

const PAGE_SIZE = 6;
function ClientsPage() {
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Todos");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const navigate = useNavigate();
  const loadClients = async () => {
    setLoading(true); setError("");
    try { setClients(await getClients()); }
    catch (e) { setError(e instanceof Error ? e.message : "No se pudieron cargar los clientes"); }
    finally { setLoading(false); }
  };
  useEffect(() => {
    let active = true;
    getClients().then(data => { if (active) setClients(data); })
      .catch(e => { if (active) setError(e instanceof Error ? e.message : "No se pudieron cargar los clientes"); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  const filtered = useMemo(() => clients.filter(client => {
    const query = search.trim().toLocaleLowerCase("es");
    const name = `${client.nombre} ${client.apellido}`.toLocaleLowerCase("es");
    const matchesSearch = !query || name.includes(query) || client.email.toLocaleLowerCase("es").includes(query) || client.numero_documento.toLocaleLowerCase("es").includes(query) || (client.telefono ?? "").includes(query);
    return matchesSearch && (status === "Todos" || (status === "Activos" && Boolean(client.activo)) || (status === "Inactivos" && !client.activo));
  }), [clients, search, status]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const activeCount = clients.filter(client => client.activo).length;
  const petCount = clients.reduce((sum, client) => sum + Number(client.cantidad_mascotas ?? 0), 0);
  const handleDeactivate = async (client: ClientRecord) => {
    setActionError("");
    try { await deactivateClient(client.id_cliente); await loadClients(); }
    catch (e) { setActionError(e instanceof Error ? e.message : "No se pudo dar de baja al cliente"); }
  };
  const clearFilters = () => { setSearch(""); setStatus("Todos"); setPage(1); };
  return <section className="clients-page">
    <header className="clients-page__banner"><div className="clients-page__banner-content"><span className="clients-page__eyebrow">VET · GESTIÓN</span><h1>Clientes</h1><p>Gestioná la información de los clientes de la veterinaria.</p></div><div className="clients-page__banner-decoration" aria-hidden="true"><PawPrint size={100} /></div></header>
    {error && <div role="alert" className="clients-page__error">{error}<button type="button" onClick={() => void loadClients()}>Reintentar</button></div>}
    {actionError && <div role="alert" className="clients-page__error">{actionError}</div>}
    <section className="clients-page__stats">
      <article><span className="clients-page__stat-icon clients-page__stat-icon--green"><Users size={20} /></span><div><span>Clientes activos</span><strong>{activeCount}</strong></div></article>
      <article><span className="clients-page__stat-icon clients-page__stat-icon--purple"><Heart size={20} /></span><div><span>Mascotas registradas</span><strong>{petCount}</strong></div></article>
      <article><span className="clients-page__stat-icon clients-page__stat-icon--blue"><CalendarDays size={20} /></span><div><span>Clientes registrados</span><strong>{clients.length}</strong></div></article>
    </section>
    <section className="clients-page__panel">
      <div className="clients-page__toolbar">
        <label className="clients-page__search"><Search size={17} /><input value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} type="search" placeholder="Buscar por nombre, apellido, email o documento…" /></label>
        <label className="clients-page__filter"><span>Estado</span><select value={status} onChange={event => { setStatus(event.target.value); setPage(1); }}><option>Todos</option><option>Activos</option><option>Inactivos</option></select></label>
        {(search || status !== "Todos") && <button className="clients-page__clear" type="button" onClick={clearFilters}><X size={15} />Limpiar filtros</button>}
        <button className="clients-page__new-button" type="button" onClick={() => navigate("/clientes/nuevo")}><Plus size={17} />Nuevo cliente</button>
      </div>
      <div className="clients-page__table-heading"><div><h2>Listado de clientes</h2><p>Información de contacto, mascotas y estado de cada cuenta.</p></div></div>
      {loading ? <p className="clients-page__loading" role="status">Cargando clientes…</p> : <ClientsTable clients={pageItems} onDeactivate={handleDeactivate} />}
      {!loading && !error && <footer className="clients-page__pagination"><span>Mostrando {filtered.length ? (page - 1) * PAGE_SIZE + 1 : 0} a {Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length} clientes</span><div className="clients-page__pagination-controls"><button type="button" disabled={page === 1} onClick={() => setPage(value => value - 1)} aria-label="Página anterior">‹</button>{Array.from({ length: pages }, (_, index) => index + 1).map(value => <button type="button" key={value} className={page === value ? "active" : ""} onClick={() => setPage(value)}>{value}</button>)}<button type="button" disabled={page === pages} onClick={() => setPage(value => value + 1)} aria-label="Página siguiente">›</button></div></footer>}
    </section>
  </section>;
}
export default ClientsPage;
