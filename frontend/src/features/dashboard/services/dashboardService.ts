import axiosInstance from "../../../core/api/axiosInstance";

export interface DashboardAppointment {
  id_turno: number;
  fecha_hora: string;
  motivo: string | null;
  id_mascota: number;
  nombre_mascota: string;
  id_cliente?: number;
  nombre_cliente?: string;
  apellido_cliente?: string;
  estado: string;
}
export interface DashboardPet {
  id_mascota: number;
  nombre: string;
  especie: string;
  raza: string | null;
  activo: boolean | number;
}
export interface DashboardClient { id_cliente: number; activo: boolean | number }
interface ApiResponse<T> { status: "success" | "error"; message?: string; data?: T }

const unwrap = <T,>(response: ApiResponse<T>): T => {
  if (response.status !== "success" || response.data === undefined) {
    throw new Error(response.message || "Respuesta inválida del servidor");
  }
  return response.data;
};
const getError = (error: unknown, fallback: string) => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message;
    if (message) return message;
  }
  return error instanceof Error ? error.message : fallback;
};
export async function getDashboardAppointments(role: "administrador" | "veterinario" | "cliente") {
  const path = role === "cliente" ? "/turnos/mis-turnos" : role === "veterinario" ? "/turnos/agenda" : "/turnos";
  try { return unwrap((await axiosInstance.get<ApiResponse<DashboardAppointment[]>>(path)).data); }
  catch (error) { throw new Error(getError(error, "No se pudieron cargar los turnos"), { cause: error }); }
}
export async function getDashboardPets() {
  try { return unwrap((await axiosInstance.get<ApiResponse<DashboardPet[]>>("/mascotas")).data); }
  catch (error) { throw new Error(getError(error, "No se pudieron cargar las mascotas"), { cause: error }); }
}
export async function getDashboardClients() {
  try { return unwrap((await axiosInstance.get<ApiResponse<DashboardClient[]>>("/clientes")).data); }
  catch (error) { throw new Error(getError(error, "No se pudieron cargar los clientes"), { cause: error }); }
}
