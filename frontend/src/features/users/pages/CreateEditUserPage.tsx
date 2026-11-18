import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { PawPrint, Plus } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { createUser, getUser, getUserCatalogs, updateUser, type UserCatalogs, type UserPayload, type UserRecord } from "../services";
import "../styles/CreateUserPage.scss";

const emptyForm = { nombre: "", apellido: "", numero_documento: "", telefono: "", email: "", password: "", id_rol: "", direccion: "", matricula: "", id_especialidad: "" };
type FormState = typeof emptyForm;
function CreateEditUserPage() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [catalogs, setCatalogs] = useState<UserCatalogs>({ roles: [], especialidades: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    Promise.all([getUserCatalogs(), editing ? getUser(id!) : Promise.resolve(null as UserRecord | null)])
      .then(([available, user]) => {
        if (!active) return;
        setCatalogs(available);
        if (user) setForm({
          nombre: user.nombre, apellido: user.apellido, numero_documento: user.numero_documento,
          telefono: user.telefono || "", email: user.email, password: "", id_rol: String(user.id_rol),
          direccion: user.direccion || "", matricula: user.matricula || "", id_especialidad: user.id_especialidad ? String(user.id_especialidad) : "",
        });
      }).catch(e => { if (active) setError(e instanceof Error ? e.message : "No se pudo cargar el formulario"); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [editing, id]);
  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm(previous => ({ ...previous, [event.target.name]: event.target.value }));
  const isVet = catalogs.roles.find(role => String(role.id_rol) === form.id_rol)?.nombre.toLocaleLowerCase("es") === "veterinario";
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError(""); setSaving(true);
    const payload: UserPayload = {
      nombre: form.nombre.trim(), apellido: form.apellido.trim(), numero_documento: form.numero_documento.trim(),
      email: form.email.trim(), telefono: form.telefono.trim() || undefined, id_rol: Number(form.id_rol),
      ...(form.password ? { password: form.password } : {}),
      ...(isVet ? { matricula: form.matricula.trim(), id_especialidad: Number(form.id_especialidad) } : {}),
    };
    try {
      if (editing) await updateUser(id!, payload); else await createUser(payload);
      navigate("/usuarios", { replace: true });
    } catch (e) { setError(e instanceof Error ? e.message : "No se pudo guardar el usuario"); }
    finally { setSaving(false); }
  };
  if (loading) return <p role="status">Cargando formulario…</p>;
  return <section className="create-user">
    <header className="create-user__heading"><div><h1>{editing ? "Editar usuario" : "Crear nuevo usuario"}</h1><p>{editing ? "Actualizá los datos de la cuenta." : "Registrá un administrador o veterinario."}</p></div><div className="create-user__heading-icons"><PawPrint size={22} /><Plus size={22} /></div></header>
    {error && <div role="alert" className="create-user__error">{error}</div>}
    <form className="create-user__form" onSubmit={handleSubmit}>
      <div className="create-user__form-heading"><h2>Datos personales</h2><p>Completá los campos obligatorios.</p></div>
      <div className="create-user__grid">
        <div className="create-user__field"><label htmlFor="nombre">Nombre *</label><input id="nombre" name="nombre" value={form.nombre} onChange={handleChange} required maxLength={100} /></div>
        <div className="create-user__field"><label htmlFor="apellido">Apellido *</label><input id="apellido" name="apellido" value={form.apellido} onChange={handleChange} required maxLength={100} /></div>
        <div className="create-user__field"><label htmlFor="numero_documento">Documento *</label><input id="numero_documento" name="numero_documento" value={form.numero_documento} onChange={handleChange} inputMode="numeric" required maxLength={20} /></div>
        <div className="create-user__field"><label htmlFor="telefono">Teléfono</label><input id="telefono" name="telefono" type="tel" value={form.telefono} onChange={handleChange} maxLength={30} /></div>
        <div className="create-user__field"><label htmlFor="email">Email *</label><input id="email" name="email" type="email" value={form.email} onChange={handleChange} required maxLength={150} /></div>
        <div className="create-user__field"><label htmlFor="password">{editing ? "Nueva contraseña" : "Contraseña *"}</label><input id="password" name="password" type="password" value={form.password} onChange={handleChange} minLength={8} required={!editing} autoComplete="new-password" placeholder={editing ? "Dejar vacío para mantener la actual" : "Mínimo 8 caracteres"} /></div>
        <div className="create-user__field create-user__field--full"><label htmlFor="id_rol">Rol *</label><select id="id_rol" name="id_rol" value={form.id_rol} onChange={handleChange} required disabled={editing}><option value="">Seleccioná un rol</option>{catalogs.roles.map(role => <option key={role.id_rol} value={role.id_rol}>{role.nombre}</option>)}</select>{editing && <small>El rol de una cuenta existente no se puede cambiar.</small>}</div>
        {isVet && <><div className="create-user__field"><label htmlFor="matricula">Matrícula profesional *</label><input id="matricula" name="matricula" value={form.matricula} onChange={handleChange} required maxLength={50} /></div><div className="create-user__field"><label htmlFor="id_especialidad">Especialidad *</label><select id="id_especialidad" name="id_especialidad" value={form.id_especialidad} onChange={handleChange} required><option value="">Seleccioná una especialidad</option>{catalogs.especialidades.map(specialty => <option key={specialty.id_especialidad} value={specialty.id_especialidad}>{specialty.nombre}</option>)}</select></div></>}
      </div>
      <div className="create-user__actions"><button type="button" className="create-user__cancel" onClick={() => navigate("/usuarios")}>Cancelar</button><button type="submit" className="create-user__submit" disabled={saving || !form.id_rol}>{saving ? "Guardando…" : editing ? "Guardar cambios" : "Crear usuario"} <span>→</span></button></div>
    </form>
  </section>;
}
export default CreateEditUserPage;
