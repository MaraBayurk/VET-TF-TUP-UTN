import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  PawPrint,
  Search,
  UserRound,
} from "lucide-react";

import { getAuthUser } from "../../auth/services/authStorage";
import { getClients } from "../../clients/services/clientService";
import { createPet, getPet, updatePet } from "../services/petService";
import "../styles/CreateEditPetPage.scss";
import { validatePetForm } from "../utils/validatePetForm";

interface Client {
  id_cliente: number;
  id_usuario: number;
  nombre: string;
  apellido: string;
  numero_documento: string;
  email?: string;
  telefono?: string | null;
}

interface PetFormData {
  nombre: string;
  especie: string;
  raza: string;
  fecha_nacimiento: string;
  sexo: string;
  observaciones: string;
}

const emptyForm: PetFormData = {
  nombre: "",
  especie: "",
  raza: "",
  fecha_nacimiento: "",
  sexo: "",
  observaciones: "",
};

function CreateEditPetPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const isEditing = Boolean(id);

  const role = getAuthUser()?.rol?.toLocaleUpperCase("es") ?? "CLIENTE";
  const isClient = role === "CLIENTE";
  const [step, setStep] = useState(isEditing || isClient ? 2 : 1);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientSearch, setClientSearch] = useState("");
  const [formData, setFormData] = useState<PetFormData>(emptyForm);
  const [errors, setErrors] = useState<Partial<PetFormData>>({});
  const [clientError, setClientError] = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;

    let active = true;
    getPet(id).then((pet) => {
      if (!active) return;
      setSelectedClient({ id_cliente: pet.id_cliente, id_usuario: pet.cliente.id_usuario, nombre: pet.cliente.nombre, apellido: pet.cliente.apellido, numero_documento: pet.cliente.numero_documento });
      setFormData({ nombre: pet.nombre, especie: pet.especie, raza: pet.raza ?? "", fecha_nacimiento: pet.fecha_nacimiento ?? "", sexo: pet.sexo, observaciones: pet.observaciones ?? "" });
      setStep(2);
    }).catch(() => { if (active) setNotFound(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  useEffect(() => {
    if (isClient) return;
    let active = true;
    getClients().then(data => { if (active) setClients(data.filter(client => Boolean(client.activo)).map(client => ({ ...client, telefono: client.telefono ?? "" }))); })
      .catch(reason => { if (active) setFormError(reason instanceof Error ? reason.message : "No se pudieron cargar los clientes"); });
    return () => { active = false; };
  }, [isClient]);

  const filteredClients = clients.filter((client) => {
    const search = clientSearch.toLowerCase().trim();

    const fullName = `${client.nombre} ${client.apellido}`.toLowerCase();

    return (
      fullName.includes(search) ||
      client.numero_documento.includes(search) ||
      (client.email ?? "").toLowerCase().includes(search)
    );
  });

  const handleChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: "",
    }));
  };

  const handleSelectClient = (client: Client) => {
    setSelectedClient(client);
    setClientError("");
  };
  const validatePet = () => {
    const newErrors = validatePetForm(formData);

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1) {
      if (!selectedClient) {
        setClientError("Seleccioná un cliente para continuar.");
        return;
      }

      setStep(2);
      return;
    }

    if (step === 2) {
      if (validatePet()) {
        setStep(3);
      }
    }
  };
  const handleSubmit = async () => {
    if (step !== 3 || (!isClient && !selectedClient)) {
      return;
    }
    setSubmitting(true); setFormError("");
    const payload = {
      ...(isClient ? {} : { id_cliente: selectedClient!.id_cliente }),
      nombre: formData.nombre.trim(), especie: formData.especie,
      raza: formData.raza.trim() || null, fecha_nacimiento: formData.fecha_nacimiento || null,
      sexo: formData.sexo, observaciones: formData.observaciones.trim() || null,
    };
    try {
      if (isEditing && id) {
        const editablePayload = isClient ? { raza: payload.raza, sexo: payload.sexo, observaciones: payload.observaciones } : payload;
        await updatePet(id, editablePayload);
      } else await createPet(payload);
      navigate("/mascotas");
    } catch (reason) {
      setFormError(reason instanceof Error ? reason.message : "No se pudo guardar la mascota");
    } finally { setSubmitting(false); }
  };

  if (loading) return <section className="pet-form"><p role="status">Cargando mascota…</p></section>;

  if (notFound) {
    return (
      <section className="pet-form__not-found">
        <h2>Mascota no encontrada</h2>

        <button type="button" onClick={() => navigate("/mascotas")}>
          Volver al listado
        </button>
      </section>
    );
  }

  return (
    <section className="pet-form">
      <button
        type="button"
        className="pet-form__back"
        onClick={() => navigate("/mascotas")}
      >
        <ArrowLeft size={17} />
        Volver a mascotas
      </button>

      <div className="pet-form__card">
        <header className="pet-form__heading">
          <div className="pet-form__heading-icon">
            <PawPrint size={24} />
          </div>

          <div>
            <h1>{isEditing ? "Editar mascota" : isClient ? "Registrar mascota" : "Nueva mascota"}</h1>
            <p>
              {isEditing
                ? "Actualizá los datos de la mascota."
                : isClient
                  ? "Completá los datos para agregar una mascota a tu cuenta."
                  : "Completá los pasos para registrar una mascota."}
            </p>
          </div>
        </header>

        {/* Indicador de pasos */}
        {!isEditing && !isClient && (
          <div className="pet-form__steps">
            {[
              { number: 1, label: "Cliente" },
              { number: 2, label: "Datos de la mascota" },
              { number: 3, label: "Confirmación" },
            ].map((item) => (
              <div
                key={item.number}
                className={`pet-form__step ${
                  step >= item.number ? "pet-form__step--active" : ""
                }`}
              >
                <span className="pet-form__step-number">
                  {step > item.number ? <Check size={15} /> : item.number}
                </span>

                <span>{item.label}</span>
              </div>
            ))}
          </div>
        )}

        <div className="pet-form__content">
          {/* PASO 1: CLIENTE */}
          {step === 1 && !isClient && (
            <section className="pet-form__step-content">
              <h2>1. Buscar y asociar cliente</h2>

              <p>Seleccioná el cliente responsable de la mascota.</p>

              <label className="pet-form__search">
                <Search size={17} />

                <input
                  type="search"
                  value={clientSearch}
                  onChange={(event) => setClientSearch(event.target.value)}
                  placeholder="Buscar por nombre, apellido, documento o email..."
                />
              </label>

              <div className="pet-form__client-list">
                {filteredClients.map((client) => {
                  const isSelected =
                    selectedClient?.id_cliente === client.id_cliente;

                  return (
                    <button
                      type="button"
                      key={client.id_cliente}
                      className={`pet-form__client-option ${
                        isSelected ? "pet-form__client-option--selected" : ""
                      }`}
                      onClick={() => handleSelectClient(client)}
                    >
                      <div className="pet-form__client-avatar">
                        <UserRound size={20} />
                      </div>

                      <div className="pet-form__client-info">
                        <strong>
                          {client.nombre} {client.apellido}
                        </strong>

                        <span>DNI: {client.numero_documento}</span>

                    {client.email && <span>{client.email}</span>}
                      </div>

                      <span className="pet-form__radio">
                        {isSelected && <Check size={13} />}
                      </span>
                    </button>
                  );
                })}

                {filteredClients.length === 0 && (
                  <p className="pet-form__empty">No se encontraron clientes.</p>
                )}
              </div>

              {clientError && (
                <small className="pet-form__error">{clientError}</small>
              )}

              {selectedClient && (
                <div className="pet-form__selected-client">
                  <Check size={16} />
                  Cliente seleccionado:{" "}
                  <strong>
                    {selectedClient.nombre} {selectedClient.apellido}
                  </strong>
                </div>
              )}
            </section>
          )}

          {/* PASO 2: MASCOTA */}
          {step === 2 && (
            <section className="pet-form__step-content">
              <h2>{isClient ? "1." : "2."} Datos de la mascota</h2>

              <p>Completá la información de la mascota.</p>

              {selectedClient && (
                <div className="pet-form__client-summary">
                  <div className="pet-form__client-avatar">
                    <UserRound size={20} />
                  </div>

                  <div>
                    <strong>
                      {selectedClient.nombre} {selectedClient.apellido}
                    </strong>

                    <span>DNI: {selectedClient.numero_documento}</span>
                  </div>

                  {!isEditing && (
                    <button type="button" onClick={() => setStep(1)}>
                      Cambiar
                    </button>
                  )}
                </div>
              )}

              <div className="pet-form__grid">
                <label className="pet-form__field">
                  <span>Nombre *</span>

                  <input
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    placeholder="Ej. Luna"
                    disabled={isEditing && isClient}
                  />

                  {errors.nombre && (
                    <small className="pet-form__error">{errors.nombre}</small>
                  )}
                </label>

                <label className="pet-form__field">
                  <span>Especie *</span>

                  <select
                    name="especie"
                    value={formData.especie}
                    onChange={handleChange}
                    disabled={isEditing && isClient}
                  >
                    <option value="">Seleccionar especie</option>
                    <option value="Canina">Canina</option>
                    <option value="Felina">Felina</option>
                    <option value="Otra">Otra</option>
                  </select>

                  {errors.especie && (
                    <small className="pet-form__error">{errors.especie}</small>
                  )}
                </label>

                <label className="pet-form__field">
                  <span>Raza</span>

                  <input
                    name="raza"
                    value={formData.raza}
                    onChange={handleChange}
                    placeholder="Ej. Golden Retriever"
                  />
                </label>

                <label className="pet-form__field">
                  <span>Fecha de nacimiento</span>

                  <input
                    type="date"
                    name="fecha_nacimiento"
                    value={formData.fecha_nacimiento}
                    max={new Date().toLocaleDateString("en-CA")}
                    onChange={handleChange}
                    disabled={isEditing && isClient}
                  />

                  {errors.fecha_nacimiento && (
                    <small className="pet-form__error">
                      {errors.fecha_nacimiento}
                    </small>
                  )}
                </label>

                <label className="pet-form__field">
                  <span>Sexo *</span>

                  <select
                    name="sexo"
                    value={formData.sexo}
                    onChange={handleChange}
                  >
                    <option value="">Seleccionar sexo</option>
                    <option value="Macho">Macho</option>
                    <option value="Hembra">Hembra</option>
                  </select>

                  {errors.sexo && (
                    <small className="pet-form__error">{errors.sexo}</small>
                  )}
                </label>

                <label className="pet-form__field pet-form__field--full">
                  <span>Observaciones</span>

                  <textarea
                    name="observaciones"
                    value={formData.observaciones}
                    onChange={handleChange}
                    placeholder="Información adicional..."
                    rows={4}
                  />
                </label>
              </div>
            </section>
          )}

          {/* PASO 3: CONFIRMACIÓN */}
          {step === 3 && (
            <section className="pet-form__step-content">
              <h2>{isClient ? "2." : "3."} Confirmación</h2>
              <p>{isEditing ? "Revisá los cambios antes de guardarlos." : "Revisá los datos antes de registrar la mascota."}</p>

              {selectedClient && (
                <div className="pet-form__review-card">
                  <div className="pet-form__review-heading">
                    <h3>Cliente asociado</h3>

                    <button type="button" onClick={() => setStep(1)}>
                      Editar
                    </button>
                  </div>

                  <div className="pet-form__review-content">
                    <div className="pet-form__client-avatar">
                      <UserRound size={22} />
                    </div>

                    <div>
                      <strong>
                        {selectedClient.nombre} {selectedClient.apellido}
                      </strong>
                      <span>DNI: {selectedClient.numero_documento}</span>
                      {selectedClient.email && <span>{selectedClient.email}</span>}
                    </div>
                  </div>
                </div>
              )}

              <div className="pet-form__review-card">
                <div className="pet-form__review-heading">
                  <h3>Datos de la mascota</h3>

                  <button type="button" onClick={() => setStep(2)}>
                    Editar
                  </button>
                </div>

                <dl className="pet-form__review-data">
                  <div>
                    <dt>Nombre</dt>
                    <dd>{formData.nombre}</dd>
                  </div>

                  <div>
                    <dt>Especie</dt>
                    <dd>{formData.especie}</dd>
                  </div>

                  <div>
                    <dt>Raza</dt>
                    <dd>{formData.raza || "Sin especificar"}</dd>
                  </div>

                  <div>
                    <dt>Fecha de nacimiento</dt>
                    <dd>{formData.fecha_nacimiento || "Sin especificar"}</dd>
                  </div>

                  <div>
                    <dt>Sexo</dt>
                    <dd>{formData.sexo}</dd>
                  </div>

                  <div>
                    <dt>Observaciones</dt>
                    <dd>{formData.observaciones || "Sin observaciones"}</dd>
                  </div>
                </dl>
              </div>
            </section>
          )}

          {formError && <p role="alert" className="pet-form__error">{formError}</p>}

          {/* ACCIONES */}
          <footer className="pet-form__actions">
            {step > 1 && !isClient && (
              <button
                type="button"
                className="pet-form__cancel"
                onClick={() => setStep(step - 1)}
                disabled={isEditing || isClient}
              >
                <ArrowLeft size={16} />
                Volver
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                className="pet-form__submit"
                onClick={handleNext}
              >
                Siguiente
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                className="pet-form__submit"
                onClick={() => void handleSubmit()}
                disabled={submitting}
              >
                <Check size={16} />
                {submitting ? "Guardando…" : isEditing ? "Guardar cambios" : "Confirmar registro"}
              </button>
            )}
          </footer>
        </div>
      </div>
    </section>
  );
}

export default CreateEditPetPage;
