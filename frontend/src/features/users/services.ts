
import axiosInstance from "../../core/api/axiosInstance";
import type { ApiResponse } from "../auth/types/auth.types";

export interface UserRecord {
  id_usuario: number;
  id_veterinario: number | null;
  nombre: string;
  apellido: string;
  numero_documento: string;
  email: string;
  telefono: string | null;
  id_rol: number;
  rol: string;
  activo: number | boolean;
  fecha_creacion: string;
  direccion: string | null;
  matricula: string | null;
  id_especialidad: number | null;
  especialidad: string | null;
}

export interface UserRoleOption {
  id_rol: number;
  nombre: string;
}

export interface SpecialtyOption {
  id_especialidad: number;
  nombre: string;
}

export interface UserCatalogs {
  roles: UserRoleOption[];
  especialidades: SpecialtyOption[];
}

export interface UserPayload {
  nombre: string;
  apellido: string;
  numero_documento: string;
  email: string;
  telefono?: string;
  id_rol: number;
  direccion?: string;
  matricula?: string;
  id_especialidad?: number;
  password?: string;
}

const unwrap = <T,>(data: ApiResponse<T>): T => {
  if (data.status !== "success" || data.data === undefined) {
    throw new Error(data.message || "Respuesta inválida del servidor");
  }

  return data.data;
};

const messageFrom = (error: unknown, fallback: string) => {
  if (typeof error === "object" && error && "response" in error) {
    const message = (
      error as { response?: { data?: { message?: string } } }
    ).response?.data?.message;

    if (message) return message;
  }

  return error instanceof Error ? error.message : fallback;
};

export const getUsers = async () => {
  try {
    return unwrap(
      await axiosInstance
        .get<ApiResponse<UserRecord[]>>("/usuarios")
        .then(response => response.data)
    );
  } catch (error) {
    throw new Error(
      messageFrom(error, "No se pudieron cargar los usuarios"),
      { cause: error }
    );
  }
};

export const getUser = async (id: string) => {
  try {
    return unwrap(
      await axiosInstance
        .get<ApiResponse<UserRecord>>(`/usuarios/${id}`)
        .then(response => response.data)
    );
  } catch (error) {
    throw new Error(
      messageFrom(error, "No se pudo cargar el usuario"),
      { cause: error }
    );
  }
};

export const getUserCatalogs = async () => {
  try {
    return unwrap(
      await axiosInstance
        .get<ApiResponse<UserCatalogs>>("/usuarios/catalogos")
        .then(response => response.data)
    );
  } catch (error) {
    throw new Error(
      messageFrom(error, "No se pudieron cargar los roles y especialidades"),
      { cause: error }
    );
  }
};

export const createUser = async (payload: UserPayload) => {
  try {
    await axiosInstance.post("/usuarios", payload);
  } catch (error) {
    throw new Error(
      messageFrom(error, "No se pudo crear el usuario"),
      { cause: error }
    );
  }
};

export const updateUser = async (id: string, payload: UserPayload) => {
  try {
    await axiosInstance.put(`/usuarios/${id}`, payload);
  } catch (error) {
    throw new Error(
      messageFrom(error, "No se pudo actualizar el usuario"),
      { cause: error }
    );
  }
};

export const deactivateUser = async (id: number) => {
  try {
    await axiosInstance.delete(`/usuarios/${id}`);
  } catch (error) {
    throw new Error(
      messageFrom(error, "No se pudo dar de baja al usuario"),
      { cause: error }
    );
  }
};

export const getUserError = messageFrom;

