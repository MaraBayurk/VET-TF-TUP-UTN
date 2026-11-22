import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowRight,
    BellRing,
    CalendarClock,
    PawPrint,
    Phone,
    Syringe,
} from "lucide-react";

import type { AlertaClinicaItem, TipoAlertaClinica } from "../../../types/clinical";
import { getAuthUser } from "../../auth/services/authStorage";
import { getAlertasClinicas } from "../services/clinicalService";
import "../styles/ClinicalAlertsPage.scss";

type FilterType = "TODAS" | TipoAlertaClinica;

const formatDateOnly = (date: string): string => {
    return new Date(`${date}T00:00:00`).toLocaleDateString("es-AR");
};

const getRemainingLabel = (date: string): string => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(`${date}T00:00:00`);
    const diffDays = Math.round(
        (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays <= 0) return "Vence hoy";
    if (diffDays === 1) return "Vence mañana";
    return `En ${diffDays} días`;
};

function ClinicalAlertsPage() {
    const navigate = useNavigate();
    const role = getAuthUser()?.rol?.trim().toLocaleLowerCase("es") ?? "";
    const isStaff = role === "administrador" || role === "veterinario";

    const [alerts, setAlerts] = useState<AlertaClinicaItem[]>([]);
    const [filter, setFilter] = useState<FilterType>("TODAS");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadAlerts = async () => {
        setLoading(true);
        setError("");
        try {
            const data = await getAlertasClinicas();
            setAlerts(data);
        } catch (reason) {
            setError(
                reason instanceof Error
                    ? reason.message
                    : "No se pudieron cargar las alertas clínicas"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let active = true;
        setLoading(true);
        setError("");

        getAlertasClinicas()
            .then((data) => {
                if (active) setAlerts(data);
            })
            .catch((reason) => {
                if (active) {
                    setError(
                        reason instanceof Error
                            ? reason.message
                            : "No se pudieron cargar las alertas clínicas"
                    );
                }
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, []);

    const controlCount = alerts.filter((a) => a.tipo_alerta === "CONTROL").length;
    const vaccineCount = alerts.filter((a) => a.tipo_alerta === "VACUNA").length;

    const filteredAlerts =
        filter === "TODAS"
            ? alerts
            : alerts.filter((alerta) => alerta.tipo_alerta === filter);

    return (
        <section className="clinical-alerts">
            <header className="clinical-alerts__banner">
                <div className="clinical-alerts__banner-content">
                    <span className="clinical-alerts__eyebrow">Medicina preventiva</span>
                    <h1>Alertas de controles y vacunas</h1>
                    <p>
                        {isStaff
                            ? "Listado de pacientes con próximos controles clínicos o refuerzos de vacunación dentro de los siguientes 30 días."
                            : "Recordatorios de próximos controles clínicos y refuerzos de vacunación de tus mascotas para los próximos 30 días."}
                    </p>
                </div>

                <div className="clinical-alerts__banner-decoration" aria-hidden="true">
                    <BellRing size={88} />
                </div>
            </header>

            {error && (
                <div role="alert" className="clinical-alerts__error">
                    <span>{error}</span>
                    <button type="button" onClick={() => void loadAlerts()}>
                        Reintentar
                    </button>
                </div>
            )}

            <section className="clinical-alerts__stats">
                <article className="clinical-alerts__stat-card">
                    <div className="clinical-alerts__stat-icon clinical-alerts__stat-icon--all">
                        <BellRing size={20} />
                    </div>
                    <div>
                        <span>Alertas próximas (30 días)</span>
                        <strong>{alerts.length}</strong>
                    </div>
                </article>

                <article className="clinical-alerts__stat-card">
                    <div className="clinical-alerts__stat-icon clinical-alerts__stat-icon--control">
                        <CalendarClock size={20} />
                    </div>
                    <div>
                        <span>Controles clínicos</span>
                        <strong>{controlCount}</strong>
                    </div>
                </article>

                <article className="clinical-alerts__stat-card">
                    <div className="clinical-alerts__stat-icon clinical-alerts__stat-icon--vaccine">
                        <Syringe size={20} />
                    </div>
                    <div>
                        <span>Refuerzos de vacunas</span>
                        <strong>{vaccineCount}</strong>
                    </div>
                </article>
            </section>

            <section className="clinical-alerts__panel">
                <div className="clinical-alerts__toolbar">
                    <div className="clinical-alerts__filters">
                        <button
                            type="button"
                            className={`clinical-alerts__filter-btn ${filter === "TODAS" ? "clinical-alerts__filter-btn--active" : ""
                                }`}
                            onClick={() => setFilter("TODAS")}
                        >
                            Todas ({alerts.length})
                        </button>

                        <button
                            type="button"
                            className={`clinical-alerts__filter-btn ${filter === "CONTROL" ? "clinical-alerts__filter-btn--active" : ""
                                }`}
                            onClick={() => setFilter("CONTROL")}
                        >
                            Controles ({controlCount})
                        </button>

                        <button
                            type="button"
                            className={`clinical-alerts__filter-btn ${filter === "VACUNA" ? "clinical-alerts__filter-btn--active" : ""
                                }`}
                            onClick={() => setFilter("VACUNA")}
                        >
                            Vacunas ({vaccineCount})
                        </button>
                    </div>
                </div>

                {loading ? (
                    <p role="status" className="clinical-alerts__loading">
                        Cargando alertas clínicas...
                    </p>
                ) : filteredAlerts.length === 0 ? (
                    <div className="clinical-alerts__empty">
                        No se registran vencimientos de controles ni vacunas para los próximos 30 días.
                    </div>
                ) : (
                    <div className="clinical-alerts__list">
                        {filteredAlerts.map((alerta, index) => (
                            <article
                                key={`${alerta.tipo_alerta}-${alerta.id_atencion}-${alerta.fecha_vencimiento}-${index}`}
                                className="clinical-alerts__card"
                            >
                                <div className="clinical-alerts__card-main">
                                    <div className="clinical-alerts__card-top">
                                        <span
                                            className={`clinical-alerts__badge ${alerta.tipo_alerta === "VACUNA"
                                                    ? "clinical-alerts__badge--vaccine"
                                                    : "clinical-alerts__badge--control"
                                                }`}
                                        >
                                            {alerta.tipo_alerta === "VACUNA" ? (
                                                <Syringe size={13} />
                                            ) : (
                                                <CalendarClock size={13} />
                                            )}
                                            {alerta.tipo_alerta === "VACUNA"
                                                ? "Refuerzo de vacuna"
                                                : "Próximo control"}
                                        </span>

                                        <span className="clinical-alerts__due">
                                            {formatDateOnly(alerta.fecha_vencimiento)} ·{" "}
                                            {getRemainingLabel(alerta.fecha_vencimiento)}
                                        </span>
                                    </div>

                                    <h2 className="clinical-alerts__card-title">
                                        {alerta.mascota_nombre} ({alerta.mascota_especie}) —{" "}
                                        {alerta.detalle}
                                    </h2>

                                    <div className="clinical-alerts__card-meta">
                                        <span>
                                            <PawPrint size={14} />
                                            Responsable: {alerta.cliente_nombre}{" "}
                                            {alerta.cliente_apellido}
                                        </span>

                                        {isStaff && (
                                            <span>
                                                <Phone size={14} />
                                                Teléfono: {alerta.cliente_telefono || "No registrado"}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className="clinical-alerts__card-link"
                                    onClick={() => navigate(`/mascotas/${alerta.id_mascota}`)}
                                >
                                    Ver libreta sanitaria
                                    <ArrowRight size={15} />
                                </button>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </section>
    );
}

export default ClinicalAlertsPage;