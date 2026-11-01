import pool from '../../config/db';
import { CrearMascotaDTO, ActualizarMascotaDTO } from './mascotas.dto';

export class MascotasRepository {

    // ==========================================
    // UTILIDADES DE IDENTIDAD
    // ==========================================

    // RN-07: Resuelve el id_cliente a partir del id_usuario del token
    static async obtenerIdClientePorUsuario(idUsuario: number): Promise<number | null> {
        const [rows]: any = await pool.query(`
            SELECT id_cliente FROM Cliente WHERE id_usuario = ?
        `, [idUsuario]);
        return rows.length > 0 ? rows[0].id_cliente : null;
    }

    // ==========================================
    // MÉTODOS DE LECTURA 
    // ==========================================

    static async obtenerTodas(): Promise<any[]> {
        const [rows] = await pool.query(`
            SELECT id_mascota, id_cliente, nombre, especie, raza, fecha_nacimiento, sexo, observaciones, activo, fecha_creacion 
            FROM Mascota WHERE activo = 1
        `);
        return rows as any[];
    }

    static async obtenerPorId(id: string): Promise<any> {
        const [rows]: any = await pool.query(`
            SELECT id_mascota, id_cliente, nombre, especie, raza, fecha_nacimiento, sexo, observaciones, activo, fecha_creacion 
            FROM Mascota WHERE id_mascota = ? AND activo = 1
        `, [id]);
        return rows.length > 0 ? rows[0] : null;
    }

    static async obtenerPorCliente(idCliente: number): Promise<any[]> {
        const [rows] = await pool.query(`
            SELECT id_mascota, id_cliente, nombre, especie, raza, fecha_nacimiento, sexo, observaciones, activo 
            FROM Mascota WHERE id_cliente = ? AND activo = 1
        `, [idCliente]);
        return rows as any[];
    }

    // ==========================================
    // MÉTODOS DE ESCRITURA Y BAJA (CASCADA)
    // ==========================================

    static async crear(mascota: CrearMascotaDTO): Promise<number> {
        const [result]: any = await pool.query(`
            INSERT INTO Mascota (id_cliente, nombre, especie, raza, fecha_nacimiento, sexo, observaciones) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            mascota.id_cliente, mascota.nombre, mascota.especie,
            mascota.raza || null, mascota.fecha_nacimiento || null,
            mascota.sexo, mascota.observaciones || null
        ]);
        return result.insertId;
    }

    static async actualizar(id: string, mascota: ActualizarMascotaDTO): Promise<boolean> {
        const camposAActualizar: string[] = [];
        const valores: any[] = [];

        if (mascota.nombre !== undefined) { camposAActualizar.push('nombre = ?'); valores.push(mascota.nombre); }
        if (mascota.especie !== undefined) { camposAActualizar.push('especie = ?'); valores.push(mascota.especie); }
        if (mascota.raza !== undefined) { camposAActualizar.push('raza = ?'); valores.push(mascota.raza); }
        if (mascota.fecha_nacimiento !== undefined) { camposAActualizar.push('fecha_nacimiento = ?'); valores.push(mascota.fecha_nacimiento); }
        if (mascota.sexo !== undefined) { camposAActualizar.push('sexo = ?'); valores.push(mascota.sexo); }
        if (mascota.observaciones !== undefined) { camposAActualizar.push('observaciones = ?'); valores.push(mascota.observaciones); }

        if (camposAActualizar.length === 0) return false;

        valores.push(id);
        const query = `UPDATE Mascota SET ${camposAActualizar.join(', ')} WHERE id_mascota = ? AND activo = 1`;

        const [result]: any = await pool.query(query, valores);
        return result.affectedRows > 0;
    }

    // RN-10 y HU-VET-05: Baja lógica en cascada (Cancela turnos futuros)
    static async eliminarLogicamenteConCascada(idMascota: string): Promise<boolean> {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // 1. Dar de baja la mascota
            const [resultMascota]: any = await connection.query(`
                UPDATE Mascota SET activo = 0 WHERE id_mascota = ?
            `, [idMascota]);

            if (resultMascota.affectedRows === 0) {
                await connection.rollback();
                return false;
            }

            // 2. Cancelar turnos futuros asociados (id_estado_turno: 1=Pendiente, 2=Aprobado, 4=Cancelado)
            await connection.query(`
                UPDATE Turno 
                SET id_estado_turno = 4, fecha_actualizacion = NOW() 
                WHERE id_mascota = ? 
                AND id_estado_turno IN (1, 2) 
                AND fecha_hora > NOW()
            `, [idMascota]);

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