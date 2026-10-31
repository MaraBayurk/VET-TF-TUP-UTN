export interface CrearUsuarioDTO {
    nombre: string;
    apellido: string;
    numero_documento: string;
    email: string;
    password_hash: string;
    telefono?: string; // Opcional
    id_rol: number;
}