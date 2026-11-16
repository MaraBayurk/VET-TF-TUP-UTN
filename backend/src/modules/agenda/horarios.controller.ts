
import { Response } from 'express';
import { Request } from 'express';
import horariosRepository from './horarios.repository';

const validarHora = (hora: unknown): hora is string => {
    if (typeof hora !== 'string') return false;

    return /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/.test(hora);
};

export const crearHorario = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const {
            id_veterinario,
            dia_semana,
            hora_inicio,
            hora_fin,
            intervalo_minutos = 30
        } = req.body;

        const idVeterinario = Number(id_veterinario);
        const diaSemana = Number(dia_semana);
        const intervalo = Number(intervalo_minutos);

        if (!Number.isInteger(idVeterinario) || idVeterinario <= 0) {
            res.status(400).json({
                status: 'error',
                message: 'Debe indicar un veterinario válido.'
            });
            return;
        }

        if (!Number.isInteger(diaSemana) || diaSemana < 1 || diaSemana > 7) {
            res.status(400).json({
                status: 'error',
                message: 'El día de la semana debe estar entre 1 (lunes) y 7 (domingo).'
            });
            return;
        }

        if (!validarHora(hora_inicio) || !validarHora(hora_fin)) {
            res.status(400).json({
                status: 'error',
                message: 'Las horas deben tener formato HH:mm:ss.'
            });
            return;
        }

        if (hora_inicio >= hora_fin) {
            res.status(400).json({
                status: 'error',
                message: 'La hora de inicio debe ser anterior a la hora de finalización.'
            });
            return;
        }

        if (!Number.isInteger(intervalo) || intervalo <= 0 || intervalo > 480) {
            res.status(400).json({
                status: 'error',
                message: 'El intervalo debe ser un número entero entre 1 y 480 minutos.'
            });
            return;
        }

        const veterinarioActivo =
            await horariosRepository.obtenerVeterinarioActivo(idVeterinario);

        if (!veterinarioActivo) {
            res.status(404).json({
                status: 'error',
                message: 'El veterinario no existe o está inactivo.'
            });
            return;
        }

        const horariosExistentes =
            await horariosRepository.obtenerHorariosDelDia(
                idVeterinario,
                diaSemana
            );

        const inicioNuevo = hora_inicio;
        const finNuevo = hora_fin;

        const haySuperposicion = horariosExistentes.some(horario => {
            return (
                inicioNuevo < horario.hora_fin &&
                finNuevo > horario.hora_inicio
            );
        });

        if (haySuperposicion) {
            res.status(409).json({
                status: 'error',
                message: 'El horario se superpone con otra franja activa del veterinario.'
            });
            return;
        }

        const idHorario = await horariosRepository.crearHorario({
            idVeterinario,
            diaSemana,
            horaInicio: hora_inicio,
            horaFin: hora_fin,
            intervaloMinutos: intervalo
        });

        res.status(201).json({
            status: 'success',
            message: 'Horario de atención registrado exitosamente.',
            data: {
                id_horario: idHorario,
                id_veterinario: idVeterinario,
                dia_semana: diaSemana,
                hora_inicio,
                hora_fin,
                intervalo_minutos: intervalo
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
