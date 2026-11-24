import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
    ArrowLeft,
    Plus,
    Save,
    Stethoscope,
    Syringe,
    Trash2,
} from "lucide-react";

import type {
    AtencionClinicaItem,
    CrearVacunaPayload,
    TipoAtencion,
} from "../../../types/clinical";
import type { PetItem } from "../../../types/pet";
import { getPets } from "../../pets/services/petService";
import {
    actualizarAtencionClinica,
    crearAtencionClinica,
    getAtencionPorId,
    getTiposAtencion,
} from "../services/clinicalService";
import "../styles/CreateEditAttentionPage.scss";

const getTodayDateString = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const normalizeDateInput = (date: string | null): string => {
    if (!date) return "";
    return date.slice(0, 10);
};

const createEmptyVaccine = (): CrearVacunaPayload => ({
    nombre_vacuna: "",
    laboratorio: "",
    dosis: "",
    lote: "",
    fecha_aplicacion: getTodayDateString(),
    proxima_aplicacion: "",
});

function CreateEditAttentionPage() {
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const isEditMode = Boolean(id);
    const preselectedPetId = searchParams.get("mascota") ?? "";

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const [pets, setPets] = useState<PetItem[]>([]);
    const [tiposAtencion, setTiposAtencion] = useState<TipoAtencion[]>([]);
    const [existingAttention, setExistingAttention] =
        useState<AtencionClinicaItem | null>(null);

    // Campos del formulario
    const [idMascota, setIdMascota] = useState(preselectedPetId);
    const [idTipoAtencion, setIdTipoAtencion] = useState("");
    const [idTurno, setIdTurno] = useState("");
    const [diagnostico, setDiagnostico] = useState("");
    const [tratamiento, setTratamiento] = useState("");
    const [observaciones, setObservaciones] = useState("");
    const [proximoControl, setProximoControl] = useState("");
    const [vacunas, setVacunas] = useState<CrearVacunaPayload[]>([
        createEmptyVaccine(),
    ]);

    useEffect(() => {
        let active = true;
        setLoading(true);
        setError("");

        const loadInitialData = async () => {
            try {
                if (isEditMode && id) {
                    const attention = await getAtencionPorId(id);
                    if (!active) return;

                    setExistingAttention(attention);
                    setIdMascota(String(attention.id_mascota));
                    setDiagnostico(attention.diagnostico ?? "");
                    setTratamiento(attention.tratamiento ?? "");
                    setObservaciones(attention.observaciones ?? "");
                    setProximoControl(normalizeDateInput(attention.proximo_control));

                    if (attention.vacunas && attention.vacunas.length > 0) {
                        setVacunas(
                            attention.vacunas.map((v) => ({
                                nombre_vacuna: v.nombre_vacuna,
                                laboratorio: v.laboratorio,
                                dosis: v.dosis ?? "",
                                lote: v.lote ?? "",
                                fecha_aplicacion: normalizeDateInput(v.fecha_aplicacion),
                                proxima_aplicacion: normalizeDateInput(v.proxima_aplicacion),
                            }))
                        );
                    } else {
                        setVacunas([createEmptyVaccine()]);
                    }
                } else {
                    const [petsData, tiposData] = await Promise.all([
                        getPets(),
                        getTiposAtencion(),
                    ]);
                    if (!active) return;

                    const activePets = petsData.filter((pet) => Boolean(pet.activo));
                    setPets(activePets);
                    setTiposAtencion(tiposData);

                    if (tiposData.length > 0) {
                        setIdTipoAtencion(String(tiposData[0].id_tipo_atencion));
                    }
                }
            } catch (reason) {
                if (active) {
                    setError(
                        reason instanceof Error
                            ? reason.message
                            : "No se pudieron cargar los datos del formulario"
                    );
                }
            } finally {
                if (active) setLoading(false);
            }
        };

        void loadInitialData();

        return () => {
            active = false;
        };
    }, [id, isEditMode]);

    const selectedTipo = tiposAtencion.find(
        (tipo) => String(tipo.id_tipo_atencion) === idTipoAtencion
    );

    const isVacunaType = isEditMode
        ? existingAttention?.tipo_atencion_nombre.trim().toLowerCase() === "vacuna"
        : selectedTipo?.nombre.trim().toLowerCase() === "vacuna";

    const handleVaccineChange = (
        index: number,
        field: keyof CrearVacunaPayload,
        value: string
    ) => {
        setVacunas((prev) =>
            prev.map((item, idx) =>
                idx === index ? { ...item, [field]: value } : item
            )
        );
    };

    const handleAddVaccine = () => {
        setVacunas((prev) => [...prev, createEmptyVaccine()]);
    };

    const handleRemoveVaccine = (index: number) => {
        setVacunas((prev) => prev.filter((_, idx) => idx !== index));
    };

    const handleBack = () => {
        if (idMascota) {
            navigate(`/mascotas/${idMascota}`);
            return;
        }
        navigate("/mascotas");
    };

    const formatVaccinesPayload = (): CrearVacunaPayload[] =>
        vacunas.map((v) => ({
            nombre_vacuna: v.nombre_vacuna.trim(),
            laboratorio: v.laboratorio.trim(),
            dosis: v.dosis?.trim() || null,
            lote: v.lote?.trim() || null,
            fecha_aplicacion: v.fecha_aplicacion,
            proxima_aplicacion: v.proxima_aplicacion || null,
        }));

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");
        setSubmitting(true);

        try {
            if (isEditMode && id) {
                await actualizarAtencionClinica(id, {
                    diagnostico: diagnostico.trim() || null,
                    tratamiento: tratamiento.trim() || null,
                    observaciones: observaciones.trim() || null,
                    proximo_control: isVacunaType ? null : proximoControl || null,
                    ...(isVacunaType ? { vacunas: formatVaccinesPayload() } : {}),
                });

                navigate(
                    existingAttention
                        ? `/mascotas/${existingAttention.id_mascota}`
                        : "/mascotas"
                );
                return;
            }

            if (!idMascota) {
                setError("Debe seleccionar una mascota activa.");
                setSubmitting(false);
                return;
            }

            if (!idTipoAtencion) {
                setError("Debe seleccionar un tipo de atención.");
                setSubmitting(false);
                return;
            }

            const payload = {
                id_mascota: Number(idMascota),
                id_tipo_atencion: Number(idTipoAtencion),
                id_turno: idTurno.trim() ? Number(idTurno.trim()) : null,
                diagnostico: diagnostico.trim() || null,
                tratamiento: tratamiento.trim() || null,
                observaciones: observaciones.trim() || null,
                proximo_control: isVacunaType ? null : proximoControl || null,
                ...(isVacunaType ? { vacunas: formatVaccinesPayload() } : {}),
            };

            await crearAtencionClinica(payload);
            navigate(`/mascotas/${idMascota}`);
        } catch (reason) {
            setError(
                reason instanceof Error
                    ? reason.message
                    : "No se pudo guardar la atención clínica"
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <section className="attention-form-page">
                <p role="status" className="attention-form-page__loading">
                    Cargando formulario de atención clínica...
                </p>
            </section>
        );
    }

    return (
        <section className="attention-form-page">
            <button
                type="button"
                className="attention-form-page__back"
                onClick={handleBack}
            >
                <ArrowLeft size={17} />
                Volver
            </button>

            <header className="attention-form-page__header">
                <div className="attention-form-page__icon">
                    <Stethoscope size={26} />
                </div>
                <div>
                    <span className="attention-form-page__eyebrow">Módulo Clínico</span>
                    <h1>
                        {isEditMode
                            ? "Editar atención clínica"
                            : "Registrar nueva atención clínica"}
                    </h1>
                    <p>
                        {isEditMode
                            ? "Las modificaciones quedarán registradas con auditoría de usuario y fecha."
                            : "Complete los datos médicos de la consulta para incorporarlos a la libreta sanitaria."}
                    </p>
                </div>
            </header>

            {error && (
                <div role="alert" className="attention-form-page__error">
                    {error}
                </div>
            )}

            <form className="attention-form-page__form" onSubmit={handleSubmit}>
                {isEditMode && existingAttention ? (
                    <div className="attention-form-page__summary">
                        <div>
                            <span>Mascota</span>
                            <strong>
                                {existingAttention.mascota_nombre} (
                                {existingAttention.mascota_especie})
                            </strong>
                        </div>
                        <div>
                            <span>Tipo de atención</span>
                            <strong>{existingAttention.tipo_atencion_nombre}</strong>
                        </div>
                        <div>
                            <span>Profesional original</span>
                            <strong>
                                {existingAttention.veterinario_nombre}{" "}
                                {existingAttention.veterinario_apellido}
                            </strong>
                        </div>
                    </div>
                ) : (
                    <div className="attention-form-page__grid">
                        <div className="attention-form-page__field">
                            <label htmlFor="id_mascota">Mascota *</label>
                            <select
                                id="id_mascota"
                                value={idMascota}
                                onChange={(e) => setIdMascota(e.target.value)}
                                required
                            >
                                <option value="">Seleccione una mascota activa</option>
                                {pets.map((pet) => (
                                    <option key={pet.id_mascota} value={pet.id_mascota}>
                                        {pet.nombre} ({pet.especie}) — {pet.cliente.nombre}{" "}
                                        {pet.cliente.apellido}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="attention-form-page__field">
                            <label htmlFor="id_tipo_atencion">Tipo de atención *</label>
                            <select
                                id="id_tipo_atencion"
                                value={idTipoAtencion}
                                onChange={(e) => setIdTipoAtencion(e.target.value)}
                                required
                            >
                                {tiposAtencion.map((tipo) => (
                                    <option
                                        key={tipo.id_tipo_atencion}
                                        value={tipo.id_tipo_atencion}
                                    >
                                        {tipo.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="attention-form-page__field">
                            <label htmlFor="id_turno">ID de turno asociado (opcional)</label>
                            <input
                                id="id_turno"
                                type="number"
                                min={1}
                                value={idTurno}
                                onChange={(e) => setIdTurno(e.target.value)}
                                placeholder="Ej. 12"
                            />
                            <small>
                                Si indica un turno APROBADO, pasará automáticamente a COMPLETADO.
                            </small>
                        </div>
                    </div>
                )}

                <div className="attention-form-page__grid">
                    <div className="attention-form-page__field attention-form-page__field--full">
                        <label htmlFor="diagnostico">Diagnóstico</label>
                        <textarea
                            id="diagnostico"
                            value={diagnostico}
                            onChange={(e) => setDiagnostico(e.target.value)}
                            placeholder="Describa el diagnóstico clínico observado..."
                        />
                    </div>

                    <div className="attention-form-page__field attention-form-page__field--full">
                        <label htmlFor="tratamiento">Tratamiento indicado</label>
                        <textarea
                            id="tratamiento"
                            value={tratamiento}
                            onChange={(e) => setTratamiento(e.target.value)}
                            placeholder="Detalle medicación, dosis o indicaciones terapéuticas..."
                        />
                    </div>

                    <div className="attention-form-page__field attention-form-page__field--full">
                        <label htmlFor="observaciones">Observaciones clínicas</label>
                        <textarea
                            id="observaciones"
                            value={observaciones}
                            onChange={(e) => setObservaciones(e.target.value)}
                            placeholder="Notas adicionales relevantes para el seguimiento..."
                        />
                    </div>

                    {!isVacunaType && (
                        <div className="attention-form-page__field">
                            <label htmlFor="proximo_control">Fecha de próximo control</label>
                            <input
                                id="proximo_control"
                                type="date"
                                value={proximoControl}
                                onChange={(e) => setProximoControl(e.target.value)}
                            />
                        </div>
                    )}
                </div>

                {isVacunaType && (
                    <section className="attention-form-page__vaccines">
                        <div className="attention-form-page__vaccines-header">
                            <h2>
                                <Syringe size={18} />
                                Vacunas aplicadas (obligatorio)
                            </h2>

                            <button
                                type="button"
                                className="attention-form-page__add-vaccine"
                                onClick={handleAddVaccine}
                            >
                                <Plus size={15} />
                                Agregar otra vacuna
                            </button>
                        </div>

                        {vacunas.map((vacuna, index) => (
                            <div key={index} className="attention-form-page__vaccine-card">
                                <div className="attention-form-page__vaccine-card-top">
                                    <h3>Vacuna #{index + 1}</h3>
                                    {vacunas.length > 1 && (
                                        <button
                                            type="button"
                                            className="attention-form-page__remove-vaccine"
                                            onClick={() => handleRemoveVaccine(index)}
                                        >
                                            <Trash2 size={14} />
                                            Quitar
                                        </button>
                                    )}
                                </div>

                                <div className="attention-form-page__grid">
                                    <div className="attention-form-page__field">
                                        <label htmlFor={`vacuna-nombre-${index}`}>
                                            Nombre de la vacuna *
                                        </label>
                                        <input
                                            id={`vacuna-nombre-${index}`}
                                            type="text"
                                            maxLength={120}
                                            required
                                            value={vacuna.nombre_vacuna}
                                            onChange={(e) =>
                                                handleVaccineChange(
                                                    index,
                                                    "nombre_vacuna",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Ej. Antirrábica"
                                        />
                                    </div>

                                    <div className="attention-form-page__field">
                                        <label htmlFor={`vacuna-lab-${index}`}>Laboratorio *</label>
                                        <input
                                            id={`vacuna-lab-${index}`}
                                            type="text"
                                            maxLength={120}
                                            required
                                            value={vacuna.laboratorio}
                                            onChange={(e) =>
                                                handleVaccineChange(
                                                    index,
                                                    "laboratorio",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Ej. Zoetis"
                                        />
                                    </div>

                                    <div className="attention-form-page__field">
                                        <label htmlFor={`vacuna-dosis-${index}`}>Dosis</label>
                                        <input
                                            id={`vacuna-dosis-${index}`}
                                            type="text"
                                            maxLength={80}
                                            value={vacuna.dosis ?? ""}
                                            onChange={(e) =>
                                                handleVaccineChange(index, "dosis", e.target.value)
                                            }
                                            placeholder="Ej. 1 ml"
                                        />
                                    </div>

                                    <div className="attention-form-page__field">
                                        <label htmlFor={`vacuna-lote-${index}`}>Lote</label>
                                        <input
                                            id={`vacuna-lote-${index}`}
                                            type="text"
                                            maxLength={80}
                                            value={vacuna.lote ?? ""}
                                            onChange={(e) =>
                                                handleVaccineChange(index, "lote", e.target.value)
                                            }
                                            placeholder="Ej. LOTE-2026-A1"
                                        />
                                    </div>

                                    <div className="attention-form-page__field">
                                        <label htmlFor={`vacuna-fecha-${index}`}>
                                            Fecha de aplicación *
                                        </label>
                                        <input
                                            id={`vacuna-fecha-${index}`}
                                            type="date"
                                            required
                                            value={vacuna.fecha_aplicacion}
                                            onChange={(e) =>
                                                handleVaccineChange(
                                                    index,
                                                    "fecha_aplicacion",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>

                                    <div className="attention-form-page__field">
                                        <label htmlFor={`vacuna-proxima-${index}`}>
                                            Próxima aplicación (refuerzo)
                                        </label>
                                        <input
                                            id={`vacuna-proxima-${index}`}
                                            type="date"
                                            value={vacuna.proxima_aplicacion ?? ""}
                                            onChange={(e) =>
                                                handleVaccineChange(
                                                    index,
                                                    "proxima_aplicacion",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </section>
                )}

                <div className="attention-form-page__actions">
                    <button
                        type="button"
                        className="attention-form-page__cancel"
                        onClick={handleBack}
                    >
                        Cancelar
                    </button>

                    <button
                        type="submit"
                        className="attention-form-page__submit"
                        disabled={submitting}
                    >
                        <Save size={16} />
                        {submitting
                            ? "Guardando..."
                            : isEditMode
                                ? "Guardar cambios"
                                : "Registrar atención"}
                    </button>
                </div>
            </form>
        </section>
    );
}

export default CreateEditAttentionPage;