import type {
  AuthResponse,
  LoginCredentials,
} from "../types/auth.types.ts";

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