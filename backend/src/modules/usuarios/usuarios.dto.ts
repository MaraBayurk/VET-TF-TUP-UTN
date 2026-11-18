export interface CrearUsuarioDTO {
    nombre: string;
    apellido: string;
    numero_documento: string;
    email: string;
    password_hash: string;
    telefono?: string;
    id_rol: number;
    // Extensiones
    direccion?: string;        // Para el Cliente
    matricula?: string;        // Para el Veterinario
    id_especialidad?: number;  // Para el Veterinario
}

export interface ActualizarPerfilDTO {
    telefono?: string;
    direccion?: string;
}