
import { Response } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import turnosRepository from './turnos.repository';

const ZONA_HORARIA = 'America/Argentina/Tucuman';

interface FechaLocal {
    fecha: string;
    hora: string;
    diaSemana: number;
    fechaHora: string;
}

const obtenerFechaLocal = (fecha: Date): FechaLocal => {
    const partes = new Intl.DateTimeFormat('en-CA', {
        timeZone: ZONA_HORARIA,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hourCycle: 'h23'
    }).formatToParts(fecha);

    const valor = (tipo: string) =>
        partes.find(parte => parte.type === tipo)?.value ?? '';

    const year = valor('year');
    const month = valor('month');
    const day = valor('day');
    const hour = valor('hour');
    const minute = valor('minute');
    const second = valor('second');

    const fechaUtc = new Date(Date.UTC(
        Number(year),
        Number(month) - 1,
        Number(day)
    ));

    // MySQL: 1 = lunes ... 7 = domingo
    const diaSemana = fechaUtc.getUTCDay() || 7;

    return {
        fecha: `${year}-${month}-${day}`,
        hora: `${hour}:${minute}:${second}`,
        diaSemana,
        fechaHora: `${year}-${month}-${day} ${hour}:${minute}:${second}`
    };
};

const convertirFechaSolicitud = (valor: unknown): FechaLocal | null => {
    if (typeof valor !== 'string' || !valor.trim()) {
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
    const [horas, minutos, segundos = 0] = hora.split(':').map(Number);
    return horas * 60 + minutos + segundos / 60;
};

const sumarMinutos = (hora: string, minutos: number): number => {
    return convertirHoraAMinutos(hora) + minutos;
};

export const solicitarTurno = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const {
            id_mascota,
            id_veterinario,
            fecha_hora,
            motivo = null,
            observaciones = null
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
                status: 'error',
                message: 'Los identificadores de mascota y veterinario deben ser válidos.'
            });
            return;
        }

        if (!idUsuarioCreador) {
            res.status(401).json({
                status: 'error',
                message: 'No se pudo identificar al usuario autenticado.'
            });
            return;
        }

        const fechaLocal = convertirFechaSolicitud(fecha_hora);

        if (!fechaLocal) {
            res.status(400).json({
                status: 'error',
                message: 'La fecha debe estar en formato ISO 8601 e incluir zona horaria.'
            });
            return;
        }

        if (new Date(String(fecha_hora)).getTime() <= Date.now()) {
            res.status(400).json({
                status: 'error',
                message: 'No se pueden solicitar turnos en fechas u horarios pasados.'
            });
            return;
        }

        const mascota = await turnosRepository.obtenerMascotaActiva(idMascota);

        if (!mascota) {
            res.status(404).json({
                status: 'error',
                message: 'La mascota indicada no existe.'
            });
            return;
        }

        if (Number(mascota.mascota_activa) !== 1) {
            res.status(400).json({
                status: 'error',
                message: 'No se pueden solicitar turnos para mascotas inactivas.'
            });
            return;
        }

        if (Number(mascota.cliente_activo) !== 1) {
            res.status(400).json({
                status: 'error',
                message: 'No se pueden solicitar turnos para clientes inactivos.'
            });
            return;
        }

        const idClienteUsuario =
            await turnosRepository.obtenerClientePorUsuario(idUsuarioCreador);

        // Si el usuario tiene perfil de Cliente, debe ser dueño de la mascota.
        if (idClienteUsuario !== null &&
            idClienteUsuario !== Number(mascota.id_cliente)) {
            res.status(403).json({
                status: 'error',
                message: 'No puede solicitar turnos para mascotas de otro cliente.'
            });
            return;
        }

        const veterinario =
            await turnosRepository.obtenerVeterinarioActivo(idVeterinario);

        if (!veterinario) {
            res.status(404).json({
                status: 'error',
                message: 'El veterinario indicado no existe.'
            });
            return;
        }

        if (Number(veterinario.usuario_activo) !== 1) {
            res.status(400).json({
                status: 'error',
                message: 'No se pueden solicitar turnos para veterinarios inactivos.'
            });
            return;
        }

        const horarios = await turnosRepository.obtenerHorariosActivos(
            idVeterinario,
            fechaLocal.diaSemana
        );

        if (!horarios.length) {
            res.status(400).json({
                status: 'error',
                message: 'El veterinario no tiene horarios de atención para ese día.'
            });
            return;
        }

        const minutosSolicitud = convertirHoraAMinutos(fechaLocal.hora);

        const horarioValido = horarios.find(horario => {
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
                status: 'error',
                message: 'El horario solicitado no corresponde a un bloque disponible de atención.'
            });
            return;
        }

        const duracion = Number(horarioValido.intervalo_minutos);
        const minutosFin = sumarMinutos(fechaLocal.hora, duracion);

        const fechaFin = new Date(
            `${fechaLocal.fecha}T00:00:00Z`
        );

        const horasFin = Math.floor(minutosFin / 60);
        const minutosFinResto = minutosFin % 60;

        fechaFin.setUTCHours(horasFin, minutosFinResto, 0, 0);

        const fechaHasta = `${fechaFin.toISOString().slice(0, 10)} ${
            fechaFin.toISOString().slice(11, 19)
        }`;

        const turnosOcupados =
            await turnosRepository.obtenerTurnosOcupados(
                idVeterinario,
                fechaLocal.fechaHora,
                fechaHasta
            );

        if (turnosOcupados.length > 0) {
            res.status(409).json({
                status: 'error',
                message: 'El horario solicitado ya está ocupado.'
            });
            return;
        }

        const idEstadoPendiente =
            await turnosRepository.obtenerEstadoPorNombre('PENDIENTE');

        if (!idEstadoPendiente) {
            res.status(500).json({
                status: 'error',
                message: 'No se encontró el estado PENDIENTE en el catálogo.'
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
            observaciones
        });

        res.status(201).json({
            status: 'success',
            message: 'Turno médico solicitado exitosamente.',
            data: {
                id_turno: idTurno,
                id_mascota: idMascota,
                id_veterinario: idVeterinario,
                id_usuario_creador: idUsuarioCreador,
                id_estado_turno: idEstadoPendiente,
                fecha_hora: fechaLocal.fechaHora,
                motivo,
                observaciones
            }
        });

    } catch (error) {
        console.error('Error al solicitar turno:', error);

        res.status(500).json({
            status: 'error',
            message: 'Error interno al procesar la solicitud del turno.'
        });
    }
};
