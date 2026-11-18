import type {
  AuthResponse,
  LoginCredentials,
  RegisterData,
  RegisterResponse,
} from "../types/auth.types";

const API_URL = import.meta.env.VITE_API_URL;

export const login = async (
  credentials: LoginCredentials
): Promise<AuthResponse> => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    throw new Error("No se pudo iniciar sesión.");
  }

  return response.json() as Promise<AuthResponse>;
};

export const register = async (
  data: RegisterData
): Promise<RegisterResponse> => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("No se pudo completar el registro.");
  }

  return response.json() as Promise<RegisterResponse>;
};