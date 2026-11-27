import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    CalendarDays,
    ChevronDown,
    ChevronUp,
    History,
    Pencil,
    Plus,
    Syringe,
    Trash2,
} from "lucide-react";

import type { AtencionClinicaItem } from "../../../types/clinical";
import { getAuthUser } from "../../auth/services/authStorage";
import {
    darDeBajaAtencionClinica,
    getHistorialPorMascota,
} from "../services/clinicalService";
import "../styles/ClinicalHistorySection.scss";

interface ClinicalHistorySectionProps {
    idMascota: number;
    mascotaActiva: boolean;
}

const formatDateOnly = (date: string | null): string => {
    if (!date) return "No especificado";
    return new Date(`${date}T00:00:00`).toLocaleDateString("es-AR");
};

const formatDateTime = (dateTime: string | null): string => {
    if (!dateTime) return "No especificada";
    const normalized = dateTime.includes("T")
        ? dateTime
        : dateTime.replace(" ", "T");
    const parsed = new Date(normalized);
    if (Number.isNaN(parsed.getTime())) return dateTime;
    return parsed.toLocaleString("es-AR", {
        dateStyle: "short",
        timeStyle: "short",
    });
};

const formatChangeValue = (value: string | null): string => {
    if (!value || value.trim() === "") return "Vacío";
    return value;
};

