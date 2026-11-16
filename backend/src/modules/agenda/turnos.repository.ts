
import pool from '../../config/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export interface MascotaTurno extends RowDataPacket {
    id_mascota: number;
    id_cliente: number;
    cliente_activo: number;
    mascota_activa: number;
}

export interface VeterinarioTurno extends RowDataPacket {
    id_veterinario: number;
    id_usuario: number;
    usuario_activo: number;
}

export interface HorarioTurno extends RowDataPacket {
    id_horario: number;
    dia_semana: number;
    hora_inicio: string;
    hora_fin: string;
    intervalo_minutos: number;
}

class TurnosRepository {
    async obtenerMascotaActiva(idMascota: number): Promise<MascotaTurno | null> {
        const [rows] = await pool.query<MascotaTurno[]>(
            `SELECT
                m.id_mascota,
                m.id_cliente,
                m.activo AS mascota_activa,
                u.activo AS cliente_activo
             FROM Mascota m
             INNER JOIN Cliente c ON c.id_cliente = m.id_cliente
             INNER JOIN Usuario u ON u.id_usuario = c.id_usuario
             WHERE m.id_mascota = ?
             LIMIT 1`,
            [idMascota]
        );

        return rows[0] ?? null;
    }

    async obtenerClientePorUsuario(idUsuario: number): Promise<number | null> {
        const [rows] = await pool.query<RowDataPacket[]>(
            `SELECT c.id_cliente
             FROM Cliente c
             INNER JOIN Usuario u ON u.id_usuario = c.id_usuario
             WHERE c.id_usuario = ?
               AND u.activo = 1
             LIMIT 1`,
            [idUsuario]
        );

        return rows.length ? Number(rows[0].id_cliente) : null;
    }

    async obtenerVeterinarioActivo(idVeterinario: number): Promise<VeterinarioTurno | null> {
        const [rows] = await pool.query<VeterinarioTurno[]>(
            `SELECT
                v.id_veterinario,
                v.id_usuario,
                u.activo AS usuario_activo
             FROM Veterinario v
             INNER JOIN Usuario u ON u.id_usuario = v.id_usuario
             WHERE v.id_veterinario = ?
             LIMIT 1`,
            [idVeterinario]
        );

        return rows[0] ?? null;
    }

    async obtenerEstadoPorNombre(nombre: string): Promise<number | null> {
        const [rows] = await pool.query<RowDataPacket[]>(
            `SELECT id_estado_turno
             FROM EstadoTurno
             WHERE UPPER(nombre) = UPPER(?)
             LIMIT 1`,
            [nombre]
        );

        return rows.length ? Number(rows[0].id_estado_turno) : null;
    }

    async obtenerHorariosActivos(
        idVeterinario: number,
        diaSemana: number
    ): Promise<HorarioTurno[]> {
        const [rows] = await pool.query<HorarioTurno[]>(
            `SELECT
                id_horario,
                dia_semana,
                hora_inicio,
                hora_fin,
                intervalo_minutos
             FROM HorarioAtencion
             WHERE id_veterinario = ?
               AND dia_semana = ?
               AND activo = 1
             ORDER BY hora_inicio ASC`,
            [idVeterinario, diaSemana]
        );

        return rows;
    }

    async obtenerTurnosOcupados(
        idVeterinario: number,
        fechaDesde: string,
        fechaHasta: string
    ): Promise<RowDataPacket[]> {
        const [rows] = await pool.query<RowDataPacket[]>(
            `SELECT t.fecha_hora, h.nombre AS estado
             FROM Turno t
             INNER JOIN EstadoTurno h
                ON h.id_estado_turno = t.id_estado_turno
             WHERE t.id_veterinario = ?
               AND t.fecha_hora >= ?
               AND t.fecha_hora < ?
               AND UPPER(h.nombre) IN ('PENDIENTE', 'APROBADO')
             ORDER BY t.fecha_hora ASC`,
            [idVeterinario, fechaDesde, fechaHasta]
        );

        return rows;
    }

    async crearTurno(datos: {
        idMascota: number;
        idVeterinario: number;
        idUsuarioCreador: number;
        idEstadoTurno: number;
        fechaHora: string;
        motivo: string | null;
        observaciones: string | null;
    }): Promise<number> {
        const [result] = await pool.execute<ResultSetHeader>(
            `INSERT INTO Turno (
                id_mascota,
                id_veterinario,
                id_usuario_creador,
                id_estado_turno,
                fecha_hora,
                motivo,
                observaciones
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                datos.idMascota,
                datos.idVeterinario,
                datos.idUsuarioCreador,
                datos.idEstadoTurno,
                datos.fechaHora,
                datos.motivo,
                datos.observaciones
            ]
        );

        return result.insertId;
    }
}

export default new TurnosRepository();
