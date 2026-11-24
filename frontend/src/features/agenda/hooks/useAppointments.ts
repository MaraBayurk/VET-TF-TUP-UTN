
import { useCallback, useEffect, useState } from "react";

import {
  cancelAppointment,
  getAllAppointments,
  getMyAppointments,
  getVeterinarianAgenda,
  updateAppointmentStatus,
} from "../services/appointmentService";

import type { Appointment } from "../types/appointment.types";

type AgendaRole = "cliente" | "administrador" | "veterinario";

interface UseAppointmentsResult {
  appointments: Appointment[];
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
  cancel: (idTurno: number) => Promise<void>;
  updateStatus: (idTurno: number, idEstado: number) => Promise<void>;
}

export function useAppointments(
  role: AgendaRole,
): UseAppointmentsResult {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      let data: Appointment[];

      switch (role) {
        case "cliente":
          data = await getMyAppointments();
          break;

        case "administrador":
          data = await getAllAppointments();
          break;

        case "veterinario":
          data = await getVeterinarianAgenda();
          break;
      }

      setAppointments(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar los turnos.",
      );
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const cancel = async (idTurno: number): Promise<void> => {
    await cancelAppointment(idTurno);
    await refresh();
  };

  const updateStatus = async (
    idTurno: number,
    idEstado: number,
  ): Promise<void> => {
    await updateAppointmentStatus(idTurno, {
      id_estado_turno: idEstado,
    });

    await refresh();
  };

  return {
    appointments,
    loading,
    error,
    refresh,
    cancel,
    updateStatus,
  };
}

export default useAppointments;

