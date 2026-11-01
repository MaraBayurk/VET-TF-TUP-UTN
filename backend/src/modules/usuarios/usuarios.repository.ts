import pool from '../../config/db';
import { CrearUsuarioDTO } from './usuarios.dto';

export class UsuariosRepository {
    

    // MÉTODOS DE LECTURA Y BAJA LÓGICA

    static async obtenerTodos(): Promise<any[]> {
        const [rows] = await pool.query(`
            SELECT id_usuario, nombre, apellido, numero_documento, email, telefono, id_rol, activo, fecha_creacion 
            FROM Usuario 
            WHERE activo = 1
        `);
        return rows as any[];
    }

    static async obtenerPorId(id: string): Promise<any> {
        const [rows]: any = await pool.query(`
            SELECT id_usuario, nombre, apellido, numero_documento, email, telefono, id_rol, activo, fecha_creacion 
            FROM Usuario 
            WHERE id_usuario = ? AND activo = 1
        `, [id]);
        
        return (rows as any[]).length > 0 ? rows[0] : null;
    }

    // Cumple con RN-01: Baja lógica
    static async eliminarLogicamente(id: string): Promise<boolean> {
        const [result]: any = await pool.query(`
            UPDATE Usuario SET activo = 0 WHERE id_usuario = ?
        `, [id]);
        
        return result.affectedRows > 0;
    }


    // EXTRACT METHOD (Funciones auxiliares privadas)
    
    private static async insertarCliente(connection: any, idUsuario: number, direccion?: string): Promise<void> {
        await connection.query(`
            INSERT INTO Cliente (id_usuario, direccion) VALUES (?, ?)
        `, [idUsuario, direccion || null]);
    }

    private static async insertarVeterinario(connection: any, idUsuario: number, matricula?: string, idEspecialidad?: number): Promise<void> {
        if (!matricula || !idEspecialidad) {
            throw new Error('MISSING_VET_DATA');
        }
        await connection.query(`
            INSERT INTO Veterinario (id_usuario, matricula, id_especialidad) VALUES (?, ?, ?)
        `, [idUsuario, matricula, idEspecialidad]);
    }

    // MÉTODO PRINCIPAL DE CREACIÓN CON TRANSACCIÓN
    
    static async crear(usuario: CrearUsuarioDTO): Promise<number> {
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

            // 2. Extract Method: Delegamos la inserción de las tablas hijas
            if (usuario.id_rol === 2) { 
                await this.insertarCliente(connection, idUsuario, usuario.direccion);
            } else if (usuario.id_rol === 3) { 
                await this.insertarVeterinario(connection, idUsuario, usuario.matricula, usuario.id_especialidad);
            }

            // 3. Confirmar la transacción
            await connection.commit();
            return idUsuario;

        } catch (error: any) {
            await connection.rollback(); 
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('DUPLICATE_ENTRY');
            }
            throw error; 
        } finally {
            connection.release(); 
        }
    }
}