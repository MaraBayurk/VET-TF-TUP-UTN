import axiosInstance from "../../../core/api/axiosInstance";

export interface ClientPet {
  id_mascota: number; nombre: string; especie: string; raza: string | null;
  fecha_nacimiento: string | null; sexo: string; activo: number | boolean;
}
export interface ClientAppointment {
  id_turno: number; fecha_hora: string; motivo: string | null; observaciones: string | null;
  id_mascota: number; nombre_mascota: string; estado: string;
  nombre_veterinario: string; apellido_veterinario: string;
}
export interface ClientRecord {
  id_cliente: number; id_usuario: number; nombre: string; apellido: string;
  numero_documento: string; email: string; telefono: string | null;
  direccion: string | null; activo: number | boolean;
  fecha_creacion: string; cantidad_mascotas?: number; cantidad_turnos?: number;
  mascotas?: ClientPet[]; turnos?: ClientAppointment[];
}
export interface ClientPayload {
  nombre: string; apellido: string; numero_documento: string; email: string;
  telefono: string; direccion: string; password?: string;
}
interface ApiResponse<T> { status: "success" | "error"; message?: string; data?: T }
const messageFrom = (error: unknown, fallback: string) => {
  if (typeof error === "object" && error && "response" in error) {
    const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message;
    if (message) return message;
  }
  return error instanceof Error ? error.message : fallback;
};
const unwrap = <T,>(response: ApiResponse<T>): T => {
  if (response.status !== "success" || response.data === undefined) throw new Error(response.message || "Respuesta inválida del servidor");
  return response.data;
};
export async function getClients(): Promise<ClientRecord[]> {
  try { return unwrap((await axiosInstance.get<ApiResponse<ClientRecord[]>>("/clientes")).data); }
  catch (error) { throw new Error(messageFrom(error, "No se pudieron cargar los clientes"), { cause: error }); }
}
export async function getClient(id: string): Promise<ClientRecord> {
  try { return unwrap((await axiosInstance.get<ApiResponse<ClientRecord>>(`/clientes/${id}`)).data); }
  catch (error) { throw new Error(messageFrom(error, "No se pudo cargar el cliente"), { cause: error }); }
}
export async function createClient(payload: ClientPayload): Promise<void> {
  try { await axiosInstance.post("/clientes", payload); }
  catch (error) { throw new Error(messageFrom(error, "No se pudo crear el cliente"), { cause: error }); }
}
export async function updateClient(id: string, payload: ClientPayload): Promise<void> {
  try { await axiosInstance.put(`/clientes/${id}`, payload); }
  catch (error) { throw new Error(messageFrom(error, "No se pudo actualizar el cliente"), { cause: error }); }
}
export async function deactivateClient(id: number): Promise<void> {
  try { await axiosInstance.delete(`/clientes/${id}`); }
  catch (error) { throw new Error(messageFrom(error, "No se pudo dar de baja al cliente"), { cause: error }); }
}
