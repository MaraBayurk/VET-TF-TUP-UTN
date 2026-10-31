import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

// 1. Extendemos la Request de Express para que acepte los datos de nuestro token
export interface AuthRequest extends Request {
    usuario?: {
        id_usuario: number;
        id_rol: number;
    };
}

// 2. Guardia 1: Verifica que la persona tenga un token válido (Autenticación)
export const verificarToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
    // Extraemos el token del encabezado. Formato esperado: "Bearer eyJhbGciOi..."
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
            status: 'error',
            message: 'Acceso denegado: No se proporcionó un token válido'
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
        // jwt.verify valida la firma y el tiempo de expiración
        const payload = jwt.verify(token, secret) as { id_usuario: number; id_rol: number };

        // Adjuntamos los datos a la request para que el controlador final los pueda usar
        req.usuario = payload;

        // Todo está en orden, dejamos pasar la petición
        next();
    } catch (error) {
        res.status(401).json({
            status: 'error',
            message: 'Token inválido o expirado'
        });
        return;
    }
};

// 3. Guardia 2: Verifica que la persona tenga el rol adecuado (Autorización)
// Recibe un arreglo de roles permitidos (ej: [1] para Admin, [1, 3] para Admin y Vet)
export const verificarRol = (rolesPermitidos: number[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        const usuario = req.usuario;

        if (!usuario) {
            res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
            return;
        }

        if (!rolesPermitidos.includes(usuario.id_rol)) {
            res.status(403).json({
                status: 'error',
                message: 'Acceso denegado: No posees los permisos necesarios'
            });
            return;
        }

        // Tiene el rol correcto, dejamos pasar la petición
        next();
    };
};