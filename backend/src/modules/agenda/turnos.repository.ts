import pool from "../../config/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";

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

export interface TurnoOcupado extends RowDataPacket {
    hora_inicio: string;
    intervalo_minutos: number;
}


export interface TurnoGestion extends RowDataPacket {
  id_turno: number;
  id_mascota: number;
  id_cliente: number;
  id_veterinario: number;
  fecha_hora: string;
  estado: string;
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
      [idMascota],
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
      [idUsuario],
    );

    return rows.length ? Number(rows[0].id_cliente) : null;
  }

  async obtenerVeterinarioActivo(
    idVeterinario: number,
  ): Promise<VeterinarioTurno | null> {
    const [rows] = await pool.query<VeterinarioTurno[]>(
      `SELECT
                v.id_veterinario,
                v.id_usuario,
                u.activo AS usuario_activo
             FROM Veterinario v
             INNER JOIN Usuario u ON u.id_usuario = v.id_usuario
             WHERE v.id_veterinario = ?
             LIMIT 1`,
      [idVeterinario],
    );

    return rows[0] ?? null;
  }

  async obtenerEstadoPorNombre(nombre: string): Promise<number | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id_estado_turno
             FROM EstadoTurno
             WHERE UPPER(nombre) = UPPER(?)
             LIMIT 1`,
      [nombre],
    );

    return rows.length ? Number(rows[0].id_estado_turno) : null;
  }

  async obtenerHorariosActivos(
    idVeterinario: number,
    diaSemana: number,
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
      [idVeterinario, diaSemana],
    );

    return rows;
  }

  async obtenerTurnosOcupados(
    idVeterinario: number,
    fechaDesde: string,
    fechaHasta: string,
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
      [idVeterinario, fechaDesde, fechaHasta],
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
        datos.observaciones,
      ],
    );

    return result.insertId;
  }

  async obtenerIdsEstadosOcupantes(): Promise<number[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id_estado_turno
         FROM EstadoTurno
         WHERE UPPER(nombre) IN (?, ?)`,
      ["PENDIENTE", "APROBADO"],
    );

    return rows.map((row) => Number(row.id_estado_turno));
  }

  async obtenerTurnosDelDia(
    idVeterinario: number,
    fecha: string,
    idsEstados: number[],
  ): Promise<TurnoOcupado[]> {
    if (idsEstados.length === 0) return [];

    const placeholders = idsEstados.map(() => "?").join(", ");

    const [rows] = await pool.query<TurnoOcupado[]>(
      `SELECT
         DATE_FORMAT(t.fecha_hora, '%H:%i:%s') AS hora_inicio,
         COALESCE(h.intervalo_minutos, 30) AS intervalo_minutos
         FROM Turno t
         LEFT JOIN HorarioAtencion h
            ON h.id_veterinario = t.id_veterinario
            AND h.dia_semana = ?
            AND TIME(t.fecha_hora) >= h.hora_inicio
            AND TIME(t.fecha_hora) < h.hora_fin
         WHERE t.id_veterinario = ?
           AND DATE(t.fecha_hora) = ?
           AND t.id_estado_turno IN (${placeholders})
         ORDER BY t.fecha_hora ASC`,
      [this.obtenerDiaSemana(fecha), idVeterinario, fecha, ...idsEstados],
    );

    return rows;
  }

  private obtenerDiaSemana(fecha: string): number {
    const [anio, mes, dia] = fecha.split("-").map(Number);
    return new Date(Date.UTC(anio, mes - 1, dia)).getUTCDay() || 7;
  }


  async obtenerClientePorUsuarioObligatorio(
    idUsuario: number
  ): Promise<number | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT c.id_cliente
       FROM Cliente c
       INNER JOIN Usuario u ON u.id_usuario = c.id_usuario
       WHERE c.id_usuario = ? AND u.activo = 1
       LIMIT 1`,
      [idUsuario]
    );

    return rows.length ? Number(rows[0].id_cliente) : null;
  }

  async obtenerVeterinarioPorUsuario(
    idUsuario: number
  ): Promise<number | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT v.id_veterinario
       FROM Veterinario v
       INNER JOIN Usuario u ON u.id_usuario = v.id_usuario
       WHERE v.id_usuario = ? AND u.activo = 1
       LIMIT 1`,
      [idUsuario]
    );

    return rows.length ? Number(rows[0].id_veterinario) : null;
  }

  async listarTurnosCliente(idCliente: number): Promise<RowDataPacket[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT
         t.id_turno,
         t.fecha_hora,
         t.motivo,
         t.observaciones,
         m.id_mascota,
         m.nombre AS nombre_mascota,
         v.id_veterinario,
         uv.nombre AS nombre_veterinario,
         uv.apellido AS apellido_veterinario,
         e.nombre AS estado
       FROM Turno t
       INNER JOIN Mascota m ON m.id_mascota = t.id_mascota
       INNER JOIN Veterinario v ON v.id_veterinario = t.id_veterinario
       INNER JOIN Usuario uv ON uv.id_usuario = v.id_usuario
       INNER JOIN EstadoTurno e ON e.id_estado_turno = t.id_estado_turno
       WHERE m.id_cliente = ?
         AND t.fecha_hora >= NOW()
         AND UPPER(e.nombre) IN ('PENDIENTE', 'APROBADO')
       ORDER BY t.fecha_hora ASC`,
      [idCliente]
    );

    return rows;
  }

  async listarTurnosVeterinario(
    idVeterinario: number
  ): Promise<RowDataPacket[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT
         t.id_turno,
         t.fecha_hora,
         t.motivo,
         t.observaciones,
         m.id_mascota,
         m.nombre AS nombre_mascota,
         c.id_cliente,
         uc.nombre AS nombre_cliente,
         uc.apellido AS apellido_cliente,
         e.nombre AS estado
       FROM Turno t
       INNER JOIN Mascota m ON m.id_mascota = t.id_mascota
       INNER JOIN Cliente c ON c.id_cliente = m.id_cliente
       INNER JOIN Usuario uc ON uc.id_usuario = c.id_usuario
       INNER JOIN EstadoTurno e ON e.id_estado_turno = t.id_estado_turno
       WHERE t.id_veterinario = ?
       ORDER BY t.fecha_hora ASC`,
      [idVeterinario]
    );

    return rows;
  }

  async listarTodosLosTurnos(): Promise<RowDataPacket[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT
         t.id_turno,
         t.fecha_hora,
         t.motivo,
         t.observaciones,
         m.id_mascota,
         m.nombre AS nombre_mascota,
         c.id_cliente,
         uc.nombre AS nombre_cliente,
         uc.apellido AS apellido_cliente,
         v.id_veterinario,
         uv.nombre AS nombre_veterinario,
         uv.apellido AS apellido_veterinario,
         e.id_estado_turno,
         e.nombre AS estado
       FROM Turno t
       INNER JOIN Mascota m ON m.id_mascota = t.id_mascota
       INNER JOIN Cliente c ON c.id_cliente = m.id_cliente
       INNER JOIN Usuario uc ON uc.id_usuario = c.id_usuario
       INNER JOIN Veterinario v ON v.id_veterinario = t.id_veterinario
       INNER JOIN Usuario uv ON uv.id_usuario = v.id_usuario
       INNER JOIN EstadoTurno e ON e.id_estado_turno = t.id_estado_turno
       ORDER BY t.fecha_hora ASC`
    );

    return rows;
  }

  async obtenerTurnoParaGestion(
    idTurno: number
  ): Promise<TurnoGestion | null> {
    const [rows] = await pool.query<TurnoGestion[]>(
      `SELECT
         t.id_turno,
         t.id_mascota,
         m.id_cliente,
         t.id_veterinario,
         t.fecha_hora,
         e.nombre AS estado
       FROM Turno t
       INNER JOIN Mascota m ON m.id_mascota = t.id_mascota
       INNER JOIN EstadoTurno e ON e.id_estado_turno = t.id_estado_turno
       WHERE t.id_turno = ?
       LIMIT 1`,
      [idTurno]
    );

    return rows[0] ?? null;
  }

  async actualizarEstadoTurno(
    idTurno: number,
    idEstado: number
  ): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE Turno
       SET id_estado_turno = ?
       WHERE id_turno = ?`,
      [idEstado, idTurno]
    );

    return result.affectedRows > 0;
  }

}

export default new TurnosRepository();
