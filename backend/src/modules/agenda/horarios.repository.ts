
import pool from '../../config/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export interface HorarioExistente extends RowDataPacket {
    id_horario: number;
    hora_inicio: string;
    hora_fin: string;
}

class HorariosRepository {
    async obtenerVeterinarioActivo(idVeterinario: number): Promise<boolean> {
        const [rows] = await pool.query<RowDataPacket[]>(
            `SELECT v.id_veterinario
             FROM Veterinario v
             INNER JOIN Usuario u ON u.id_usuario = v.id_usuario
             WHERE v.id_veterinario = ?
               AND u.activo = 1
             LIMIT 1`,
            [idVeterinario]
        );

        return rows.length > 0;
    }

    async obtenerHorariosDelDia(
        idVeterinario: number,
        diaSemana: number
    ): Promise<HorarioExistente[]> {
        const [rows] = await pool.query<HorarioExistente[]>(
            `SELECT id_horario, hora_inicio, hora_fin
             FROM HorarioAtencion
             WHERE id_veterinario = ?
               AND dia_semana = ?
               AND activo = 1`,
            [idVeterinario, diaSemana]
        );

        return rows;
    }

    async crearHorario(datos: {
        idVeterinario: number;
        diaSemana: number;
        horaInicio: string;
        horaFin: string;
        intervaloMinutos: number;
    }): Promise<number> {
        const [result] = await pool.execute<ResultSetHeader>(
            `INSERT INTO HorarioAtencion (
                id_veterinario,
                dia_semana,
                hora_inicio,
                hora_fin,
                intervalo_minutos,
                activo
            )
            VALUES (?, ?, ?, ?, ?, 1)`,
            [
                datos.idVeterinario,
                datos.diaSemana,
                datos.horaInicio,
                datos.horaFin,
                datos.intervaloMinutos
            ]
        );

        return result.insertId;
    }
}

export default new HorariosRepository();
