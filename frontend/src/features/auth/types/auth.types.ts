export interface LoginCredentials {
  username: string;
  password: string;
}

export type UserRole = "ADMINISTRADOR" | "VETERINARIO" | "CLIENTE";

export interface AuthUser {
  id: number;
  username: string;
  nombre: string;
  apellido: string;
  rol: UserRole;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface RegisterData {
  nombre: string;
  apellido: string;
  username: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
}