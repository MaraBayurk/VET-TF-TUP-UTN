import pool from '../../config/db';
import { CrearUsuarioDTO } from './usuarios.dto';

export class UsuariosRepository {
    
    // Move Method: Trasladamos la lectura de todos los usuarios
    static async obtenerTodos(): Promise<any[]> {
        const [rows] = await pool.query(`
            SELECT id_usuario, nombre, apellido, numero_documento, email, telefono, id_rol, activo, fecha_creacion 
            FROM Usuario 
            WHERE activo = 1
        `);
        return rows as any[];
    }

    // Move Method: Trasladamos la lectura por ID
    static async obtenerPorId(id: string): Promise<any> {
        const [rows]: any = await pool.query(`
            SELECT id_usuario, nombre, apellido, numero_documento, email, telefono, id_rol, activo, fecha_creacion 
            FROM Usuario 
            WHERE id_usuario = ? AND activo = 1
        `, [id]);
        
        return (rows as any[]).length > 0 ? rows[0] : null;
    }
    
    // Move Method + Introduce Parameter Object + TRANSACCIÓN SQL
    static async crear(usuario: CrearUsuarioDTO): Promise<number> {
        // Obtenemos una conexión exclusiva para aislar la transacción
        const connection = await pool.getConnection(); 
        
        try {
            await connection.beginTransaction();

            // 1. Insertar el registro base en la tabla Usuario
            const [resultUsuario]: any = await connection.query(`
                INSERT INTO Usuario (nombre, apellido, numero_documento, email, password_hash, telefono, id_rol) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [
                usuario.nombre, usuario.apellido, usuario.numero_documento, 
                usuario.email, usuario.password_hash, usuario.telefono || null, usuario.id_rol
            ]);
            
            const idUsuario = resultUsuario.insertId;

            // 2. Insertar en la tabla derivada correspondiente
            if (usuario.id_rol === 2) { 
                // Es Cliente
                await connection.query(`
                    INSERT INTO Cliente (id_usuario, direccion) VALUES (?, ?)
                `, [idUsuario, usuario.direccion || null]);
                
            } else if (usuario.id_rol === 3) { 
                // Es Veterinario
                if (!usuario.matricula || !usuario.id_especialidad) {
                    throw new Error('MISSING_VET_DATA');
                }
                await connection.query(`
                    INSERT INTO Veterinario (id_usuario, matricula, id_especialidad) VALUES (?, ?, ?)
                `, [idUsuario, usuario.matricula, usuario.id_especialidad]);
            }

            // Si llegamos hasta acá sin errores, confirmamos todos los cambios a la vez
            await connection.commit();
            return idUsuario;

        } catch (error: any) {
            // Hubo un error, deshacemos todo para evitar registros "zombies" o huérfanos
            await connection.rollback(); 
            
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('DUPLICATE_ENTRY');
            }
            throw error; 
        } finally {
            // Siempre debemos liberar la conexión al pool
            connection.release(); 
        }
    }

    // Move Method: Lógica de actualización encapsulada (Baja Lógica / RN-01)
    static async eliminarLogicamente(id: string): Promise<boolean> {
        const [result]: any = await pool.query(`
            UPDATE Usuario SET activo = 0 WHERE id_usuario = ?
        `, [id]);
        
        // Retornamos true si se modificó alguna fila, false si el id no existía
        return result.affectedRows > 0;
    }
}