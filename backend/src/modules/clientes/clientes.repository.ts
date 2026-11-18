import pool from '../../config/db';

export interface ClienteInput {
  nombre: string;
  apellido: string;
  numero_documento: string;
  email: string;
  telefono: string;
  direccion: string;
  password_hash?: string;
}

export class ClientesRepository {
  async obtenerTodos(): Promise<any[]> {
    const [rows] = await pool.query(`
      SELECT c.id_cliente, u.id_usuario, u.nombre, u.apellido, u.numero_documento,
             u.email, u.telefono, c.direccion, u.activo,
             u.fecha_creacion,
             COUNT(DISTINCT CASE WHEN m.activo = 1 THEN m.id_mascota END) AS cantidad_mascotas,
             COUNT(DISTINCT t.id_turno) AS cantidad_turnos
      FROM Cliente c
      INNER JOIN Usuario u ON u.id_usuario = c.id_usuario
      INNER JOIN Rol r ON r.id_rol = u.id_rol AND LOWER(r.nombre) = 'cliente'
      LEFT JOIN Mascota m ON m.id_cliente = c.id_cliente
      LEFT JOIN Turno t ON t.id_mascota = m.id_mascota
      GROUP BY c.id_cliente, u.id_usuario, u.nombre, u.apellido, u.numero_documento,
               u.email, u.telefono, c.direccion, u.activo, u.fecha_creacion
      ORDER BY u.apellido, u.nombre`);
    return rows as any[];
  }

  async obtenerPorId(id: string): Promise<any | null> {
    const [clientes]: any = await pool.query(`
      SELECT c.id_cliente, u.id_usuario, u.nombre, u.apellido, u.numero_documento,
             u.email, u.telefono, c.direccion, u.activo,
             u.fecha_creacion
      FROM Cliente c
      INNER JOIN Usuario u ON u.id_usuario = c.id_usuario
      INNER JOIN Rol r ON r.id_rol = u.id_rol AND LOWER(r.nombre) = 'cliente'
      WHERE c.id_cliente = ? LIMIT 1`, [id]);
    if (!clientes.length) return null;

    const [mascotas] = await pool.query(`
      SELECT id_mascota, nombre, especie, raza, fecha_nacimiento, sexo, activo
      FROM Mascota WHERE id_cliente = ? ORDER BY activo DESC, nombre`, [id]);
    const [turnos] = await pool.query(`
      SELECT t.id_turno, t.fecha_hora, t.motivo, t.observaciones,
             m.id_mascota, m.nombre AS nombre_mascota, e.nombre AS estado,
             uv.nombre AS nombre_veterinario, uv.apellido AS apellido_veterinario
      FROM Turno t
      INNER JOIN Mascota m ON m.id_mascota = t.id_mascota
      INNER JOIN EstadoTurno e ON e.id_estado_turno = t.id_estado_turno
      INNER JOIN Veterinario v ON v.id_veterinario = t.id_veterinario
      INNER JOIN Usuario uv ON uv.id_usuario = v.id_usuario
      WHERE m.id_cliente = ? ORDER BY t.fecha_hora DESC LIMIT 10`, [id]);
    return { ...clientes[0], mascotas, turnos };
  }

  async crear(cliente: ClienteInput): Promise<number> {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [roles]: any = await connection.query("SELECT id_rol FROM Rol WHERE LOWER(nombre) = 'cliente' LIMIT 1");
      if (!roles.length) throw new Error('CLIENT_ROLE_NOT_FOUND');
      const [userResult]: any = await connection.query(`
        INSERT INTO Usuario (nombre, apellido, numero_documento, email, password_hash, telefono, id_rol)
        VALUES (?, ?, ?, ?, ?, ?, ?)`, [
        cliente.nombre, cliente.apellido, cliente.numero_documento, cliente.email,
        cliente.password_hash, cliente.telefono || null, roles[0].id_rol,
      ]);
      const [clientResult]: any = await connection.query(`
        INSERT INTO Cliente (id_usuario, direccion) VALUES (?, ?)`,
      [userResult.insertId, cliente.direccion || null]);
      await connection.commit();
      return Number(clientResult.insertId);
    } catch (error: any) {
      await connection.rollback();
      if (error.code === 'ER_DUP_ENTRY') throw new Error('DUPLICATE_ENTRY');
      throw error;
    } finally { connection.release(); }
  }

  async actualizar(id: string, cliente: ClienteInput): Promise<boolean> {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [rows]: any = await connection.query(`
        SELECT c.id_usuario FROM Cliente c
        INNER JOIN Usuario u ON u.id_usuario = c.id_usuario
        INNER JOIN Rol r ON r.id_rol = u.id_rol AND LOWER(r.nombre) = 'cliente'
        WHERE c.id_cliente = ? FOR UPDATE`, [id]);
      if (!rows.length) { await connection.rollback(); return false; }
      const idUsuario = rows[0].id_usuario;
      await connection.query(`UPDATE Usuario SET nombre = ?, apellido = ?, numero_documento = ?, email = ?, telefono = ?${cliente.password_hash ? ', password_hash = ?' : ''} WHERE id_usuario = ?`,
        cliente.password_hash
          ? [cliente.nombre, cliente.apellido, cliente.numero_documento, cliente.email, cliente.telefono || null, cliente.password_hash, idUsuario]
          : [cliente.nombre, cliente.apellido, cliente.numero_documento, cliente.email, cliente.telefono || null, idUsuario]);
      await connection.query('UPDATE Cliente SET direccion = ? WHERE id_cliente = ?',
        [cliente.direccion || null, id]);
      await connection.commit();
      return true;
    } catch (error: any) {
      await connection.rollback();
      if (error.code === 'ER_DUP_ENTRY') throw new Error('DUPLICATE_ENTRY');
      throw error;
    } finally { connection.release(); }
  }

  async darDeBaja(id: string): Promise<boolean> {
    const [result]: any = await pool.query(`
      UPDATE Usuario u
      INNER JOIN Cliente c ON c.id_usuario = u.id_usuario
      INNER JOIN Rol r ON r.id_rol = u.id_rol AND LOWER(r.nombre) = 'cliente'
      SET u.activo = 0 WHERE c.id_cliente = ? AND u.activo = 1`, [id]);
    return result.affectedRows > 0;
  }
}

export const clientesRepository = new ClientesRepository();
