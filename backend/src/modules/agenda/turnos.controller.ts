import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import turnosRepository from "./turnos.repository";

const ZONA_HORARIA = "America/Argentina/Tucuman";

interface FechaLocal {
  fecha: string;
  hora: string;
  diaSemana: number;
  fechaHora: string;
}

const validarFechaConsulta = (
  fecha: unknown,
): {
  fecha: string;
  diaSemana: number;
} | null => {
  if (typeof fecha !== "string") return null;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return null;

  const [anio, mes, dia] = fecha.split("-").map(Number);
  const fechaUTC = new Date(Date.UTC(anio, mes - 1, dia));

  if (
    fechaUTC.getUTCFullYear() !== anio ||
    fechaUTC.getUTCMonth() !== mes - 1 ||
    fechaUTC.getUTCDate() !== dia
  ) {
    return null;
  }

  return {
    fecha,
    diaSemana: fechaUTC.getUTCDay() || 7,
  };
};

const obtenerFechaLocal = (fecha: Date): FechaLocal => {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA_HORARIA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(fecha);

  const valor = (tipo: string) =>
    partes.find((parte) => parte.type === tipo)?.value ?? "";

  const year = valor("year");
  const month = valor("month");
  const day = valor("day");
  const hour = valor("hour");
  const minute = valor("minute");
  const second = valor("second");

  const fechaUtc = new Date(
    Date.UTC(Number(year), Number(month) - 1, Number(day)),
  );

  // MySQL: 1 = lunes ... 7 = domingo
  const diaSemana = fechaUtc.getUTCDay() || 7;

  return {
    fecha: `${year}-${month}-${day}`,
    hora: `${hour}:${minute}:${second}`,
    diaSemana,
    fechaHora: `${year}-${month}-${day} ${hour}:${minute}:${second}`,
  };
};

const convertirFechaSolicitud = (valor: unknown): FechaLocal | null => {
  if (typeof valor !== "string" || !valor.trim()) {
    return null;
  }

  // Exigimos fecha ISO con zona horaria explícita.
  const tieneZonaHoraria =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(Z|[+-]\d{2}:\d{2})$/;

  if (!tieneZonaHoraria.test(valor)) {
    return null;
  }

  const fecha = new Date(valor);

  if (Number.isNaN(fecha.getTime())) {
    return null;
  }

  return obtenerFechaLocal(fecha);
};

const convertirHoraAMinutos = (hora: string): number => {
  const [horas, minutos, segundos = 0] = hora.split(":").map(Number);
  return horas * 60 + minutos + segundos / 60;
};

const sumarMinutos = (hora: string, minutos: number): number => {
  return convertirHoraAMinutos(hora) + minutos;
};

