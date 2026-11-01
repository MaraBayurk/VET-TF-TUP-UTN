import { Request, Response } from 'express';
import pool from '../../config/db';

export const crearHorario = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id_veterinario, dia_semana, hora_inicio, hora_fin, intervalo_minutos } = req.body;

        if (!id_veterinario || !dia_semana || !hora_inicio || !hora_fin) {
            res.status(400).json({
                status: 'error',
                message: 'Los campos id_veterinario, dia_semana, hora_inicio y hora_fin son obligatorios.'
            });
            return;
        }

        const intervalo = intervalo_minutos || 30;

        const query = `
            INSERT INTO HorarioAtencion (id_veterinario, dia_semana, hora_inicio, hora_fin, intervalo_minutos, activo)
            VALUES (?, ?, ?, ?, ?, 1)
        `;

        const [result] = await pool.execute(query, [id_veterinario, dia_semana, hora_inicio, hora_fin, intervalo]);

        res.status(201).json({
            status: 'success',
            message: 'Horario de atención registrado exitosamente.',
            data: {
                id_veterinario,
                dia_semana,
                hora_inicio,
                hora_fin,
                intervalo_minutos: intervalo
            }
        });
    } catch (error) {
        console.error('Error al registrar el horario de atención:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor al procesar la solicitud.'
        });
    }
};