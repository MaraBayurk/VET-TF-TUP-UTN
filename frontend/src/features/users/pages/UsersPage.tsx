import { useEffect, useMemo, useState } from "react";
import { Search, Plus, Users, ShieldCheck, Stethoscope } from "lucide-react";
import { useNavigate } from "react-router-dom";
import UsersTable, { type UserItem } from "../components/UsersTable";
import { deactivateUser, getUsers, type UserRecord } from "../services";
import "../styles/UsersPage.scss";

const toUserItem = (user: UserRecord): UserItem => ({
  id: user.id_usuario,
  name: `${user.nombre} ${user.apellido}`,
  document: user.numero_documento,
  email: user.email,
  role: user.rol.toLocaleLowerCase("es") === "administrador" ? "Administrador" : "Veterinario",
  specialty: user.especialidad || "—",
  status: user.activo ? "Activo" : "Inactivo",
});

function UsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("Todos");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState("");
  const navigate = useNavigate();

  const loadUsers = async () => {
    setLoading(true);
    setError("");
    try { setUsers((await getUsers()).map(toUserItem)); }
    catch (e) { setError(e instanceof Error ? e.message : "No se pudieron cargar los usuarios"); }
    finally { setLoading(false); }
  };
  useEffect(() => {
    let active = true;
    getUsers().then(data => { if (active) setUsers(data.map(toUserItem)); })
      .catch(e => { if (active) setError(e instanceof Error ? e.message : "No se pudieron cargar los usuarios"); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const filteredUsers = useMemo(() => users.filter(user => {
    const q = search.trim().toLocaleLowerCase("es");
    return (!q || user.name.toLocaleLowerCase("es").includes(q) || user.email.toLocaleLowerCase("es").includes(q) || user.document.includes(q))
      && (roleFilter === "Todos" || user.role === roleFilter);
  }), [users, search, roleFilter]);
  const adminCount = users.filter(user => user.role === "Administrador").length;
  const vetCount = users.filter(user => user.role === "Veterinario").length;

  const handleDeactivate = async (user: UserItem) => {
    setActionError("");
    try { await deactivateUser(user.id); await loadUsers(); }
    catch (e) { setActionError(e instanceof Error ? e.message : "No se pudo dar de baja al usuario"); }
  };

  return (
    <section className="users-page">
      <div className="users-page__heading"><div><h1>Usuarios</h1><p>Administrá las cuentas de administradores y veterinarios.</p></div></div>
      {error && <div role="alert" className="users-page__error">{error} <button type="button" onClick={() => void loadUsers()}>Reintentar</button></div>}
      {actionError && <div role="alert" className="users-page__error">{actionError}</div>}
      <div className="users-page__stats">
        <article className="users-page__stat-card"><div className="users-page__stat-icon users-page__stat-icon--green"><Users size={20} /></div><div><span>Usuarios activos</span><strong>{users.filter(u => u.status === "Activo").length}</strong></div></article>
        <article className="users-page__stat-card"><div className="users-page__stat-icon users-page__stat-icon--purple"><ShieldCheck size={20} /></div><div><span>Administradores</span><strong>{adminCount}</strong></div></article>
        <article className="users-page__stat-card"><div className="users-page__stat-icon users-page__stat-icon--blue"><Stethoscope size={20} /></div><div><span>Veterinarios</span><strong>{vetCount}</strong></div></article>
      </div>
      <div className="users-page__panel">
        <div className="users-page__filters">
          <label className="users-page__search"><Search size={16} /><input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Nombre, apellido, email o DNI" /></label>
          <select value={roleFilter} onChange={event => setRoleFilter(event.target.value)} aria-label="Filtrar por rol"><option value="Todos">Todos los roles</option><option value="Administrador">Administrador</option><option value="Veterinario">Veterinario</option></select>
          <button type="button" className="users-page__new-button" onClick={() => navigate("/usuarios/nuevo")}><Plus size={16} />Nuevo usuario</button>
        </div>
        {loading ? <p role="status">Cargando usuarios…</p> : <UsersTable users={filteredUsers} onDeactivate={handleDeactivate} />}
        {!loading && !error && <div className="users-page__results">Mostrando {filteredUsers.length} de {users.length} usuarios</div>}
      </div>
    </section>
  );
}
export default UsersPage;
