
import axiosInstance from "../../../core/api/axiosInstance";

import type {
  Appointment,
  AppointmentCreated,
  AppointmentRequest,
  AvailableSlotsResponse,
  UpdateAppointmentStatus,
} from "../types/appointment.types";

interface ApiResponse<T> {
  status: "success" | "error";
  message?: string;
  data?: T;
}

const unwrap = <T>(response: ApiResponse<T>): T => {
  if (response.status !== "success" || response.data === undefined) {
    throw new Error(
      response.message || "La respuesta del servidor no es válida.",
    );
  }

  return response.data;
};

const getErrorMessage = (
  error: unknown,
  fallback: string,
): string => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (
      error as {
        response?: {
          data?: {
            message?: string;
          };
        };
      }
    ).response;

    if (response?.data?.message) {
      return response.data.message;
    }
  }

  return error instanceof Error ? error.message : fallback;
};

const handleServiceError = (
  error: unknown,
  fallback: string,
): Error => {
  return new Error(getErrorMessage(error, fallback), {
    cause: error,
  });
};

// ==========================================
// CLIENTE: CONSULTAR MIS TURNOS
// ==========================================

export async function getMyAppointments(): Promise<Appointment[]> {
  try {
    const response = await axiosInstance.get<ApiResponse<Appointment[]>>(
      "/turnos/mis-turnos",
    );

    return unwrap(response.data);
  } catch (error) {
    throw handleServiceError(
      error,
      "No se pudieron consultar tus turnos.",
    );
  }
}

// ==========================================
// ADMINISTRADOR: CONSULTAR TODOS LOS TURNOS
// ==========================================

export async function getAllAppointments(): Promise<Appointment[]> {
  try {
    const response = await axiosInstance.get<ApiResponse<Appointment[]>>(
      "/turnos",
    );

    return unwrap(response.data);
  } catch (error) {
    throw handleServiceError(
      error,
      "No se pudieron consultar los turnos.",
    );
  }
}

// ==========================================
// VETERINARIO: CONSULTAR SU AGENDA
// ==========================================

export async function getVeterinarianAgenda(): Promise<Appointment[]> {
  try {
    const response = await axiosInstance.get<ApiResponse<Appointment[]>>(
      "/turnos/agenda",
    );

    return unwrap(response.data);
  } catch (error) {
    throw handleServiceError(
      error,
      "No se pudo consultar la agenda del veterinario.",
    );
  }
}

// ==========================================
// CONSULTAR HORARIOS DISPONIBLES
// ==========================================

export async function getAvailableSlots(
  idVeterinario: number,
  fecha: string,
): Promise<AvailableSlotsResponse> {
  try {
    const response = await axiosInstance.get<
      ApiResponse<AvailableSlotsResponse>
    >("/turnos/disponibles", {
      params: {
        id_veterinario: idVeterinario,
        fecha,
      },
    });

    return unwrap(response.data);
  } catch (error) {
    throw handleServiceError(
      error,
      "No se pudo consultar la disponibilidad.",
    );
  }
}

// ==========================================
// SOLICITAR UN TURNO
// ==========================================

export async function requestAppointment(
  payload: AppointmentRequest,
): Promise<AppointmentCreated> {
  try {
    const response = await axiosInstance.post<
      ApiResponse<AppointmentCreated>
    >("/turnos", payload);

    return unwrap(response.data);
  } catch (error) {
    throw handleServiceError(
      error,
      "No se pudo solicitar el turno.",
    );
  }
}

// ==========================================
// CLIENTE: CANCELAR UN TURNO PROPIO
// ==========================================

export async function cancelAppointment(
  idTurno: number,
): Promise<void> {
  try {
    await axiosInstance.patch(`/turnos/${idTurno}/cancelar`);
  } catch (error) {
    throw handleServiceError(
      error,
      "No se pudo cancelar el turno.",
    );
  }
}

// ==========================================
// ADMINISTRADOR: ACTUALIZAR ESTADO
// ==========================================

export async function updateAppointmentStatus(
  idTurno: number,
  payload: UpdateAppointmentStatus,
): Promise<void> {
  try {
    await axiosInstance.patch(
      `/turnos/${idTurno}/estado`,
      payload,
    );
  } catch (error) {
    throw handleServiceError(
      error,
      "No se pudo actualizar el estado del turno.",
    );
  }
}

