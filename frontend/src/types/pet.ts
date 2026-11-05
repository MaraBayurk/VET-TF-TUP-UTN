
export type PetStatus = "Activa" | "Inactiva";

export interface PetItem {
  id_mascota: number;
  nombre: string;
  especie: string;
  raza: string | null;
  fecha_nacimiento: string | null;
  sexo: string;
  observaciones: string | null;
  activo: boolean;
  id_cliente: number;
  cliente: {
    id_usuario: number;
    nombre: string;
    apellido: string;
    numero_documento: string;
  };
}
