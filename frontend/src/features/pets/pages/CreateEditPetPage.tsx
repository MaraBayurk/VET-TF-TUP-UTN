import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  PawPrint,
  Search,
  UserRound,
} from "lucide-react";

import type { PetItem } from "../types/pet";
import "../styles/CreateEditPetPage.scss";

interface Client {
  id_cliente: number;
  id_usuario: number;
  nombre: string;
  apellido: string;
  numero_documento: string;
  email: string;
  telefono: string;
}

interface PetFormData {
  nombre: string;
  especie: string;
  raza: string;
  fecha_nacimiento: string;
  sexo: string;
  observaciones: string;
}

const mockClients: Client[] = [
  {
    id_cliente: 1,
    id_usuario: 1,
    nombre: "María",
    apellido: "González",
    numero_documento: "12.345.678",
    email: "maria.gonzalez@email.com",
    telefono: "381 123 4567",
  },
  {
    id_cliente: 2,
    id_usuario: 2,
    nombre: "Pedro",
    apellido: "Ramírez",
    numero_documento: "23.456.789",
    email: "pedro.ramirez@email.com",
    telefono: "381 234 5678",
  },
  {
    id_cliente: 3,
    id_usuario: 3,
    nombre: "Lucía",
    apellido: "Fernández",
    numero_documento: "34.567.890",
    email: "lucia.fernandez@email.com",
    telefono: "381 345 6789",
  },
  {
    id_cliente: 4,
    id_usuario: 4,
    nombre: "Sofía",
    apellido: "Vera",
    numero_documento: "11.222.333",
    email: "sofia.vera@email.com",
    telefono: "381 456 7890",
  },
  {
    id_cliente: 5,
    id_usuario: 5,
    nombre: "Carlos",
    apellido: "Méndez",
    numero_documento: "55.667.788",
    email: "carlos.mendez@email.com",
    telefono: "381 567 8901",
  },
];

const mockPets: PetItem[] = [
  {
    id_mascota: 1,
    id_cliente: 1,
    nombre: "Luna",
    especie: "Canina",
    raza: "Golden Retriever",
    fecha_nacimiento: "2021-03-12",
    sexo: "Hembra",
    observaciones: "Control periódico",
    activo: true,
    cliente: {
      id_usuario: 1,
      nombre: "María",
      apellido: "González",
      numero_documento: "12.345.678",
    },
  },
];

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

  const [step, setStep] = useState(isEditing ? 2 : 1);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientSearch, setClientSearch] = useState("");
  const [formData, setFormData] = useState<PetFormData>(emptyForm);
  const [errors, setErrors] = useState<Partial<PetFormData>>({});
  const [clientError, setClientError] = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;

    const pet = mockPets.find((item) => item.id_mascota === Number(id));

    if (!pet) {
      setNotFound(true);
      return;
    }

    const client = mockClients.find(
      (item) => item.id_cliente === pet.id_cliente,
    );

    if (!client) {
      setNotFound(true);
      return;
    }

    setSelectedClient(client);

    setFormData({
      nombre: pet.nombre,
      especie: pet.especie,
      raza: pet.raza ?? "",
      fecha_nacimiento: pet.fecha_nacimiento ?? "",
      sexo: pet.sexo,
      observaciones: pet.observaciones ?? "",
    });

    setStep(2);
  }, [id]);

  const filteredClients = mockClients.filter((client) => {
    const search = clientSearch.toLowerCase().trim();

    const fullName = `${client.nombre} ${client.apellido}`.toLowerCase();

    return (
      fullName.includes(search) ||
      client.numero_documento.includes(search) ||
      client.email.toLowerCase().includes(search)
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
    const newErrors: Partial<PetFormData> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = "Ingresá el nombre de la mascota.";
    }

    if (!formData.especie) {
      newErrors.especie = "Seleccioná una especie.";
    }

    if (!formData.sexo) {
      newErrors.sexo = "Seleccioná el sexo.";
    }

    if (formData.fecha_nacimiento) {
      const birthDate = new Date(`${formData.fecha_nacimiento}T00:00:00`);

      const today = new Date();
      today.setHours(23, 59, 59, 999);

      if (birthDate > today) {
        newErrors.fecha_nacimiento =
          "La fecha de nacimiento no puede ser futura.";
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };
  const handleNext = () => {
    console.log("➡️ SE EJECUTÓ handleNext. Paso actual:", step);

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
        console.log("➡️ Cambiando al paso 3");
        setStep(3);
      }
    }
  };
  const handleSubmit = () => {
    if (step !== 3 || !selectedClient) {
      return;
    }

    const petData = {
      ...formData,
      id_cliente: selectedClient.id_cliente,
      cliente: {
        id_usuario: selectedClient.id_usuario,
        nombre: selectedClient.nombre,
        apellido: selectedClient.apellido,
        numero_documento: selectedClient.numero_documento,
      },
    };

    console.log("Mascota creada (mock):", petData);

    window.alert("La mascota se registró correctamente (simulación).");

    navigate("/mascotas");
  };

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
            <h1>{isEditing ? "Editar mascota" : "Nueva mascota"}</h1>
            <p>
              {isEditing
                ? "Actualizá los datos de la mascota."
                : "Completá los pasos para registrar una mascota."}
            </p>
          </div>
        </header>

        {/* Indicador de pasos */}
        {!isEditing && (
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
          {step === 1 && (
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

                        <span>{client.email}</span>
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
              <h2>2. Datos de la mascota</h2>

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
              <h2>3. Confirmación</h2>
              <p>Revisá los datos antes de registrar la mascota.</p>

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
                      <span>{selectedClient.email}</span>
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

          {/* ACCIONES */}
          <footer className="pet-form__actions">
            {step > 1 && (
              <button
                type="button"
                className="pet-form__cancel"
                onClick={() => setStep(step - 1)}
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
                onClick={handleSubmit}
              >
                <Check size={16} />
                Confirmar registro
              </button>
            )}
          </footer>
        </div>
      </div>
    </section>
  );
}

export default CreateEditPetPage;
