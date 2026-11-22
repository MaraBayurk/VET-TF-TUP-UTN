
export interface Appointment {
  id_turno: number;
  fecha_hora: string;
  motivo: string | null;
  observaciones: string | null;

  id_mascota: number;
  nombre_mascota: string;

  id_veterinario?: number;
  nombre_veterinario?: string;
  apellido_veterinario?: string;

  id_cliente?: number;
  nombre_cliente?: string;
  apellido_cliente?: string;

  id_estado_turno?: number;
  estado: string;
}

export interface AvailableSlotsResponse {
  fecha: string;
  id_veterinario: number;
  horarios_disponibles: string[];
}

export interface AppointmentRequest {
  id_mascota: number;
  id_veterinario: number;

  // Fecha ISO 8601 con zona horaria explícita.
  // Ejemplo: 2026-11-20T10:30:00-03:00
  fecha_hora: string;

  motivo?: string | null;
  observaciones?: string | null;
}

export interface AppointmentCreated {
  id_turno: number;
  id_mascota: number;
  id_veterinario: number;
  id_usuario_creador: number;
  id_estado_turno: number;
  fecha_hora: string;
  motivo: string | null;
  observaciones: string | null;
}

export interface UpdateAppointmentStatus {
  id_estado_turno: number;
}

