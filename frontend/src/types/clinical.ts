export interface TipoAtencion {
    id_tipo_atencion: number;
    nombre: string;
}

export interface CrearVacunaPayload {
    nombre_vacuna: string;
    dosis?: string | null;
    lote?: string | null;
    fecha_aplicacion: string;
    proxima_aplicacion?: string | null;
    laboratorio: string;
}

export interface CrearAtencionPayload {
    id_mascota: number;
    id_tipo_atencion: number;
    id_turno?: number | null;
    diagnostico?: string | null;
    tratamiento?: string | null;
    observaciones?: string | null;
    proximo_control?: string | null;
    vacunas?: CrearVacunaPayload[];
}

export interface ActualizarAtencionPayload {
    diagnostico?: string | null;
    tratamiento?: string | null;
    observaciones?: string | null;
    proximo_control?: string | null;
    vacunas?: CrearVacunaPayload[];
}

export interface VacunaAplicadaItem {
    id_vacuna_aplicada: number;
    id_atencion: number;
    nombre_vacuna: string;
    dosis: string | null;
    lote: string | null;
    fecha_aplicacion: string;
    proxima_aplicacion: string | null;
    laboratorio: string;
}

export interface AtencionClinicaItem {
    id_atencion: number;
    id_turno: number | null;
    id_mascota: number;
    mascota_nombre: string;
    mascota_especie: string;
    id_veterinario: number;
    veterinario_nombre: string;
    veterinario_apellido: string;
    veterinario_matricula: string;
    id_tipo_atencion: number;
    tipo_atencion_nombre: string;
    diagnostico: string | null;
    tratamiento: string | null;
    observaciones: string | null;
    proximo_control: string | null;
    fecha_atencion: string;
    id_usuario_ultima_modificacion: number | null;
    modificador_nombre: string | null;
    modificador_apellido: string | null;
    fecha_ultima_modificacion: string | null;
    activo: number;
    vacunas: VacunaAplicadaItem[];
}

export type TipoAlertaClinica = "CONTROL" | "VACUNA";

export interface AlertaClinicaItem {
    tipo_alerta: TipoAlertaClinica;
    fecha_vencimiento: string;
    id_atencion: number;
    id_mascota: number;
    mascota_nombre: string;
    mascota_especie: string;
    id_cliente: number;
    cliente_nombre: string;
    cliente_apellido: string;
    cliente_telefono: string | null;
    detalle: string;
}