function ClinicalHistorySection({
    idMascota,
    mascotaActiva,
}: ClinicalHistorySectionProps) {
    const navigate = useNavigate();
    const role = getAuthUser()?.rol?.trim().toLocaleLowerCase("es") ?? "";
    const isVet = role === "veterinario";
    const isAdmin = role === "administrador";

    const [history, setHistory] = useState<AtencionClinicaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionError, setActionError] = useState("");
    const [expandedAuditIds, setExpandedAuditIds] = useState<
        Record<number, boolean>
    >({});

    const toggleAuditHistory = (idAtencion: number) => {
        setExpandedAuditIds((prev) => ({
            ...prev,
            [idAtencion]: !prev[idAtencion],
        }));
    };

    const loadHistory = async () => {
        setLoading(true);
        setError("");
        try {
            const data = await getHistorialPorMascota(idMascota);
            setHistory(data);
        } catch (reason) {
            setError(
                reason instanceof Error
                    ? reason.message
                    : "No se pudo cargar el historial clínico"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let active = true;
        setLoading(true);
        setError("");

        getHistorialPorMascota(idMascota)
            .then((data) => {
                if (active) setHistory(data);
            })
            .catch((reason) => {
                if (active) {
                    setError(
                        reason instanceof Error
                            ? reason.message
                            : "No se pudo cargar el historial clínico"
                    );
                }
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, [idMascota]);

    const handleDeactivate = async (idAtencion: number) => {
        const confirmed = window.confirm(
            "¿Confirma que desea dar de baja lógicamente esta atención clínica? El registro dejará de visualizarse en la libreta sanitaria."
        );
        if (!confirmed) return;

        setActionError("");
        try {
            await darDeBajaAtencionClinica(idAtencion);
            await loadHistory();
        } catch (reason) {
            setActionError(
                reason instanceof Error
                    ? reason.message
                    : "No se pudo dar de baja la atención clínica"
            );
        }
    };

    return (
        <article className="pet-detail__card pet-detail__history clinical-history">
            <div className="clinical-history__header">
                <div className="clinical-history__title">
                    <CalendarDays size={19} />
                    <h2>Libreta sanitaria e historial clínico</h2>
                </div>

                {isVet && mascotaActiva && (
                    <button
                        type="button"
                        className="clinical-history__new-button"
                        onClick={() => navigate(`/atenciones/nueva?mascota=${idMascota}`)}
                    >
                        <Plus size={16} />
                        Registrar atención
                    </button>
                )}
            </div>

            {error && (
                <div role="alert" className="clinical-history__error">
                    <span>{error}</span>
                    <button type="button" onClick={() => void loadHistory()}>
                        Reintentar
                    </button>
                </div>
            )}

            {actionError && (
                <div role="alert" className="clinical-history__error">
                    <span>{actionError}</span>
                </div>
            )}

            {loading ? (
                <p role="status" className="clinical-history__status">
                    Cargando historial clínico...
                </p>
            ) : history.length === 0 ? (
                <div className="clinical-history__empty">
                    No existen atenciones clínicas registradas para esta mascota.
                </div>
            ) : (
                <div className="clinical-history__list">
                    {history.map((atencion) => {
                        const modificaciones = atencion.historial_modificaciones ?? [];
                        const isAuditOpen = Boolean(expandedAuditIds[atencion.id_atencion]);

                        return (
                            <div
                                key={atencion.id_atencion}
                                className="clinical-history__item"
                            >
                                <div className="clinical-history__item-top">
                                    <div className="clinical-history__meta">
                                        <div className="clinical-history__badges">
                                            <span className="clinical-history__type-badge">
                                                {atencion.tipo_atencion_nombre}
                                            </span>

                                            {atencion.fecha_ultima_modificacion && (
                                                <span className="clinical-history__edited-badge">
                                                    {modificaciones.length > 1
                                                        ? `Editado (${modificaciones.length})`
                                                        : "Editado"}
                                                </span>
                                            )}
                                        </div>

                                        <span>
                                            <strong>Fecha:</strong>{" "}
                                            {formatDateTime(atencion.fecha_atencion)}
                                        </span>
                                        <span>
                                            <strong>Profesional:</strong> {atencion.veterinario_nombre}{" "}
                                            {atencion.veterinario_apellido} (Mat.{" "}
                                            {atencion.veterinario_matricula})
                                        </span>
                                    </div>

                                    {(isVet || isAdmin) && (
                                        <div className="clinical-history__actions">
                                            {isVet && (
                                                <button
                                                    type="button"
                                                    className="clinical-history__action-btn"
                                                    onClick={() =>
                                                        navigate(
                                                            `/atenciones/${atencion.id_atencion}/editar`
                                                        )
                                                    }
                                                >
                                                    <Pencil size={14} />
                                                    Editar
                                                </button>
                                            )}

                                            {isAdmin && (
                                                <button
                                                    type="button"
                                                    className="clinical-history__action-btn clinical-history__action-btn--danger"
                                                    onClick={() =>
                                                        void handleDeactivate(atencion.id_atencion)
                                                    }
                                                >
                                                    <Trash2 size={14} />
                                                    Dar de baja
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="clinical-history__fields">
                                    <div className="clinical-history__field">
                                        <span>Diagnóstico</span>
                                        <p>{atencion.diagnostico || "Sin diagnóstico registrado."}</p>
                                    </div>

                                    <div className="clinical-history__field">
                                        <span>Tratamiento</span>
                                        <p>{atencion.tratamiento || "Sin tratamiento indicado."}</p>
                                    </div>

                                    <div className="clinical-history__field">
                                        <span>Observaciones</span>
                                        <p>{atencion.observaciones || "Sin observaciones."}</p>
                                    </div>

                                    <div className="clinical-history__field">
                                        <span>Próximo control</span>
                                        <p>{formatDateOnly(atencion.proximo_control)}</p>
                                    </div>
                                </div>

                                {atencion.vacunas.length > 0 && (
                                    <div className="clinical-history__vaccines">
                                        <div className="clinical-history__vaccines-title">
                                            <Syringe size={16} />
                                            <span>Vacunas aplicadas</span>
                                        </div>

                                        <div className="clinical-history__vaccines-list">
                                            {atencion.vacunas.map((vacuna) => (
                                                <div
                                                    key={vacuna.id_vacuna_aplicada}
                                                    className="clinical-history__vaccine-card"
                                                >
                                                    <strong>{vacuna.nombre_vacuna}</strong>
                                                    <span>Laboratorio: {vacuna.laboratorio}</span>
                                                    <span>
                                                        Dosis: {vacuna.dosis || "No especificada"}
                                                    </span>
                                                    <span>Lote: {vacuna.lote || "No especificado"}</span>
                                                    <span>
                                                        Aplicación:{" "}
                                                        {formatDateOnly(vacuna.fecha_aplicacion)}
                                                    </span>
                                                    <span>
                                                        Próximo refuerzo:{" "}
                                                        {formatDateOnly(vacuna.proxima_aplicacion)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {(atencion.fecha_ultima_modificacion ||
                                    modificaciones.length > 0) && (
                                        <div className="clinical-history__audit-box">
                                            <div className="clinical-history__audit-summary">
                                                <p className="clinical-history__audit">
                                                    Última modificación:{" "}
                                                    {formatDateTime(atencion.fecha_ultima_modificacion)}
                                                    {atencion.modificador_nombre
                                                        ? ` por ${atencion.modificador_nombre} ${atencion.modificador_apellido ?? ""}`
                                                        : ""}
                                                </p>

                                                {modificaciones.length > 0 && (
                                                    <button
                                                        type="button"
                                                        className="clinical-history__audit-toggle"
                                                        onClick={() =>
                                                            toggleAuditHistory(atencion.id_atencion)
                                                        }
                                                        aria-expanded={isAuditOpen}
                                                    >
                                                        <History size={14} />
                                                        <span>
                                                            {isAuditOpen
                                                                ? "Ocultar historial"
                                                                : `Ver historial (${modificaciones.length})`}
                                                        </span>
                                                        {isAuditOpen ? (
                                                            <ChevronUp size={14} />
                                                        ) : (
                                                            <ChevronDown size={14} />
                                                        )}
                                                    </button>
                                                )}
                                            </div>

                                            {isAuditOpen && modificaciones.length > 0 && (
                                                <div className="clinical-history__audit-timeline">
                                                    {modificaciones.map((mod) => (
                                                        <div
                                                            key={mod.id_historial}
                                                            className="clinical-history__audit-entry"
                                                        >
                                                            <div className="clinical-history__audit-entry-header">
                                                                <strong>
                                                                    {mod.modificador_nombre}{" "}
                                                                    {mod.modificador_apellido}
                                                                </strong>
                                                                <span>
                                                                    {formatDateTime(mod.fecha_modificacion)}
                                                                </span>
                                                            </div>

                                                            {mod.detalle_cambios.length > 0 && (
                                                                <ul className="clinical-history__audit-changes">
                                                                    {mod.detalle_cambios.map((cambio, idx) => (
                                                                        <li key={`${mod.id_historial}-${idx}`}>
                                                                            <span className="clinical-history__audit-field">
                                                                                {cambio.campo}:
                                                                            </span>{" "}
                                                                            <span className="clinical-history__audit-old">
                                                                                {formatChangeValue(cambio.anterior)}
                                                                            </span>{" "}
                                                                            →{" "}
                                                                            <span className="clinical-history__audit-new">
                                                                                {formatChangeValue(cambio.nuevo)}
                                                                            </span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                            </div>
                        );
                    })}
                </div>
            )}
        </article>
    );
}

export default ClinicalHistorySection;