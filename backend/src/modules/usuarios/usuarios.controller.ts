import { Request, Response } from 'express';
import pool from '../../config/db';
import bcrypt from 'bcrypt';


// ENDPOINTS DE LECTURA (READ)

export const obtenerUsuarios = async (req: Request, res: Response): Promise<void> => {
    try {
        // Consultamos todos los usuarios.
        // Omitimos intencionalmente el password_hash en el SELECT por seguridad.
        const [rows] = await pool.query(`
            SELECT id_usuario, nombre, apellido, numero_documento, email, telefono, id_rol, activo, fecha_creacion 
            FROM Usuario 
            WHERE activo = 1
        `);

        res.status(200).json({
            status: 'success',
            data: rows
        });
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error al consultar la base de datos'
        });
    }
};

export const obtenerUsuarioPorId = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const [rows]: any = await pool.query(`
            SELECT id_usuario, nombre, apellido, numero_documento, email, telefono, id_rol, activo, fecha_creacion 
            FROM Usuario 
            WHERE id_usuario = ? AND activo = 1
        `, [id]);

        const usuarios = rows as any[];

        if (usuarios.length === 0) {
            res.status(404).json({
                status: 'error',
                message: 'Usuario no encontrado o inactivo'
            });
            return;
        }

        res.status(200).json({
            status: 'success',
            data: usuarios[0]
        });
    } catch (error) {
        console.error('Error al obtener el usuario:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error al consultar la base de datos'
        });
    }
};

// ENDPOINT DE CREACIÓN (CREATE)

export const crearUsuario = async (req: Request, res: Response): Promise<void> => {
    try {
        const { nombre, apellido, numero_documento, email, password, telefono, id_rol } = req.body;

        // 1. Validar campos obligatorios
        if (!nombre || !apellido || !numero_documento || !email || !password || !id_rol) {
            res.status(400).json({
                status: 'error',
                message: 'Faltan campos obligatorios'
            });
            return;
        }

        // 2. Encriptar la contraseña
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        // 3. Insertar el usuario en la base de datos
        const [result]: any = await pool.query(`
            INSERT INTO Usuario (nombre, apellido, numero_documento, email, password_hash, telefono, id_rol) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [nombre, apellido, numero_documento, email, password_hash, telefono || null, id_rol]);

        // Nota: Las extensiones para Cliente (id_rol = 2) y Veterinario (id_rol = 3) 
        // se manejarán en la siguiente iteración para no sobrecargar este controlador.

        res.status(201).json({
            status: 'success',
            message: 'Usuario creado exitosamente',
            data: {
                id_usuario: result.insertId
            }
        });
    } catch (error: any) {
        console.error('Error al crear usuario:', error);

        // Manejar el error específico de MariaDB cuando el email o documento ya existen (UNIQUE constraint)
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(409).json({
                status: 'error',
                message: 'El email o número de documento ya se encuentra registrado'
            });
            return;
        }

        res.status(500).json({
            status: 'error',
            message: 'Error al procesar la solicitud en la base de datos'
        });
    }
};