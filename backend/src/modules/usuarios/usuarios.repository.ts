import pool from '../../config/db';
import { CrearUsuarioDTO, ActualizarPerfilDTO } from './usuarios.dto';
import { IUsuariosRepository } from './usuarios.repository.interface';

export class UsuariosRepository implements IUsuariosRepository {
    private async obtenerNombreRol(connection: any, idRol: number): Promise<string | null> {
        const [rows]: any = await connection.query(`
            SELECT nombre FROM Rol WHERE id_rol = ? LIMIT 1
        `, [idRol]);

        return rows.length > 0 ? String(rows[0].nombre).toLowerCase() : null;
    }

    // ==========================================
    // MÉTODOS DE LECTURA Y BAJA LÓGICA
    // ==========================================

     async obtenerTodos(): Promise<any[]> {
        const [rows] = await pool.query(`
            SELECT id_usuario, nombre, apellido, numero_documento, email, telefono, id_rol, activo, fecha_creacion 
            FROM Usuario 
            WHERE activo = 1
        `);
        return rows as any[];
    }

     async obtenerPorId(id: string): Promise<any> {
        const [rows]: any = await pool.query(`
            SELECT id_usuario, nombre, apellido, numero_documento, email, telefono, id_rol, activo, fecha_creacion 
            FROM Usuario 
            WHERE id_usuario = ? AND activo = 1
        `, [id]);
        
        return (rows as any[]).length > 0 ? rows[0] : null;
    }

    // Cumple con RN-01: Baja lógica
     async eliminarLogicamente(id: string): Promise<boolean> {
        const [result]: any = await pool.query(`
            UPDATE Usuario SET activo = 0 WHERE id_usuario = ?
        `, [id]);
        
        return result.affectedRows > 0;
    }

    // ==========================================
    // EXTRACT METHOD (Funciones auxiliares privadas)
    // ==========================================
    
    private async insertarCliente(connection: any, idUsuario: number, direccion?: string): Promise<void> {
        await connection.query(`
            INSERT INTO Cliente (id_usuario, direccion) VALUES (?, ?)
        `, [idUsuario, direccion || null]);
    }

    private async insertarVeterinario(connection: any, idUsuario: number, matricula?: string, idEspecialidad?: number): Promise<void> {
        if (!matricula || !idEspecialidad) {
            throw new Error('MISSING_VET_DATA');
        }
        await connection.query(`
            INSERT INTO Veterinario (id_usuario, matricula, id_especialidad) VALUES (?, ?, ?)
        `, [idUsuario, matricula, idEspecialidad]);
    }

    // ==========================================
    // MÉTODO PRINCIPAL DE CREACIÓN CON TRANSACCIÓN
    // ==========================================
    
     async crear(usuario: CrearUsuarioDTO): Promise<number> {
        const connection = await pool.getConnection(); 
        
        try {
            await connection.beginTransaction();

            const nombreRol = await this.obtenerNombreRol(connection, usuario.id_rol);
            if (!nombreRol) {
                throw new Error('ROLE_NOT_FOUND');
            }

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
            if (nombreRol === 'cliente') {
                await this.insertarCliente(connection, idUsuario, usuario.direccion);
            } else if (nombreRol === 'veterinario') {
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

    // ==========================================
    // ACTUALIZACIÓN DE PERFIL DEL USUARIO
    // ==========================================

     async actualizarPerfil(idUsuario: number, idRol: number, datos: ActualizarPerfilDTO): Promise<void> {
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            const nombreRol = await this.obtenerNombreRol(connection, idRol);

            // 1. Actualizamos el teléfono en la tabla base Usuario (si fue enviado)
            if (datos.telefono !== undefined) {
                await connection.query(`
                    UPDATE Usuario SET telefono = ? WHERE id_usuario = ?
                `, [datos.telefono, idUsuario]);
            }

            // 2. Actualizamos la dirección solo si el catálogo identifica al usuario como Cliente.
            if (nombreRol === 'cliente' && datos.direccion !== undefined) {
                await connection.query(`
                    UPDATE Cliente SET direccion = ? WHERE id_usuario = ?
                `, [datos.direccion, idUsuario]);
            }

            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}
