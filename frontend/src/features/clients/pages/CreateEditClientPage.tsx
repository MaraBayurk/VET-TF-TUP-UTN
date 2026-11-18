import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { ArrowLeft, PawPrint } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { createClient, getClient, updateClient, type ClientPayload } from "../services/clientService";
import "../styles/ClientFormPage.scss";

const initialForm = { nombre: "", apellido: "", numero_documento: "", telefono: "", email: "", direccion: "", password: "" };
type FormState = typeof initialForm;
function CreateEditClientPage() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(initialForm);
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!id) return;
    let active = true;
    getClient(id).then(client => { if (active) setForm({
      nombre: client.nombre, apellido: client.apellido, numero_documento: client.numero_documento,
      telefono: client.telefono || "", email: client.email,
      direccion: client.direccion || "", password: "",
    }); }).catch(e => { if (active) setError(e instanceof Error ? e.message : "No se pudo cargar el cliente"); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);
  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(previous => ({ ...previous, [event.target.name]: event.target.value }));
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError(""); setSaving(true);
    const payload: ClientPayload = {
      nombre: form.nombre.trim(), apellido: form.apellido.trim(), numero_documento: form.numero_documento.trim(),
      email: form.email.trim(), telefono: form.telefono.trim(), direccion: form.direccion.trim(),
      ...(form.password ? { password: form.password } : {}),
    };
    try { if (editing) await updateClient(id!, payload); else await createClient(payload); navigate("/clientes", { replace: true }); }
    catch (e) { setError(e instanceof Error ? e.message : "No se pudo guardar el cliente"); }
    finally { setSaving(false); }
  };
  if (loading) return <p className="client-form__loading" role="status">Cargando cliente…</p>;
  return <section className="client-form-page">
    <button type="button" className="client-form-page__back" onClick={() => navigate("/clientes")}><ArrowLeft size={16} />Volver a clientes</button>
    <header className="client-form-page__heading"><div><span className="client-form-page__eyebrow"><PawPrint size={14} />GESTIÓN DE CLIENTES</span><h1>{editing ? "Editar cliente" : "Nuevo cliente"}</h1><p>{editing ? "Modificá la información del cliente." : "Completá los datos para registrar una nueva cuenta."}</p></div></header>
    {error && <div role="alert" className="client-form-page__error">{error}</div>}
    <form className="client-form" onSubmit={handleSubmit}>
      <div className="client-form__intro"><h2>Datos del cliente</h2><p>Los campos marcados con * son obligatorios.</p></div>
      <div className="client-form__grid">
        <label>Nombre *<input name="nombre" value={form.nombre} onChange={handleChange} required maxLength={100} placeholder="Ej. María" /></label>
        <label>Apellido *<input name="apellido" value={form.apellido} onChange={handleChange} required maxLength={100} placeholder="Ej. González" /></label>
        <label>DNI *<input name="numero_documento" value={form.numero_documento} onChange={handleChange} required maxLength={20} placeholder="Ej. 12345678" /></label>
        <label>Teléfono<input name="telefono" value={form.telefono} onChange={handleChange} maxLength={30} type="tel" placeholder="Ej. 381 123 4567" /></label>
        <label>Email *<input name="email" value={form.email} onChange={handleChange} required maxLength={150} type="email" placeholder="Ej. maria@email.com" /></label>
        <label className="client-form__full">Dirección<input name="direccion" value={form.direccion} onChange={handleChange} maxLength={255} placeholder="Ej. San Miguel de Tucumán" /></label>
        <label className="client-form__full">{editing ? "Nueva contraseña" : "Contraseña *"}<input name="password" value={form.password} onChange={handleChange} type="password" minLength={8} required={!editing} autoComplete="new-password" placeholder={editing ? "Dejar vacío para mantener la actual" : "Mínimo 8 caracteres"} />{editing && <small>Solo completá este campo si querés cambiar la contraseña.</small>}</label>
      </div>
      <div className="client-form__actions"><button type="button" className="client-form__cancel" onClick={() => navigate("/clientes")}>Cancelar</button><button type="submit" className="client-form__submit" disabled={saving}>{saving ? "Guardando…" : editing ? "Guardar cambios" : "Guardar cliente"}<span>→</span></button></div>
    </form>
  </section>;
}
export default CreateEditClientPage;