export const solicitarTurno = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const {
      id_mascota,
      id_veterinario,
      fecha_hora,
      motivo = null,
      observaciones = null,
    } = req.body;

    const idUsuarioCreador = req.usuario?.id_usuario;

    const idMascota = Number(id_mascota);
    const idVeterinario = Number(id_veterinario);

    if (
      !Number.isInteger(idMascota) ||
      idMascota <= 0 ||
      !Number.isInteger(idVeterinario) ||
      idVeterinario <= 0
    ) {
      res.status(400).json({
        status: "error",
        message:
          "Los identificadores de mascota y veterinario deben ser válidos.",
      });
      return;
    }

    if (!idUsuarioCreador) {
      res.status(401).json({
        status: "error",
        message: "No se pudo identificar al usuario autenticado.",
      });
      return;
    }

    const fechaLocal = convertirFechaSolicitud(fecha_hora);

    if (!fechaLocal) {
      res.status(400).json({
        status: "error",
        message:
          "La fecha debe estar en formato ISO 8601 e incluir zona horaria.",
      });
      return;
    }

    if (new Date(String(fecha_hora)).getTime() <= Date.now()) {
      res.status(400).json({
        status: "error",
        message: "No se pueden solicitar turnos en fechas u horarios pasados.",
      });
      return;
    }

    const mascota = await turnosRepository.obtenerMascotaActiva(idMascota);

    if (!mascota) {
      res.status(404).json({
        status: "error",
        message: "La mascota indicada no existe.",
      });
      return;
    }

    if (Number(mascota.mascota_activa) !== 1) {
      res.status(400).json({
        status: "error",
        message: "No se pueden solicitar turnos para mascotas inactivas.",
      });
      return;
    }

    if (Number(mascota.cliente_activo) !== 1) {
      res.status(400).json({
        status: "error",
        message: "No se pueden solicitar turnos para clientes inactivos.",
      });
      return;
    }

    const idClienteUsuario =
      await turnosRepository.obtenerClientePorUsuario(idUsuarioCreador);

    // Si el usuario tiene perfil de Cliente, debe ser dueño de la mascota.
    if (
      idClienteUsuario !== null &&
      idClienteUsuario !== Number(mascota.id_cliente)
    ) {
      res.status(403).json({
        status: "error",
        message: "No puede solicitar turnos para mascotas de otro cliente.",
      });
      return;
    }

    const veterinario =
      await turnosRepository.obtenerVeterinarioActivo(idVeterinario);

    if (!veterinario) {
      res.status(404).json({
        status: "error",
        message: "El veterinario indicado no existe.",
      });
      return;
    }

    if (Number(veterinario.usuario_activo) !== 1) {
      res.status(400).json({
        status: "error",
        message: "No se pueden solicitar turnos para veterinarios inactivos.",
      });
      return;
    }

    const horarios = await turnosRepository.obtenerHorariosActivos(
      idVeterinario,
      fechaLocal.diaSemana,
    );

    if (!horarios.length) {
      res.status(400).json({
        status: "error",
        message: "El veterinario no tiene horarios de atención para ese día.",
      });
      return;
    }

    const minutosSolicitud = convertirHoraAMinutos(fechaLocal.hora);

    const horarioValido = horarios.find((horario) => {
      const inicio = convertirHoraAMinutos(horario.hora_inicio);
      const fin = convertirHoraAMinutos(horario.hora_fin);
      const intervalo = Number(horario.intervalo_minutos);

      if (intervalo <= 0) return false;

      const diferencia = minutosSolicitud - inicio;

      return (
        diferencia >= 0 &&
        diferencia % intervalo === 0 &&
        minutosSolicitud + intervalo <= fin
      );
    });

    if (!horarioValido) {
      res.status(400).json({
        status: "error",
        message:
          "El horario solicitado no corresponde a un bloque disponible de atención.",
      });
      return;
    }

    const duracion = Number(horarioValido.intervalo_minutos);
    const minutosFin = sumarMinutos(fechaLocal.hora, duracion);

    const fechaFin = new Date(`${fechaLocal.fecha}T00:00:00Z`);

    const horasFin = Math.floor(minutosFin / 60);
    const minutosFinResto = minutosFin % 60;

    fechaFin.setUTCHours(horasFin, minutosFinResto, 0, 0);

    const fechaHasta = `${fechaFin.toISOString().slice(0, 10)} ${fechaFin
      .toISOString()
      .slice(11, 19)}`;

    const turnosOcupados = await turnosRepository.obtenerTurnosOcupados(
      idVeterinario,
      fechaLocal.fechaHora,
      fechaHasta,
    );

    if (turnosOcupados.length > 0) {
      res.status(409).json({
        status: "error",
        message: "El horario solicitado ya está ocupado.",
      });
      return;
    }

    const idEstadoPendiente =
      await turnosRepository.obtenerEstadoPorNombre("PENDIENTE");

    if (!idEstadoPendiente) {
      res.status(500).json({
        status: "error",
        message: "No se encontró el estado PENDIENTE en el catálogo.",
      });
      return;
    }

    const idTurno = await turnosRepository.crearTurno({
      idMascota,
      idVeterinario,
      idUsuarioCreador,
      idEstadoTurno: idEstadoPendiente,
      fechaHora: fechaLocal.fechaHora,
      motivo,
      observaciones,
    });

    res.status(201).json({
      status: "success",
      message: "Turno médico solicitado exitosamente.",
      data: {
        id_turno: idTurno,
        id_mascota: idMascota,
        id_veterinario: idVeterinario,
        id_usuario_creador: idUsuarioCreador,
        id_estado_turno: idEstadoPendiente,
        fecha_hora: fechaLocal.fechaHora,
        motivo,
        observaciones,
      },
    });
  } catch (error) {
    console.error("Error al solicitar turno:", error);

    res.status(500).json({
      status: "error",
      message: "Error interno al procesar la solicitud del turno.",
    });
  }
};

