export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  id_usuario: number;
  email: string;
  nombre: string;
  apellido: string;
  id_rol: number;
  rol: string;
}
export interface AuthResponse {
  token: string;
  user: AuthUser;
}
export interface ApiResponse<T> {
  status: "success" | "error";
  message?: string;
  data?: T;
}
export interface RegisterData {
  nombre: string;
  apellido: string;
  numero_documento: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  id_usuario: number;
}
