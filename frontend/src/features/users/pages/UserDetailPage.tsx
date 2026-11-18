import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { UserRound, Pencil, UserRoundX } from "lucide-react";
import ConfirmModal from "../../../components/commons/ConfirmModal/ConfirmModal";
import { deactivateUser, getUser, type UserRecord } from "../services";
import "../styles/UserDetailPage.scss";

function UserDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserRecord | null>(null);
  const [loadedId, setLoadedId] = useState("");
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionError, setActionError] = useState("");
  useEffect(() => {
    let active = true;
    getUser(id).then(value => { if (active) { setUser(value); setLoadedId(id); } })
      .catch(e => { if (active) setError(e instanceof Error ? e.message : "No se pudo cargar el usuario"); })
      .finally(() => { if (active) setLoadedId(id); });
    return () => { active = false; };
  }, [id]);

  const handleDeactivate = async () => {
    if (!user) return;
    try { await deactivateUser(user.id_usuario); navigate("/usuarios", { replace: true }); }
    catch (e) { setActionError(e instanceof Error ? e.message : "No se pudo dar de baja al usuario"); }
    finally { setIsModalOpen(false); }
  };
  if (loadedId !== id && !error) return <p role="status">Cargando usuario…</p>;
  if (!user) return <div className="user-detail__not-found"><h2>{error || "Usuario no encontrado"}</h2><button onClick={() => navigate("/usuarios")}>Volver al listado</button></div>;
  const name = `${user.nombre} ${user.apellido}`;
  const status = user.activo ? "Activo" : "Inactivo";
  const role = user.rol.toLocaleLowerCase("es") === "administrador" ? "Administrador" : "Veterinario";
  const date = new Date(user.fecha_creacion).toLocaleDateString("es-AR");
  return <>
    <section className="user-detail">
      <header className="user-detail__heading"><div><h1>Detalle de usuario</h1><p>Información personal y profesional de la cuenta.</p></div></header>
      {actionError && <p role="alert">{actionError}</p>}
      <section className="user-detail__profile">
        <div className="user-detail__identity"><div className="user-detail__avatar"><UserRound size={28} /></div><div><h2>{name}</h2><p>DNI: {user.numero_documento} <span>·</span> {user.email}</p><p>Tel. {user.telefono || "Sin teléfono"}</p></div></div>
        <span className={`user-detail__status user-detail__status--${status.toLowerCase()}`}>{status}</span>
        <div className="user-detail__buttons"><button type="button" className="user-detail__edit" onClick={() => navigate(`/usuarios/${user.id_usuario}/editar`)}><Pencil size={15} />Editar</button>{user.activo && <button type="button" className="user-detail__deactivate" onClick={() => setIsModalOpen(true)}><UserRoundX size={15} />Dar de baja</button>}</div>
      </section>
      <div className="user-detail__cards">
        <article className="user-detail__card"><h3>Datos personales</h3><div className="user-detail__information"><div><span>Nombre completo</span><strong>{name}</strong></div><div><span>Documento</span><strong>{user.numero_documento}</strong></div><div><span>Correo electrónico</span><strong>{user.email}</strong></div><div><span>Teléfono</span><strong>{user.telefono || "—"}</strong></div><div><span>Fecha de registro</span><strong>{date}</strong></div></div></article>
        <article className="user-detail__card"><h3>Datos profesionales</h3><div className="user-detail__professional"><div><span>Rol asignado</span><strong className="user-detail__role">{role}</strong></div>{role === "Veterinario" && <><div><span>Matrícula profesional</span><strong>{user.matricula || "—"}</strong></div><div><span>Especialidad</span><strong>{user.especialidad || "—"}</strong></div></>}</div></article>
      </div>
    </section>
    <ConfirmModal isOpen={isModalOpen} title="Dar de baja usuario" description="¿Estás segura de que querés dar de baja a" highlightedText={`${name}?`} details="La cuenta quedará inactiva y no podrá iniciar sesión. Se conservarán sus datos e historial." confirmText="Dar de baja" cancelText="Cancelar" onConfirm={handleDeactivate} onCancel={() => setIsModalOpen(false)} />
  </>;
}
export default UserDetailPage;