export const obtenerHorariosDisponibles = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const idVeterinario = Number(req.query.id_veterinario);
    const fecha = validarFechaConsulta(req.query.fecha);

    if (!Number.isInteger(idVeterinario) || idVeterinario <= 0) {
      res.status(400).json({
        status: "error",
        message: "Debe indicar un veterinario válido.",
      });
      return;
    }

    if (!fecha) {
      res.status(400).json({
        status: "error",
        message: "La fecha debe tener formato YYYY-MM-DD y ser válida.",
      });
      return;
    }

    const veterinario =
      await turnosRepository.obtenerVeterinarioActivo(idVeterinario);

    if (!veterinario) {
      res.status(404).json({
        status: "error",
        message: "El veterinario no existe.",
      });
      return;
    }

    if (Number(veterinario.usuario_activo) !== 1) {
      res.status(400).json({
        status: "error",
        message: "El veterinario se encuentra inactivo.",
      });
      return;
    }

    const horarios = await turnosRepository.obtenerHorariosActivos(
      idVeterinario,
      fecha.diaSemana,
    );

    if (!horarios.length) {
      res.status(200).json({
        status: "success",
        message: "El veterinario no tiene horarios de atención para esa fecha.",
        data: {
          fecha: fecha.fecha,
          id_veterinario: idVeterinario,
          horarios_disponibles: [],
        },
      });
      return;
    }

    const idsEstados = await turnosRepository.obtenerIdsEstadosOcupantes();

    const turnosOcupados = await turnosRepository.obtenerTurnosDelDia(
      idVeterinario,
      fecha.fecha,
      idsEstados,
    );

    const ocupados = turnosOcupados.map((turno) => {
      const inicio = convertirHoraAMinutos(turno.hora_inicio);

      return {
        inicio,
        fin: inicio + Number(turno.intervalo_minutos),
      };
    });

    const ahora = obtenerFechaLocal(new Date());
    const esHoy = ahora.fecha === fecha.fecha;

    const horariosDisponibles: string[] = [];

    for (const horario of horarios) {
      const inicio = convertirHoraAMinutos(horario.hora_inicio);
      const fin = convertirHoraAMinutos(horario.hora_fin);
      const intervalo = Number(horario.intervalo_minutos);

      if (intervalo <= 0) continue;

      for (
        let minuto = inicio;
        minuto + intervalo <= fin;
        minuto += intervalo
      ) {
        const hora = Math.floor(minuto / 60);
        const minutos = minuto % 60;

        const horaFormateada =
          `${String(hora).padStart(2, "0")}:` +
          `${String(minutos).padStart(2, "0")}:00`;

        if (esHoy && minuto <= convertirHoraAMinutos(ahora.hora)) {
          continue;
        }

        const estaOcupado = ocupados.some(
          (turno) => minuto < turno.fin && minuto + intervalo > turno.inicio,
        );

        if (!estaOcupado) {
          horariosDisponibles.push(horaFormateada);
        }
      }
    }

    res.status(200).json({
      status: "success",
      message: "Horarios disponibles obtenidos correctamente.",
      data: {
        fecha: fecha.fecha,
        id_veterinario: idVeterinario,
        horarios_disponibles: horariosDisponibles,
      },
    });
  } catch (error) {
    console.error("Error al consultar horarios disponibles:", error);

    res.status(500).json({
      status: "error",
      message: "Error interno al consultar la disponibilidad.",
    });
  }
};


export const obtenerMisTurnos = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const idUsuario = req.usuario?.id_usuario;

    if (!idUsuario) {
      res.status(401).json({
        status: "error",
        message: "No se pudo identificar al usuario autenticado."
      });
      return;
    }

    const idCliente =
      await turnosRepository.obtenerClientePorUsuarioObligatorio(idUsuario);

    if (!idCliente) {
      res.status(404).json({
        status: "error",
        message: "No se encontró un perfil de cliente activo."
      });
      return;
    }

    const turnos = await turnosRepository.listarTurnosCliente(idCliente);

    res.status(200).json({
      status: "success",
      message: "Próximos turnos obtenidos exitosamente.",
      data: turnos
    });
  } catch (error) {
    console.error("Error al consultar los turnos del cliente:", error);

    res.status(500).json({
      status: "error",
      message: "Error interno al consultar los turnos."
    });
  }
};

export const obtenerAgendaVeterinario = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const idUsuario = req.usuario?.id_usuario;

    if (!idUsuario) {
      res.status(401).json({
        status: "error",
        message: "No se pudo identificar al usuario autenticado."
      });
      return;
    }

    const idVeterinario =
      await turnosRepository.obtenerVeterinarioPorUsuario(idUsuario);

    if (!idVeterinario) {
      res.status(404).json({
        status: "error",
        message: "No se encontró un perfil de veterinario activo."
      });
      return;
    }

    const turnos =
      await turnosRepository.listarTurnosVeterinario(idVeterinario);

    res.status(200).json({
      status: "success",
      message: "Agenda del veterinario obtenida exitosamente.",
      data: turnos
    });
  } catch (error) {
    console.error("Error al consultar la agenda del veterinario:", error);

    res.status(500).json({
      status: "error",
      message: "Error interno al consultar la agenda."
    });
  }
};

export const obtenerTodosLosTurnos = async (
  _req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const turnos = await turnosRepository.listarTodosLosTurnos();

    res.status(200).json({
      status: "success",
      message: "Turnos obtenidos exitosamente.",
      data: turnos
    });
  } catch (error) {
    console.error("Error al consultar todos los turnos:", error);

    res.status(500).json({
      status: "error",
      message: "Error interno al consultar los turnos."
    });
  }
};

