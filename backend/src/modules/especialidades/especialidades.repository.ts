import pool from '../../config/db';
import { CrearEspecialidadDTO, ActualizarEspecialidadDTO } from './especialidades.dto';

export class EspecialidadesRepository {

    // Obtener todas las especialidades activas
    static async obtenerTodas(): Promise<any[]> {
        const [rows] = await pool.query(`
            SELECT id_especialidad, nombre, descripcion, activo 
            FROM Especialidad 
            WHERE activo = 1
        `);
        return rows as any[];
    }

    // Obtener una especialidad por ID
    static async obtenerPorId(id: string): Promise<any> {
        const [rows]: any = await pool.query(`
            SELECT id_especialidad, nombre, descripcion, activo 
            FROM Especialidad 
            WHERE id_especialidad = ? AND activo = 1
        `, [id]);

        return (rows as any[]).length > 0 ? rows[0] : null;
    }

    // Crear nueva especialidad
    static async crear(especialidad: CrearEspecialidadDTO): Promise<number> {
        try {
            const [result]: any = await pool.query(`
                INSERT INTO Especialidad (nombre, descripcion) 
                VALUES (?, ?)
            `, [especialidad.nombre, especialidad.descripcion || null]);

            return result.insertId;
        } catch (error: any) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('DUPLICATE_NAME');
            }
            throw error;
        }
    }

    // Actualizar especialidad existente
    static async actualizar(id: string, especialidad: ActualizarEspecialidadDTO): Promise<boolean> {
        try {
            // Construimos la consulta dinámicamente según los campos enviados
            const camposAActualizar: string[] = [];
            const valores: any[] = [];

            if (especialidad.nombre !== undefined) {
                camposAActualizar.push('nombre = ?');
                valores.push(especialidad.nombre);
            }
            if (especialidad.descripcion !== undefined) {
                camposAActualizar.push('descripcion = ?');
                valores.push(especialidad.descripcion);
            }

            if (camposAActualizar.length === 0) return false;

            // Agregamos el ID al final del array de valores para el WHERE
            valores.push(id);

            const query = `UPDATE Especialidad SET ${camposAActualizar.join(', ')} WHERE id_especialidad = ? AND activo = 1`;

            const [result]: any = await pool.query(query, valores);
            return result.affectedRows > 0;

        } catch (error: any) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('DUPLICATE_NAME');
            }
            throw error;
        }
    }

    // Baja lógica (Soft Delete)
    static async eliminarLogicamente(id: string): Promise<boolean> {
        const [result]: any = await pool.query(`
            UPDATE Especialidad SET activo = 0 WHERE id_especialidad = ?
        `, [id]);

        return result.affectedRows > 0;
    }
}