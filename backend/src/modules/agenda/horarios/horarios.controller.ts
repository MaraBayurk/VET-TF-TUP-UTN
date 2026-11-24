
import { Request, Response } from 'express';
import horariosRepository from './horarios.repository';

interface DatosHorarioValidos {
    idVeterinario: number;
    diaSemana: number;
    horaInicio: string;
    horaFin: string;
    intervaloMinutos: number;
}

const normalizarHora = (hora: unknown): string | null => {
    if (typeof hora !== 'string') {
        return null;
    }

    const valor = hora.trim();

    if (/^([01]\d|2[0-3]):([0-5]\d)$/.test(valor)) {
        return `${valor}:00`;
    }

    if (/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/.test(valor)) {
        return valor;
    }

    return null;
};

const validarDatosHorario = (
    body: any
): { datos?: DatosHorarioValidos; error?: string } => {
    const idVeterinario = Number(body.id_veterinario);
    const diaSemana = Number(body.dia_semana);
    const intervalo = Number(body.intervalo_minutos ?? 30);

    const horaInicio = normalizarHora(body.hora_inicio);
    const horaFin = normalizarHora(body.hora_fin);

    if (!Number.isInteger(idVeterinario) || idVeterinario <= 0) {
        return {
            error: 'Debe indicar un veterinario válido.'
        };
    }

    if (!Number.isInteger(diaSemana) || diaSemana < 1 || diaSemana > 7) {
        return {
            error: 'El día de la semana debe estar entre 1 (lunes) y 7 (domingo).'
        };
    }

    if (!horaInicio || !horaFin) {
        return {
            error: 'Las horas deben tener formato HH:mm o HH:mm:ss.'
        };
    }

    if (horaInicio >= horaFin) {
        return {
            error: 'La hora de inicio debe ser anterior a la hora de finalización.'
        };
    }

    if (!Number.isInteger(intervalo) || intervalo <= 0 || intervalo > 480) {
        return {
            error: 'El intervalo debe ser un número entero entre 1 y 480 minutos.'
        };
    }

    return {
        datos: {
            idVeterinario,
            diaSemana,
            horaInicio,
            horaFin,
            intervaloMinutos: intervalo
        }
    };
};

// Acepta solamente un ID válido recibido como cadena.
const obtenerIdHorario = (valor: unknown): number | null => {
    if (typeof valor !== 'string') {
        return null;
    }

    const id = Number(valor);

    if (!Number.isInteger(id) || id <= 0) {
        return null;
    }

    return id;
};

const existeSuperposicion = (
    horaInicio: string,
    horaFin: string,
    horariosExistentes: {
        hora_inicio: string;
        hora_fin: string;
    }[]
): boolean => {
    return horariosExistentes.some(horario =>
        horaInicio < horario.hora_fin &&
        horaFin > horario.hora_inicio
    );
};

// GET: listar horarios
export const listarHorarios = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { id_veterinario, dia_semana } = req.query;

        const filtros: {
            idVeterinario?: number;
            diaSemana?: number;
        } = {};

        if (id_veterinario !== undefined) {
            const idVeterinario = Number(id_veterinario);

            if (!Number.isInteger(idVeterinario) || idVeterinario <= 0) {
                res.status(400).json({
                    status: 'error',
                    message: 'El ID del veterinario debe ser un número entero positivo.'
                });
                return;
            }

            filtros.idVeterinario = idVeterinario;
        }

        if (dia_semana !== undefined) {
            const diaSemana = Number(dia_semana);

            if (!Number.isInteger(diaSemana) || diaSemana < 1 || diaSemana > 7) {
                res.status(400).json({
                    status: 'error',
                    message: 'El día de la semana debe estar entre 1 (lunes) y 7 (domingo).'
                });
                return;
            }

            filtros.diaSemana = diaSemana;
        }

        const horarios = await horariosRepository.listarHorarios(filtros);

        res.status(200).json({
            status: 'success',
            message: 'Horarios de atención obtenidos exitosamente.',
            data: horarios
        });

    } catch (error) {
        console.error('Error al consultar horarios:', error);

        res.status(500).json({
            status: 'error',
            message: 'Error interno al consultar los horarios de atención.'
        });
    }
};