export const cancelarMiTurno = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const idUsuario = req.usuario?.id_usuario;
    const idTurno = Number(req.params.id);

    if (!idUsuario) {
      res.status(401).json({
        status: "error",
        message: "No se pudo identificar al usuario autenticado."
      });
      return;
    }

    if (!Number.isInteger(idTurno) || idTurno <= 0) {
      res.status(400).json({
        status: "error",
        message: "El identificador del turno no es válido."
      });
      return;
    }

    const idCliente =
      await turnosRepository.obtenerClientePorUsuarioObligatorio(idUsuario);

    if (!idCliente) {
      res.status(404).json({
        status: "error",
        message: "No se encontró un perfil de cliente activo."
      });
      return;
    }

    const turno = await turnosRepository.obtenerTurnoParaGestion(idTurno);

    if (!turno) {
      res.status(404).json({
        status: "error",
        message: "El turno solicitado no existe."
      });
      return;
    }

    if (Number(turno.id_cliente) !== idCliente) {
      res.status(403).json({
        status: "error",
        message: "No puede cancelar turnos de otros clientes."
      });
      return;
    }

    const estadoActual = String(turno.estado).toUpperCase();

    if (!["PENDIENTE", "APROBADO"].includes(estadoActual)) {
      res.status(409).json({
        status: "error",
        message: "Solo se pueden cancelar turnos pendientes o aprobados."
      });
      return;
    }

    if (new Date(turno.fecha_hora).getTime() <= Date.now()) {
      res.status(400).json({
        status: "error",
        message: "No se pueden cancelar turnos que ya comenzaron o pasaron."
      });
      return;
    }

    const idCancelado =
      await turnosRepository.obtenerEstadoPorNombre("CANCELADO");

    if (!idCancelado) {
      res.status(500).json({
        status: "error",
        message: "No se encontró el estado CANCELADO en el catálogo."
      });
      return;
    }

    await turnosRepository.actualizarEstadoTurno(idTurno, idCancelado);

    res.status(200).json({
      status: "success",
      message: "Turno cancelado exitosamente.",
      data: {
        id_turno: idTurno,
        estado: "CANCELADO"
      }
    });
  } catch (error) {
    console.error("Error al cancelar el turno:", error);

    res.status(500).json({
      status: "error",
      message: "Error interno al cancelar el turno."
    });
  }
};

export const actualizarEstadoTurno = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const idTurno = Number(req.params.id);
    const { estado } = req.body;

    if (!Number.isInteger(idTurno) || idTurno <= 0) {
      res.status(400).json({
        status: "error",
        message: "El identificador del turno no es válido."
      });
      return;
    }

    if (typeof estado !== "string" || !estado.trim()) {
      res.status(400).json({
        status: "error",
        message: "Debe indicar el nuevo estado del turno."
      });
      return;
    }

    const nuevoEstado = estado.trim().toUpperCase();
    const estadosPermitidos = ["APROBADO", "CANCELADO", "COMPLETADO"];

    if (!estadosPermitidos.includes(nuevoEstado)) {
      res.status(400).json({
        status: "error",
        message: "El estado indicado no es válido para esta operación."
      });
      return;
    }

    const turno = await turnosRepository.obtenerTurnoParaGestion(idTurno);

    if (!turno) {
      res.status(404).json({
        status: "error",
        message: "El turno solicitado no existe."
      });
      return;
    }

    const estadoActual = String(turno.estado).toUpperCase();

    const transicionesPermitidas: Record<string, string[]> = {
      PENDIENTE: ["APROBADO", "CANCELADO", "COMPLETADO"],
      APROBADO: ["CANCELADO", "COMPLETADO"],
      CANCELADO: [],
      COMPLETADO: []
    };

    if (!transicionesPermitidas[estadoActual]?.includes(nuevoEstado)) {
      res.status(409).json({
        status: "error",
        message: `No se permite cambiar el estado de ${estadoActual} a ${nuevoEstado}.`
      });
      return;
    }

    const idNuevoEstado =
      await turnosRepository.obtenerEstadoPorNombre(nuevoEstado);

    if (!idNuevoEstado) {
      res.status(500).json({
        status: "error",
        message: `No se encontró el estado ${nuevoEstado} en el catálogo.`
      });
      return;
    }

    await turnosRepository.actualizarEstadoTurno(idTurno, idNuevoEstado);

    res.status(200).json({
      status: "success",
      message: "Estado del turno actualizado exitosamente.",
      data: {
        id_turno: idTurno,
        estado_anterior: estadoActual,
        estado_nuevo: nuevoEstado
      }
    });
  } catch (error) {
    console.error("Error al actualizar el estado del turno:", error);

    res.status(500).json({
      status: "error",
      message: "Error interno al actualizar el estado del turno."
    });
  }
};

