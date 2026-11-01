import { Response } from 'express';
import pool from '../../config/db';
import { AuthRequest } from '../../middlewares/auth.middleware';

export const solicitarTurno = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id_mascota, id_veterinario, fecha_hora, motivo, observaciones } = req.body;

        // Extracción del usuario creador desde el token validado por el middleware
        const id_usuario_creador = req.usuario?.id_usuario;

        if (!id_mascota || !id_veterinario || !fecha_hora) {
            res.status(400).json({
                status: 'error',
                message: 'Los campos id_mascota, id_veterinario y fecha_hora son obligatorios.'
            });
            return;
        }

        if (!id_usuario_creador) {
            res.status(401).json({
                status: 'error',
                message: 'No se pudo identificar al usuario creador de la transacción.'
            });
            return;
        }

        // Validación y formateo de la fecha para MySQL (YYYY-MM-DD HH:MM:SS)
        const fechaObj = new Date(fecha_hora);
        if (isNaN(fechaObj.getTime())) {
            res.status(400).json({
                status: 'error',
                message: 'Formato de fecha y hora inválido.'
            });
            return;
        }
        const fechaFormateada = fechaObj.toISOString().slice(0, 19).replace('T', ' ');

        // El ID 1 corresponde al estado PENDIENTE según la tabla de dominios cerrados
        const id_estado_turno_pendiente = 1;

        const query = `
            INSERT INTO Turno (id_mascota, id_veterinario, id_usuario_creador, id_estado_turno, fecha_hora, motivo, observaciones)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await pool.execute(query, [
            id_mascota,
            id_veterinario,
            id_usuario_creador,
            id_estado_turno_pendiente,
            fechaFormateada,
            motivo || null,
            observaciones || null
        ]);

        res.status(201).json({
            status: 'success',
            message: 'Turno médico solicitado exitosamente.',
            data: {
                id_mascota,
                id_veterinario,
                id_usuario_creador,
                id_estado_turno: id_estado_turno_pendiente,
                fecha_hora: fechaFormateada,
                motivo,
                observaciones
            }
        });
    } catch (error) {
        console.error('Error al solicitar el turno médico:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor al procesar la solicitud del turno.'
        });
    }
};