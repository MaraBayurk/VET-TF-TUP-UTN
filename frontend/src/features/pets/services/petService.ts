import axiosInstance from "../../../core/api/axiosInstance";
import type { ApiResponse } from "../../auth/types/auth.types";
import type { PetItem } from "../../../types/pet";

export interface PetPayload {
  id_cliente?: number;
  nombre: string;
  especie: string;
  raza: string | null;
  fecha_nacimiento: string | null;
  sexo: string;
  observaciones: string | null;
}

type PetApiRecord = Omit<PetItem, "cliente" | "activo"> & {
  activo: boolean | number;
  cliente?: PetItem["cliente"];
  cliente_id_usuario?: number;
  cliente_nombre?: string;
  cliente_apellido?: string;
  cliente_numero_documento?: string;
};

function normalizePet(pet: PetApiRecord): PetItem {
  return {
    ...pet,
    activo: Boolean(pet.activo),
    cliente: pet.cliente ?? {
      id_usuario: Number(pet.cliente_id_usuario ?? 0),
      nombre: pet.cliente_nombre ?? "",
      apellido: pet.cliente_apellido ?? "",
      numero_documento: pet.cliente_numero_documento ?? "",
    },
  };
}

function errorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error && "response" in error) {
    const message = (error as { response?: { data?: { message?: string } } })
      .response?.data?.message;
    if (message) return message;
  }
  return error instanceof Error ? error.message : fallback;
}

function unwrap<T>(response: ApiResponse<T>): T {
  if (response.status !== "success" || response.data === undefined) {
    throw new Error(response.message || "Respuesta inválida del servidor");
  }
  return response.data;
}

function ensureSuccess(response: ApiResponse<unknown>): void {
  if (response.status !== "success") throw new Error(response.message || "No se pudo completar la operación");
}

export async function getPets(): Promise<PetItem[]> {
  try {
    const data = unwrap((await axiosInstance.get<ApiResponse<PetApiRecord[]>>("/mascotas")).data);
    return data.map(normalizePet);
  } catch (error) {
    throw new Error(errorMessage(error, "No se pudieron cargar las mascotas"), { cause: error });
  }
}

export async function getPet(id: string): Promise<PetItem> {
  try {
    const data = unwrap((await axiosInstance.get<ApiResponse<PetApiRecord>>(`/mascotas/${id}`)).data);
    return normalizePet(data);
  } catch (error) {
    throw new Error(errorMessage(error, "No se pudo cargar la mascota"), { cause: error });
  }
}

export async function createPet(payload: PetPayload): Promise<number | undefined> {
  try {
    const data = unwrap((await axiosInstance.post<ApiResponse<{ id_mascota: number }>>("/mascotas", payload)).data);
    return data.id_mascota;
  } catch (error) {
    throw new Error(errorMessage(error, "No se pudo registrar la mascota"), { cause: error });
  }
}

export async function updatePet(id: string, payload: Partial<PetPayload>): Promise<void> {
  try {
    ensureSuccess((await axiosInstance.put<ApiResponse<unknown>>(`/mascotas/${id}`, payload)).data);
  } catch (error) {
    throw new Error(errorMessage(error, "No se pudieron actualizar los datos"), { cause: error });
  }
}

export async function deactivatePet(id: number): Promise<void> {
  try {
    ensureSuccess((await axiosInstance.delete<ApiResponse<unknown>>(`/mascotas/${id}`)).data);
  } catch (error) {
    throw new Error(errorMessage(error, "No se pudo dar de baja la mascota"), { cause: error });
  }
}
