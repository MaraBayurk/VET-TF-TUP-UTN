
export interface Schedule {
  id_horario: number;
  id_veterinario: number;
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
  intervalo_minutos: number;
  activo: number | boolean;
}

export interface SchedulePayload {
  id_veterinario: number;
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
  intervalo_minutos: number;
}

export interface ScheduleFilters {
  id_veterinario?: number;
  dia_semana?: number;
}

export interface VeterinarianOption {
  id_veterinario: number;
  id_usuario: number;
  nombre: string;
  apellido: string;
  matricula: string | null;
  especialidad: string | null;
}

export interface ScheduleApiResponse<T> {
  status: "success" | "error";
  message?: string;
  data?: T;
}

