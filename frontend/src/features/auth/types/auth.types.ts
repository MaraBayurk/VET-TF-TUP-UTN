export type UserRole = "ADMINISTRADOR" | "VETERINARIO" | "CLIENTE";
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  id: number;
  email: string;
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
  numero_documento: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
}