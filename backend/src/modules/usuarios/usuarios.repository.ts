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

    // Move Method + Introduce Parameter Object
    static async crear(usuario: CrearUsuarioDTO): Promise<number> {
        try {
            const [result]: any = await pool.query(`
                INSERT INTO Usuario (nombre, apellido, numero_documento, email, password_hash, telefono, id_rol) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [
                usuario.nombre, 
                usuario.apellido, 
                usuario.numero_documento, 
                usuario.email, 
                usuario.password_hash, 
                usuario.telefono || null, 
                usuario.id_rol
            ]);
            
            return result.insertId;
        } catch (error: any) {
            // Manejo de Errores Estandarizado: Ocultamos los detalles de MariaDB
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('DUPLICATE_ENTRY');
            }
            throw error; // Propagamos cualquier otro error inesperado
        }
    }
}