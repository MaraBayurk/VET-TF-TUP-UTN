
export interface CrearMascotaDTO {
    id_cliente: number;
    nombre: string;
    especie: string;
    raza?: string | null;
    fecha_nacimiento?: string | null;
    sexo: string;
    observaciones?: string | null;
}

export interface ActualizarMascotaDTO {
    nombre?: string;
    especie?: string;
    raza?: string | null;
    fecha_nacimiento?: string | null;
    sexo?: string;
    observaciones?: string | null;
}
