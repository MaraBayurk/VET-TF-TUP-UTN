import { Response } from 'express';
import pool from '../../config/db';
import { AuthRequest } from '../../middlewares/auth.middleware';

// 1. Extracción de lógica de formateo
const formatearFechaMySQL = (fechaIso: string): string | null => {
    const fechaObj = new Date(fechaIso);
    if (isNaN(fechaObj.getTime())) return null;
    return fechaObj.toISOString().slice(0, 19).replace('T', ' ');
};

// 2. Extracción de lógica de validación (SRP: Single Responsibility Principle)
const validarPeticionTurno = (body: any, idCreador?: number, fechaFormateada?: string | null): string | null => {
    if (!body.id_mascota || !body.id_veterinario || !body.fecha_hora) {
        return 'Los campos id_mascota, id_veterinario y fecha_hora son obligatorios.';
    }
    if (!idCreador) {
        return 'No se pudo identificar al usuario creador de la transacción.';
    }
    if (!fechaFormateada) {
        return 'Formato de fecha y hora inválido.';
    }
    return null; // Nulo significa que no hay errores
};

// 3. Controlador limpio (Alta cohesión, baja complejidad cognitiva)
export const solicitarTurno = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id_mascota, id_veterinario, fecha_hora, motivo = null, observaciones = null } = req.body;
        const id_usuario_creador = req.usuario?.id_usuario;

        const fechaFormateada = formatearFechaMySQL(fecha_hora);

        // El controlador ahora solo tiene un flujo condicional para los errores
        const mensajeError = validarPeticionTurno(req.body, id_usuario_creador, fechaFormateada);
        if (mensajeError) {
            res.status(400).json({
                status: 'error',
                message: mensajeError
            });
            return;
        }

        const id_estado_turno_pendiente = 1;
        const query = `
            INSERT INTO Turno (id_mascota, id_veterinario, id_usuario_creador, id_estado_turno, fecha_hora, motivo, observaciones)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        await pool.execute(query, [
            id_mascota,
            id_veterinario,
            id_usuario_creador,
            id_estado_turno_pendiente,
            fechaFormateada,
            motivo,
            observaciones
        ]);

        res.status(201).json({
            status: 'success',
            message: 'Turno médico solicitado exitosamente.',
            data: { id_mascota, id_veterinario, id_usuario_creador, id_estado_turno: id_estado_turno_pendiente, fecha_hora: fechaFormateada, motivo, observaciones }
        });
    } catch (error) {
        console.error('Error al solicitar el turno médico:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor al procesar la solicitud del turno.'
        });
    }
};