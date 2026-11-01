export interface CrearMascotaDTO {
    id_cliente: number;
    nombre: string;
    especie: string;
    raza?: string;
    fecha_nacimiento?: string; // Formato YYYY-MM-DD
    sexo: string;
    observaciones?: string;
}

export interface ActualizarMascotaDTO {
    nombre?: string;
    especie?: string;
    raza?: string;
    fecha_nacimiento?: string;
    sexo?: string;
    observaciones?: string;
}