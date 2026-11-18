
import { Request, Response } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';

import pool from '../../config/db';
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import 'dotenv/config';

import { encriptarPassword } from '../../utils/password.util';
import { authRepository } from './auth.repository';
import { RegistroClienteDTO } from './auth.dto';

// Busca un usuario activo por email
const obtenerUsuarioPorEmail = async (email: string): Promise<any> => {
    const [rows]: any = await pool.query(
        `SELECT u.*, r.nombre AS rol
         FROM Usuario u
         INNER JOIN Rol r ON r.id_rol = u.id_rol
         WHERE u.email = ? AND u.activo = 1`,
        [email]
    );

    return rows.length > 0 ? rows[0] : null;
};

// Genera el token JWT
const generarToken = (usuario: any): string => {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error('La variable JWT_SECRET no está configurada en el .env');
    }

    const payload = {
        id_usuario: usuario.id_usuario,
        id_rol: usuario.id_rol
    };

    const options: SignOptions = {
        expiresIn: (process.env.JWT_EXPIRES_IN || '2h') as any
    };

    return jwt.sign(payload, secret, options);
};

// REGISTRO PÚBLICO DE CLIENTES
export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            nombre,
            apellido,
            numero_documento,
            email,
            password,
            telefono
        } = req.body;

        // 1. Validar campos obligatorios
        if (
            typeof nombre !== 'string' ||
            typeof apellido !== 'string' ||
            typeof numero_documento !== 'string' ||
            typeof email !== 'string' ||
            typeof password !== 'string' ||
            !nombre.trim() ||
            !apellido.trim() ||
            !numero_documento.trim() ||
            !email.trim() ||
            !password
        ) {
            res.status(400).json({
                status: 'error',
                message: 'Nombre, apellido, documento, email y contraseña son obligatorios'
            });
            return;
        }

        // 2. Normalizar datos
        const datos: RegistroClienteDTO = {
            nombre: nombre.trim(),
            apellido: apellido.trim(),
            numero_documento: numero_documento.trim(),
            email: email.trim().toLowerCase(),
            password,
            telefono: typeof telefono === 'string' && telefono.trim()
                ? telefono.trim()
                : undefined
        };

        // 3. Validar formato de email
        const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.email);

        if (!emailValido) {
            res.status(400).json({
                status: 'error',
                message: 'El formato del email no es válido'
            });
            return;
        }

        // 4. Validar longitud mínima de contraseña
        if (datos.password.length < 8) {
            res.status(400).json({
                status: 'error',
                message: 'La contraseña debe tener al menos 8 caracteres'
            });
            return;
        }

        // 5. Validar longitud de documento
        if (datos.numero_documento.length > 20) {
            res.status(400).json({
                status: 'error',
                message: 'El documento no puede superar los 20 caracteres'
            });
            return;
        }

        // 6. Encriptar contraseña
        const password_hash = await encriptarPassword(datos.password);

        // 7. Crear usuario y perfil Cliente
        const id_usuario = await authRepository.registrarCliente({
            ...datos,
            password_hash
        });

        res.status(201).json({
            status: 'success',
            message: 'Cuenta de cliente creada exitosamente',
            data: { id_usuario }
        });

    } catch (error: any) {
        if (error.message === 'DUPLICATE_ENTRY') {
            res.status(409).json({
                status: 'error',
                message: 'El email o documento ya se encuentra registrado'
            });
            return;
        }

        if (error.message === 'CLIENT_ROLE_NOT_FOUND') {
            res.status(500).json({
                status: 'error',
                message: 'No se encuentra configurado el rol Cliente'
            });
            return;
        }

        console.error('Error al registrar cliente:', error);

        res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

// LOGIN
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({
                status: 'error',
                message: 'El email y la contraseña son obligatorios'
            });
            return;
        }

        const user = await obtenerUsuarioPorEmail(
            String(email).trim().toLowerCase()
        );

        if (!user) {
            res.status(401).json({
                status: 'error',
                message: 'Credenciales inválidas'
            });
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            res.status(401).json({
                status: 'error',
                message: 'Credenciales inválidas'
            });
            return;
        }

        const token = generarToken(user);

        res.status(200).json({
            status: 'success',
            message: 'Login exitoso',
            data: {
                user: {
                    id_usuario: user.id_usuario,
                    nombre: user.nombre,
                    apellido: user.apellido,
                    email: user.email,
                    id_rol: user.id_rol,
                    rol: user.rol
                },
                token
            }
        });

    } catch (error) {
        console.error('Error en el endpoint de login:', error);

        res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};


// ==========================================
// CONSULTAR USUARIO AUTENTICADO
// ==========================================

export const me = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const usuario = req.usuario;

        if (!usuario) {
            res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
            return;
        }

        const perfil = await authRepository.obtenerPerfilPorId(
            usuario.id_usuario
        );

        if (!perfil) {
            res.status(401).json({
                status: 'error',
                message: 'La sesión no es válida o el usuario se encuentra inactivo'
            });
            return;
        }

        res.status(200).json({
            status: 'success',
            data: perfil
        });

    } catch (error) {
        console.error('Error al consultar el usuario autenticado:', error);

        res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

// ==========================================
// CERRAR SESIÓN
// ==========================================

export const logout = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.usuario) {
            res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
            return;
        }

        res.status(200).json({
            status: 'success',
            message: 'Sesión cerrada correctamente. Elimine el token almacenado en el cliente.'
        });

    } catch (error) {
        console.error('Error al cerrar sesión:', error);

        res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};
