
import pool from '../../config/db';
import {
    CrearMascotaDTO,
    ActualizarMascotaDTO
} from './mascotas.dto';

export class MascotasRepository {

    // ==========================================
    // UTILIDADES DE IDENTIDAD
    // ==========================================

    // RN-07: Obtiene el cliente asociado a un usuario activo.
    static async obtenerClienteActivoPorUsuario(idUsuario: number): Promise<number | null> {
        const [rows]: any = await pool.query(
            `SELECT c.id_cliente
             FROM Cliente c
             INNER JOIN Usuario u ON u.id_usuario = c.id_usuario
             WHERE c.id_usuario = ?
             AND u.activo = 1
             LIMIT 1`,
            [idUsuario]
        );

        return rows.length > 0 ? rows[0].id_cliente : null;
    }

    // Verifica que un cliente exista y su usuario esté activo.
    static async obtenerClienteActivoPorId(idCliente: number): Promise<number | null> {
        const [rows]: any = await pool.query(
            `SELECT c.id_cliente
             FROM Cliente c
             INNER JOIN Usuario u ON u.id_usuario = c.id_usuario
             WHERE c.id_cliente = ?
             AND u.activo = 1
             LIMIT 1`,
            [idCliente]
        );

        return rows.length > 0 ? rows[0].id_cliente : null;
    }

    // Obtiene el nombre del rol desde el catálogo, sin asumir IDs.
    static async obtenerNombreRolPorId(idRol: number): Promise<string | null> {
        const [rows]: any = await pool.query(
            `SELECT nombre
             FROM Rol
             WHERE id_rol = ?
             LIMIT 1`,
            [idRol]
        );

        return rows.length > 0 ? rows[0].nombre : null;
    }

    // ==========================================
    // MÉTODOS DE LECTURA
    // ==========================================

    static async obtenerTodas(): Promise<any[]> {
        const [rows] = await pool.query(
            `SELECT m.id_mascota, m.id_cliente, m.nombre, m.especie,
                    m.raza, m.fecha_nacimiento, m.sexo, m.observaciones,
                    m.activo, m.fecha_creacion, u.id_usuario AS cliente_id_usuario,
                    u.nombre AS cliente_nombre, u.apellido AS cliente_apellido,
                    u.numero_documento AS cliente_numero_documento
             FROM Mascota m
             INNER JOIN Cliente c ON c.id_cliente = m.id_cliente
             INNER JOIN Usuario u ON u.id_usuario = c.id_usuario`
        );

        return rows as any[];
    }

    static async obtenerPorId(id: string): Promise<any> {
        const [rows]: any = await pool.query(
            `SELECT m.id_mascota, m.id_cliente, m.nombre, m.especie,
                    m.raza, m.fecha_nacimiento, m.sexo, m.observaciones,
                    m.activo, m.fecha_creacion, u.id_usuario AS cliente_id_usuario,
                    u.nombre AS cliente_nombre, u.apellido AS cliente_apellido,
                    u.numero_documento AS cliente_numero_documento
             FROM Mascota m
             INNER JOIN Cliente c ON c.id_cliente = m.id_cliente
             INNER JOIN Usuario u ON u.id_usuario = c.id_usuario
             WHERE m.id_mascota = ?`,
            [id]
        );

        return rows.length > 0 ? rows[0] : null;
    }

    static async obtenerPorCliente(idCliente: number): Promise<any[]> {
        const [rows] = await pool.query(
            `SELECT m.id_mascota, m.id_cliente, m.nombre, m.especie,
                    m.raza, m.fecha_nacimiento, m.sexo, m.observaciones,
                    m.activo, u.id_usuario AS cliente_id_usuario,
                    u.nombre AS cliente_nombre, u.apellido AS cliente_apellido,
                    u.numero_documento AS cliente_numero_documento
             FROM Mascota m
             INNER JOIN Cliente c ON c.id_cliente = m.id_cliente
             INNER JOIN Usuario u ON u.id_usuario = c.id_usuario
             WHERE m.id_cliente = ?
             AND m.activo = 1`,
            [idCliente]
        );

        return rows as any[];
    }

    // ==========================================
    // MÉTODOS DE ESCRITURA
    // ==========================================

    static async crear(mascota: CrearMascotaDTO): Promise<number> {
        const [result]: any = await pool.query(
            `INSERT INTO Mascota
                (id_cliente, nombre, especie, raza,
                 fecha_nacimiento, sexo, observaciones)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                mascota.id_cliente,
                mascota.nombre,
                mascota.especie,
                mascota.raza || null,
                mascota.fecha_nacimiento || null,
                mascota.sexo,
                mascota.observaciones || null
            ]
        );

        return result.insertId;
    }

    static async actualizar(
        id: string,
        mascota: ActualizarMascotaDTO
    ): Promise<boolean> {
        const camposAActualizar: string[] = [];
        const valores: any[] = [];

        if (mascota.nombre !== undefined) {
            camposAActualizar.push('nombre = ?');
            valores.push(mascota.nombre);
        }

        if (mascota.especie !== undefined) {
            camposAActualizar.push('especie = ?');
            valores.push(mascota.especie);
        }

        if (mascota.raza !== undefined) {
            camposAActualizar.push('raza = ?');
            valores.push(mascota.raza);
        }

        if (mascota.fecha_nacimiento !== undefined) {
            camposAActualizar.push('fecha_nacimiento = ?');
            valores.push(mascota.fecha_nacimiento);
        }

        if (mascota.sexo !== undefined) {
            camposAActualizar.push('sexo = ?');
            valores.push(mascota.sexo);
        }

        if (mascota.observaciones !== undefined) {
            camposAActualizar.push('observaciones = ?');
            valores.push(mascota.observaciones);
        }

        if (camposAActualizar.length === 0) {
            return false;
        }

        valores.push(id);

        const query = `
            UPDATE Mascota
            SET ${camposAActualizar.join(', ')}
            WHERE id_mascota = ?
            AND activo = 1
        `;

        const [result]: any = await pool.query(query, valores);

        return result.affectedRows > 0;
    }

    // ==========================================
    // BAJA LÓGICA
    // ==========================================

    // RN-10 y HU-VET-05: Baja lógica y cancelación de turnos futuros.
    static async eliminarLogicamenteConCascada(
        idMascota: string
    ): Promise<boolean> {
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            const [resultMascota]: any = await connection.query(
                `UPDATE Mascota
                 SET activo = 0
                 WHERE id_mascota = ?
                 AND activo = 1`,
                [idMascota]
            );

            if (resultMascota.affectedRows === 0) {
                await connection.rollback();
                return false;
            }

            // Se consultan los estados desde el catálogo.
            await connection.query(
                `UPDATE Turno t
                 INNER JOIN EstadoTurno et
                    ON et.id_estado_turno = t.id_estado_turno
                 SET t.id_estado_turno = (
                    SELECT id_estado_turno
                    FROM EstadoTurno
                    WHERE LOWER(nombre) = 'cancelado'
                    LIMIT 1
                 ),
                 t.fecha_actualizacion = NOW()
                 WHERE t.id_mascota = ?
                 AND LOWER(et.nombre) IN ('pendiente', 'aprobado')
                 AND t.fecha_hora > NOW()`,
                [idMascota]
            );

            await connection.commit();
            return true;

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}
