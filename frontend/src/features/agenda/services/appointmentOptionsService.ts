
import axiosInstance from "../../../core/api/axiosInstance";

export interface AppointmentPet {
  id_mascota: number;
  id_cliente: number;
  nombre: string;
  especie: string;
  raza: string | null;
  fecha_nacimiento: string | null;
  sexo: string;
  observaciones: string | null;
  activo: boolean | number;
}

interface ApiResponse<T> {
  status: "success" | "error";
  message?: string;
  data?: T;
}

export async function getAppointmentPets(): Promise<AppointmentPet[]> {
  try {
    const response = await axiosInstance.get<ApiResponse<AppointmentPet[]>>(
      "/mascotas",
    );

    const result = response.data;

    if (result.status !== "success" || !result.data) {
      throw new Error(
        result.message || "No se pudieron obtener las mascotas.",
      );
    }

    return result.data.filter(
      (pet) => Boolean(pet.activo),
    );
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Error al consultar las mascotas disponibles.");
  }
}