// POST: crear horario
export const crearHorario = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const validacion = validarDatosHorario(req.body);

        if (validacion.error || !validacion.datos) {
            res.status(400).json({
                status: 'error',
                message: validacion.error
            });
            return;
        }

        const datos = validacion.datos;

        const veterinarioActivo =
            await horariosRepository.obtenerVeterinarioActivo(
                datos.idVeterinario
            );

        if (!veterinarioActivo) {
            res.status(404).json({
                status: 'error',
                message: 'El veterinario no existe o está inactivo.'
            });
            return;
        }

        const horariosExistentes =
            await horariosRepository.obtenerHorariosDelDia(
                datos.idVeterinario,
                datos.diaSemana
            );

        if (
            existeSuperposicion(
                datos.horaInicio,
                datos.horaFin,
                horariosExistentes
            )
        ) {
            res.status(409).json({
                status: 'error',
                message: 'El horario se superpone con otra franja activa del veterinario.'
            });
            return;
        }

        const idHorario = await horariosRepository.crearHorario(datos);

        res.status(201).json({
            status: 'success',
            message: 'Horario de atención registrado exitosamente.',
            data: {
                id_horario: idHorario,
                id_veterinario: datos.idVeterinario,
                dia_semana: datos.diaSemana,
                hora_inicio: datos.horaInicio,
                hora_fin: datos.horaFin,
                intervalo_minutos: datos.intervaloMinutos
            }
        });

    } catch (error) {
        console.error('Error al registrar horario:', error);

        res.status(500).json({
            status: 'error',
            message: 'Error interno al registrar el horario de atención.'
        });
    }
};

// PUT: modificar horario
export const actualizarHorario = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const idHorario = obtenerIdHorario(req.params.id);

        if (!idHorario) {
            res.status(400).json({
                status: 'error',
                message: 'El ID del horario debe ser un número entero positivo.'
            });
            return;
        }

        const horarioActual =
            await horariosRepository.obtenerHorarioPorId(idHorario);

        if (!horarioActual) {
            res.status(404).json({
                status: 'error',
                message: 'El horario no existe o se encuentra inactivo.'
            });
            return;
        }

        const validacion = validarDatosHorario(req.body);

        if (validacion.error || !validacion.datos) {
            res.status(400).json({
                status: 'error',
                message: validacion.error
            });
            return;
        }

        const datos = validacion.datos;

        const veterinarioActivo =
            await horariosRepository.obtenerVeterinarioActivo(
                datos.idVeterinario
            );

        if (!veterinarioActivo) {
            res.status(404).json({
                status: 'error',
                message: 'El veterinario no existe o está inactivo.'
            });
            return;
        }

        // Excluimos el horario que estamos modificando
        // para evitar que se detecte una superposición consigo mismo.
        const horariosExistentes =
            await horariosRepository.obtenerHorariosDelDia(
                datos.idVeterinario,
                datos.diaSemana,
                idHorario
            );

        if (
            existeSuperposicion(
                datos.horaInicio,
                datos.horaFin,
                horariosExistentes
            )
        ) {
            res.status(409).json({
                status: 'error',
                message: 'El horario se superpone con otra franja activa del veterinario.'
            });
            return;
        }

        await horariosRepository.actualizarHorario(idHorario, datos);

        res.status(200).json({
            status: 'success',
            message: 'Horario de atención actualizado exitosamente.',
            data: {
                id_horario: idHorario,
                id_veterinario: datos.idVeterinario,
                dia_semana: datos.diaSemana,
                hora_inicio: datos.horaInicio,
                hora_fin: datos.horaFin,
                intervalo_minutos: datos.intervaloMinutos
            }
        });

    } catch (error) {
        console.error('Error al actualizar horario:', error);

        res.status(500).json({
            status: 'error',
            message: 'Error interno al actualizar el horario de atención.'
        });
    }
};

// DELETE: baja lógica
export const eliminarHorario = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const idHorario = obtenerIdHorario(req.params.id);

        if (!idHorario) {
            res.status(400).json({
                status: 'error',
                message: 'El ID del horario debe ser un número entero positivo.'
            });
            return;
        }

        const horarioActual =
            await horariosRepository.obtenerHorarioPorId(idHorario);

        if (!horarioActual) {
            res.status(404).json({
                status: 'error',
                message: 'El horario no existe o ya se encuentra inactivo.'
            });
            return;
        }

        const eliminado =
            await horariosRepository.darBajaLogica(idHorario);

        if (!eliminado) {
            res.status(409).json({
                status: 'error',
                message: 'No fue posible dar de baja el horario.'
            });
            return;
        }

        res.status(200).json({
            status: 'success',
            message: 'Horario de atención dado de baja correctamente.',
            data: {
                id_horario: idHorario,
                activo: 0
            }
        });

    } catch (error) {
        console.error('Error al dar de baja horario:', error);

        res.status(500).json({
            status: 'error',
            message: 'Error interno al dar de baja el horario de atención.'
        });
    }
};

