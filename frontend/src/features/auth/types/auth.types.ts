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