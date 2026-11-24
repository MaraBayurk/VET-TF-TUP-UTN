
import pool from '../../config/db';
import { CrearUsuarioDTO, ActualizarPerfilDTO, ActualizarUsuarioDTO } from './usuarios.dto';
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
            SELECT u.id_usuario, u.nombre, u.apellido, u.numero_documento, u.email, u.telefono,
                   u.id_rol, r.nombre AS rol, u.activo, u.fecha_creacion,
                   c.direccion, v.id_veterinario, v.matricula,
                   v.id_especialidad, e.nombre AS especialidad
            FROM Usuario u
            INNER JOIN Rol r ON r.id_rol = u.id_rol
            LEFT JOIN Cliente c ON c.id_usuario = u.id_usuario
            LEFT JOIN Veterinario v ON v.id_usuario = u.id_usuario
            LEFT JOIN Especialidad e ON e.id_especialidad = v.id_especialidad
            WHERE u.activo = 1
              AND LOWER(r.nombre) IN ('administrador', 'veterinario')
            ORDER BY u.apellido, u.nombre
        `);

        return rows as any[];
    }

    async obtenerPorId(id: string): Promise<any> {
        const [rows]: any = await pool.query(`
            SELECT u.id_usuario, u.nombre, u.apellido, u.numero_documento, u.email, u.telefono,
                   u.id_rol, r.nombre AS rol, u.activo, u.fecha_creacion,
                   c.direccion, v.id_veterinario, v.matricula,
                   v.id_especialidad, e.nombre AS especialidad
            FROM Usuario u
            INNER JOIN Rol r ON r.id_rol = u.id_rol
            LEFT JOIN Cliente c ON c.id_usuario = u.id_usuario
            LEFT JOIN Veterinario v ON v.id_usuario = u.id_usuario
            LEFT JOIN Especialidad e ON e.id_especialidad = v.id_especialidad
            WHERE u.id_usuario = ?
              AND u.activo = 1
              AND LOWER(r.nombre) IN ('administrador', 'veterinario')
        `, [id]);

        return (rows as any[]).length > 0 ? rows[0] : null;
    }

    // Cumple con RN-01: Baja lógica
    async eliminarLogicamente(id: string): Promise<boolean> {
        const [result]: any = await pool.query(`
            UPDATE Usuario u
            INNER JOIN Rol r ON r.id_rol = u.id_rol
            SET u.activo = 0
            WHERE u.id_usuario = ? AND u.activo = 1
              AND LOWER(r.nombre) IN ('administrador', 'veterinario')
        `, [id]);

        return result.affectedRows > 0;
    }

    async obtenerRoles(): Promise<any[]> {
        const [rows] = await pool.query(
            "SELECT id_rol, nombre FROM Rol WHERE LOWER(nombre) IN ('administrador', 'veterinario') ORDER BY id_rol"
        );

        return rows as any[];
    }

    async obtenerEspecialidades(): Promise<any[]> {
        const [rows] = await pool.query(
            'SELECT id_especialidad, nombre FROM Especialidad WHERE activo = 1 ORDER BY nombre'
        );

        return rows as any[];
    }

    private async validarEspecialidadActiva(connection: any, idEspecialidad: number): Promise<void> {
        const [rows]: any = await connection.query(
            'SELECT id_especialidad FROM Especialidad WHERE id_especialidad = ? AND activo = 1 LIMIT 1',
            [idEspecialidad]
        );

        if (!rows.length) throw new Error('SPECIALTY_NOT_FOUND');
    }

    async actualizar(id: string, usuario: ActualizarUsuarioDTO): Promise<boolean> {
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            const [actualRows]: any = await connection.query(
                `SELECT u.id_rol, r.nombre AS rol
                 FROM Usuario u
                 JOIN Rol r ON r.id_rol = u.id_rol
                 WHERE u.id_usuario = ? AND u.activo = 1
                 FOR UPDATE`,
                [id]
            );

            if (!actualRows.length) {
                await connection.rollback();
                return false;
            }

            const nuevoRol = await this.obtenerNombreRol(connection, usuario.id_rol);

            if (!nuevoRol || !['administrador', 'veterinario'].includes(nuevoRol)) {
                throw new Error('ROLE_NOT_SUPPORTED');
            }

            const rolAnterior = String(actualRows[0].rol).toLowerCase();

            if (rolAnterior !== nuevoRol) {
                throw new Error('ROLE_CHANGE_NOT_SUPPORTED');
            }

            if (nuevoRol === 'veterinario') {
                if (!usuario.matricula || !usuario.id_especialidad) {
                    throw new Error('MISSING_VET_DATA');
                }

                await this.validarEspecialidadActiva(connection, usuario.id_especialidad);
            }

            await connection.query(
                `UPDATE Usuario
                 SET nombre = ?, apellido = ?, numero_documento = ?, email = ?,
                     telefono = ?, id_rol = ?${usuario.password_hash ? ', password_hash = ?' : ''}
                 WHERE id_usuario = ?`,
                usuario.password_hash
                    ? [
                        usuario.nombre,
                        usuario.apellido,
                        usuario.numero_documento,
                        usuario.email,
                        usuario.telefono || null,
                        usuario.id_rol,
                        usuario.password_hash,
                        id
                    ]
                    : [
                        usuario.nombre,
                        usuario.apellido,
                        usuario.numero_documento,
                        usuario.email,
                        usuario.telefono || null,
                        usuario.id_rol,
                        id
                    ]
            );

            if (nuevoRol === 'veterinario') {
                await connection.query(
                    'UPDATE Veterinario SET matricula = ?, id_especialidad = ? WHERE id_usuario = ?',
                    [usuario.matricula, usuario.id_especialidad, id]
                );
            }

            await connection.commit();
            return true;
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
    // EXTRACT METHOD (Funciones auxiliares privadas)
    // ==========================================

    private async insertarCliente(
        connection: any,
        idUsuario: number,
        direccion?: string
    ): Promise<void> {
        await connection.query(
            'INSERT INTO Cliente (id_usuario, direccion) VALUES (?, ?)',
            [idUsuario, direccion || null]
        );
    }

    private async insertarVeterinario(
        connection: any,
        idUsuario: number,
        matricula?: string,
        idEspecialidad?: number
    ): Promise<void> {
        if (!matricula || !idEspecialidad) {
            throw new Error('MISSING_VET_DATA');
        }

        await this.validarEspecialidadActiva(connection, idEspecialidad);

        await connection.query(
            `INSERT INTO Veterinario (id_usuario, matricula, id_especialidad)
             VALUES (?, ?, ?)`,
            [idUsuario, matricula, idEspecialidad]
        );
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

            if (!['administrador', 'veterinario'].includes(nombreRol)) {
                throw new Error('ROLE_NOT_SUPPORTED');
            }

            // 1. Insertar el registro base en la tabla Usuario
            const [resultUsuario]: any = await connection.query(
                `INSERT INTO Usuario
                    (nombre, apellido, numero_documento, email, password_hash, telefono, id_rol)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    usuario.nombre,
                    usuario.apellido,
                    usuario.numero_documento,
                    usuario.email,
                    usuario.password_hash,
                    usuario.telefono || null,
                    usuario.id_rol
                ]
            );

            const idUsuario = resultUsuario.insertId;

            // 2. Delegar la inserción de las tablas hijas
            if (nombreRol === 'cliente') {
                await this.insertarCliente(connection, idUsuario, usuario.direccion);
            } else if (nombreRol === 'veterinario') {
                await this.insertarVeterinario(
                    connection,
                    idUsuario,
                    usuario.matricula,
                    usuario.id_especialidad
                );
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

    async actualizarPerfil(
        idUsuario: number,
        datos: ActualizarPerfilDTO
    ): Promise<void> {
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            const [usuarios]: any = await connection.query(`
                SELECT r.nombre
                FROM Usuario u
                INNER JOIN Rol r ON r.id_rol = u.id_rol
                WHERE u.id_usuario = ? AND u.activo = 1
                LIMIT 1
                FOR UPDATE
            `, [idUsuario]);

            if (usuarios.length === 0) {
                throw new Error('USER_NOT_FOUND');
            }

            const nombreRol = String(usuarios[0].nombre).toLowerCase();

            if (nombreRol === 'cliente') {
                const [perfiles]: any = await connection.query(
                    'SELECT id_cliente FROM Cliente WHERE id_usuario = ? LIMIT 1',
                    [idUsuario]
                );

                if (perfiles.length === 0) {
                    throw new Error('PROFILE_MISMATCH');
                }
            } else if (nombreRol === 'veterinario') {
                const [perfiles]: any = await connection.query(
                    'SELECT id_veterinario FROM Veterinario WHERE id_usuario = ? LIMIT 1',
                    [idUsuario]
                );

                if (perfiles.length === 0) {
                    throw new Error('PROFILE_MISMATCH');
                }
            } else if (nombreRol !== 'administrador') {
                throw new Error('ROLE_NOT_SUPPORTED');
            }

            // Actualizar el teléfono en la tabla base Usuario
            if (datos.telefono !== undefined) {
                await connection.query(
                    'UPDATE Usuario SET telefono = ? WHERE id_usuario = ?',
                    [datos.telefono, idUsuario]
                );
            }

            // Actualizar la dirección solo para perfiles Cliente
            if (nombreRol === 'cliente' && datos.direccion !== undefined) {
                await connection.query(
                    'UPDATE Cliente SET direccion = ? WHERE id_usuario = ?',
                    [datos.direccion, idUsuario]
                );
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

