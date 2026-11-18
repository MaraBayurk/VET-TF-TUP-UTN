
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import pool from '../config/db';

export interface AuthRequest extends Request {
    usuario?: {
        id_usuario: number;
        id_rol: number;
    };
}

export const verificarToken = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
            status: 'error',
            message: 'Token de autenticación no proporcionado'
        });
        return;
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        res.status(500).json({
            status: 'error',
            message: 'Error de configuración del servidor'
        });
        return;
    }

    try {
        const payload = jwt.verify(token, secret) as {
            id_usuario: number;
            id_rol: number;
        };

        req.usuario = payload;
        next();

    } catch {
        res.status(401).json({
            status: 'error',
            message: 'Token inválido o expirado'
        });
    }
};

// Autoriza consultando los nombres del catálogo Rol.
export const verificarRolPorNombre = (rolesPermitidos: string[]) => async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
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

        const nombresNormalizados = rolesPermitidos.map(
            nombre => nombre.toLowerCase()
        );

        const placeholders = nombresNormalizados.map(() => '?').join(', ');

        const [rows]: any = await pool.query(
            `SELECT id_rol
             FROM Rol
             WHERE LOWER(nombre) IN (${placeholders})`,
            nombresNormalizados
        );

        const idsPermitidos = rows.map(
            (rol: { id_rol: number }) => Number(rol.id_rol)
        );

        if (!idsPermitidos.includes(Number(usuario.id_rol))) {
            res.status(403).json({
                status: 'error',
                message: 'No tiene permisos para realizar esta acción'
            });
            return;
        }

        next();

    } catch (error) {
        console.error('Error al verificar el rol:', error);
        res.status(500).json({
            status: 'error',
            message: 'No se pudieron verificar los permisos del usuario'
        });
    }
};
