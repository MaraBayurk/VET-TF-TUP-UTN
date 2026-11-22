import axios from "axios";
import axiosInstance from "../../../core/api/axiosInstance";
import type {
    ActualizarAtencionPayload,
    AlertaClinicaItem,
    AtencionClinicaItem,
    CrearAtencionPayload,
    TipoAtencion,
} from "../../../types/clinical";

interface ApiEnvelope<T> {
    status: "success" | "error";
    message?: string;
    data?: T;
}

const extractErrorMessage = (error: unknown, fallbackMessage: string): string => {
    if (axios.isAxiosError<ApiEnvelope<unknown>>(error)) {
        const serverMessage = error.response?.data?.message;
        if (typeof serverMessage === "string" && serverMessage.trim().length > 0) {
            return serverMessage;
        }
    }

    if (error instanceof Error && error.message.trim().length > 0) {
        return error.message;
    }

    return fallbackMessage;
};

export const getTiposAtencion = async (): Promise<TipoAtencion[]> => {
    try {
        const response = await axiosInstance.get<ApiEnvelope<TipoAtencion[]>>(
            "/atenciones/tipos"
        );
        return response.data.data ?? [];
    } catch (error) {
        throw new Error(
            extractErrorMessage(error, "No se pudo obtener el catálogo de tipos de atención")
        );
    }
};

export const getHistorialPorMascota = async (
    idMascota: number | string
): Promise<AtencionClinicaItem[]> => {
    try {
        const response = await axiosInstance.get<ApiEnvelope<AtencionClinicaItem[]>>(
            `/atenciones/mascota/${idMascota}`
        );
        return response.data.data ?? [];
    } catch (error) {
        throw new Error(
            extractErrorMessage(error, "No se pudo cargar el historial clínico de la mascota")
        );
    }
};

export const getAtencionPorId = async (
    idAtencion: number | string
): Promise<AtencionClinicaItem> => {
    try {
        const response = await axiosInstance.get<ApiEnvelope<AtencionClinicaItem>>(
            `/atenciones/${idAtencion}`
        );
        if (!response.data.data) {
            throw new Error("No se encontraron datos para la atención clínica solicitada");
        }
        return response.data.data;
    } catch (error) {
        throw new Error(
            extractErrorMessage(error, "No se pudo obtener el detalle de la atención clínica")
        );
    }
};

export const getAlertasClinicas = async (): Promise<AlertaClinicaItem[]> => {
    try {
        const response = await axiosInstance.get<ApiEnvelope<AlertaClinicaItem[]>>(
            "/atenciones/alertas"
        );
        return response.data.data ?? [];
    } catch (error) {
        throw new Error(
            extractErrorMessage(error, "No se pudieron cargar las alertas de controles y vacunas")
        );
    }
};

export const crearAtencionClinica = async (
    payload: CrearAtencionPayload
): Promise<{ id_atencion: number }> => {
    try {
        const response = await axiosInstance.post<ApiEnvelope<{ id_atencion: number }>>(
            "/atenciones",
            payload
        );
        if (!response.data.data) {
            throw new Error("El servidor no devolvió el identificador de la atención creada");
        }
        return response.data.data;
    } catch (error) {
        throw new Error(
            extractErrorMessage(error, "No se pudo registrar la atención clínica")
        );
    }
};

export const actualizarAtencionClinica = async (
    idAtencion: number | string,
    payload: ActualizarAtencionPayload
): Promise<void> => {
    try {
        await axiosInstance.put<ApiEnvelope<unknown>>(
            `/atenciones/${idAtencion}`,
            payload
        );
    } catch (error) {
        throw new Error(
            extractErrorMessage(error, "No se pudo actualizar la atención clínica")
        );
    }
};

export const darDeBajaAtencionClinica = async (
    idAtencion: number | string
): Promise<void> => {
    try {
        await axiosInstance.delete<ApiEnvelope<unknown>>(`/atenciones/${idAtencion}`);
    } catch (error) {
        throw new Error(
            extractErrorMessage(error, "No se pudo dar de baja la atención clínica")
        );
    }
};