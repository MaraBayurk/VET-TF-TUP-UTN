
import axiosInstance from "../../../core/api/axiosInstance";

import type {
  Schedule,
  SchedulePayload,
  ScheduleFilters,
  ScheduleApiResponse,
  VeterinarianOption,
} from "../types/schedule.types";

const unwrap = <T,>(response: ScheduleApiResponse<T>): T => {
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
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
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
// CONSULTAR HORARIOS
// ==========================================

export async function getSchedules(
  filters: ScheduleFilters = {},
): Promise<Schedule[]> {
  try {
    const response = await axiosInstance.get<
      ScheduleApiResponse<Schedule[]>
    >("/horarios", {
      params: {
        ...(filters.id_veterinario !== undefined && {
          id_veterinario: filters.id_veterinario,
        }),
        ...(filters.dia_semana !== undefined && {
          dia_semana: filters.dia_semana,
        }),
      },
    });

    return unwrap(response.data);
  } catch (error) {
    throw handleServiceError(
      error,
      "No se pudieron consultar los horarios de atención.",
    );
  }
}

// ==========================================
// REGISTRAR HORARIO
// ==========================================

export async function createSchedule(
  payload: SchedulePayload,
): Promise<Schedule> {
  try {
    const response = await axiosInstance.post<
      ScheduleApiResponse<Schedule>
    >("/horarios", payload);

    return unwrap(response.data);
  } catch (error) {
    throw handleServiceError(
      error,
      "No se pudo registrar el horario de atención.",
    );
  }
}

// ==========================================
// MODIFICAR HORARIO
// ==========================================

export async function updateSchedule(
  idHorario: number,
  payload: SchedulePayload,
): Promise<void> {
  try {
    await axiosInstance.put(
      `/horarios/${idHorario}`,
      payload,
    );
  } catch (error) {
    throw handleServiceError(
      error,
      "No se pudo modificar el horario de atención.",
    );
  }
}

// ==========================================
// BAJA LÓGICA DEL HORARIO
// ==========================================

export async function deactivateSchedule(
  idHorario: number,
): Promise<void> {
  try {
    await axiosInstance.delete(`/horarios/${idHorario}`);
  } catch (error) {
    throw handleServiceError(
      error,
      "No se pudo dar de baja el horario de atención.",
    );
  }
}

// ==========================================
// CONSULTAR VETERINARIOS
// ==========================================

export async function getVeterinarians(): Promise<
  VeterinarianOption[]
> {
  try {
    const response = await axiosInstance.get<
      ScheduleApiResponse<VeterinarianOption[]>
    >("/usuarios");

    const veterinarians = unwrap(response.data);

    return veterinarians.filter(
      (veterinarian) =>
        Number.isInteger(Number(veterinarian.id_veterinario)) &&
        Number(veterinarian.id_veterinario) > 0,
    );
  } catch (error) {
    throw handleServiceError(
      error,
      "No se pudieron consultar los veterinarios.",
    );
  }
}

