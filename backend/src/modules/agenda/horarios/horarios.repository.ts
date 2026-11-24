
import pool from '../../../config/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export interface HorarioExistente extends RowDataPacket {
    id_horario: number;
    hora_inicio: string;
    hora_fin: string;
}

export interface HorarioAtencion extends RowDataPacket {
    id_horario: number;
    id_veterinario: number;
    dia_semana: number;
    hora_inicio: string;
    hora_fin: string;
    intervalo_minutos: number;
    activo: number;
}

interface DatosHorario {
    idVeterinario: number;
    diaSemana: number;
    horaInicio: string;
    horaFin: string;
    intervaloMinutos: number;
}

class HorariosRepository {

    async obtenerVeterinarioActivo(
        idVeterinario: number
    ): Promise<boolean> {
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

    async obtenerHorarioPorId(
        idHorario: number
    ): Promise<HorarioAtencion | null> {
        const [rows] = await pool.query<HorarioAtencion[]>(
            `SELECT
                id_horario,
                id_veterinario,
                dia_semana,
                TIME_FORMAT(hora_inicio, '%H:%i:%s') AS hora_inicio,
                TIME_FORMAT(hora_fin, '%H:%i:%s') AS hora_fin,
                intervalo_minutos,
                activo
             FROM HorarioAtencion
             WHERE id_horario = ?
               AND activo = 1
             LIMIT 1`,
            [idHorario]
        );

        return rows.length > 0 ? rows[0] : null;
    }

    async obtenerHorariosDelDia(
        idVeterinario: number,
        diaSemana: number,
        excluirId?: number
    ): Promise<HorarioExistente[]> {
        let sql = `
            SELECT
                id_horario,
                TIME_FORMAT(hora_inicio, '%H:%i:%s') AS hora_inicio,
                TIME_FORMAT(hora_fin, '%H:%i:%s') AS hora_fin
            FROM HorarioAtencion
            WHERE id_veterinario = ?
              AND dia_semana = ?
              AND activo = 1
        `;

        const parametros: number[] = [
            idVeterinario,
            diaSemana
        ];

        if (excluirId !== undefined) {
            sql += ' AND id_horario <> ?';
            parametros.push(excluirId);
        }

        const [rows] = await pool.query<HorarioExistente[]>(
            sql,
            parametros
        );

        return rows;
    }

    async listarHorarios(filtros: {
        idVeterinario?: number;
        diaSemana?: number;
    }): Promise<HorarioAtencion[]> {
        let sql = `
            SELECT
                id_horario,
                id_veterinario,
                dia_semana,
                TIME_FORMAT(hora_inicio, '%H:%i:%s') AS hora_inicio,
                TIME_FORMAT(hora_fin, '%H:%i:%s') AS hora_fin,
                intervalo_minutos,
                activo
            FROM HorarioAtencion
            WHERE activo = 1
        `;

        const parametros: number[] = [];

        if (filtros.idVeterinario !== undefined) {
            sql += ' AND id_veterinario = ?';
            parametros.push(filtros.idVeterinario);
        }

        if (filtros.diaSemana !== undefined) {
            sql += ' AND dia_semana = ?';
            parametros.push(filtros.diaSemana);
        }

        sql += ' ORDER BY id_veterinario, dia_semana, hora_inicio';

        const [rows] = await pool.query<HorarioAtencion[]>(
            sql,
            parametros
        );

        return rows;
    }

    async crearHorario(datos: DatosHorario): Promise<number> {
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

    async actualizarHorario(
        idHorario: number,
        datos: DatosHorario
    ): Promise<boolean> {
        await pool.execute<ResultSetHeader>(
            `UPDATE HorarioAtencion
             SET
                id_veterinario = ?,
                dia_semana = ?,
                hora_inicio = ?,
                hora_fin = ?,
                intervalo_minutos = ?
             WHERE id_horario = ?
               AND activo = 1`,
            [
                datos.idVeterinario,
                datos.diaSemana,
                datos.horaInicio,
                datos.horaFin,
                datos.intervaloMinutos,
                idHorario
            ]
        );

        // El controlador ya verificó que el horario exista y esté activo.
        // Si no hubo error SQL, la operación se considera ejecutada.
        return true;
    }

    async darBajaLogica(idHorario: number): Promise<boolean> {
        const [result] = await pool.execute<ResultSetHeader>(
            `UPDATE HorarioAtencion
             SET activo = 0
             WHERE id_horario = ?
               AND activo = 1`,
            [idHorario]
        );

        return result.affectedRows > 0;
    }
}

export default new HorariosRepository();

