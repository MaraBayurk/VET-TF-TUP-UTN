// ==========================================
// CATÁLOGO: TIPO DE ATENCIÓN (RN-08)
// ==========================================

export interface TipoAtencionDTO {
    id_tipo_atencion: number;
    nombre: string;
}

// ==========================================
// DTOs DE ENTRADA (ESCRITURA)
// ==========================================

export interface CrearVacunaAplicadaDTO {
    nombre_vacuna: string;
    dosis?: string | null;
    lote?: string | null;
    fecha_aplicacion: string; // Formato YYYY-MM-DD
    proxima_aplicacion?: string | null; // Formato YYYY-MM-DD
    laboratorio: string; // Obligatorio según decisión de trazabilidad (RN-12)
}

export interface CrearAtencionClinicaDTO {
    id_mascota: number;
    id_tipo_atencion: number;
    id_turno?: number | null;
    diagnostico?: string | null;
    tratamiento?: string | null;
    observaciones?: string | null;
    proximo_control?: string | null; // Formato YYYY-MM-DD
    vacunas?: CrearVacunaAplicadaDTO[];
}

export interface ActualizarAtencionClinicaDTO {
    diagnostico?: string | null;
    tratamiento?: string | null;
    observaciones?: string | null;
    proximo_control?: string | null; // Formato YYYY-MM-DD
    vacunas?: CrearVacunaAplicadaDTO[];
}

// ==========================================
// DTOs DE SALIDA (LECTURA / LIBRETA SANITARIA)
// ==========================================

export interface VacunaAplicadaResponseDTO {
    id_vacuna_aplicada: number;
    id_atencion: number;
    nombre_vacuna: string;
    dosis: string | null;
    lote: string | null;
    fecha_aplicacion: string;
    proxima_aplicacion: string | null;
    laboratorio: string;
}

export interface AtencionClinicaResponseDTO {
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
    vacunas: VacunaAplicadaResponseDTO[];
}

// ==========================================
// DTO DE ALERTAS (HU-VET-11-b)
// ==========================================

export type TipoAlertaClinica = 'CONTROL' | 'VACUNA';

export interface AlertaClinicaDTO {
    tipo_alerta: TipoAlertaClinica;
    fecha_vencimiento: string; // Formato YYYY-MM-DD
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