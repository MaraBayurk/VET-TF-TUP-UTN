import axiosInstance from "../../../core/api/axiosInstance";
import { AUTH_SESSION_CHANGED_EVENT, AUTH_TOKEN_KEY, clearAuthSession, saveAuthUser } from "./authStorage";
import type {
  ApiResponse,
  AuthResponse,
  LoginCredentials,
  RegisterData,
  RegisterResponse,
} from "../types/auth.types";

const getApiMessage = (error: unknown, fallback: string): string => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) return response.data.message;
  }
  if (error instanceof Error) return error.message;
  return fallback;
};

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    const { data } = await axiosInstance.post<ApiResponse<AuthResponse>>(
      "/auth/login",
      credentials,
    );
    if (!data.data?.token || !data.data.user) {
      throw new Error("La respuesta del servidor no contiene la sesión.");
    }
    localStorage.setItem(AUTH_TOKEN_KEY, data.data.token);
    saveAuthUser(data.data.user);
    window.dispatchEvent(new Event(AUTH_SESSION_CHANGED_EVENT));
    return data.data;
  } catch (error) {
    throw new Error(getApiMessage(error, "No se pudo iniciar sesión."), { cause: error });
  }
};

export const register = async (data: RegisterData): Promise<RegisterResponse> => {
  try {
    const response = await axiosInstance.post<ApiResponse<RegisterResponse>>(
      "/auth/register",
      data,
    );
    if (!response.data.data) {
      throw new Error("La respuesta del servidor no confirma el registro.");
    }
    return response.data.data;
  } catch (error) {
    throw new Error(getApiMessage(error, "No se pudo completar el registro."), { cause: error });
  }
};

export const logout = async (): Promise<void> => {
  try {
    await axiosInstance.post<ApiResponse<null>>("/auth/logout");
  } finally {
    // La API no invalida JWT en el servidor; borrar el token local cierra la sesión.
    clearAuthSession();
  }
};
