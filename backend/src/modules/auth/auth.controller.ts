import { Request, Response } from 'express';
import pool from '../../config/db';
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import 'dotenv/config';


// FUNCIONES AUXILIARES (Refactorización)

// Helper 1: Se encarga exclusivamente de hablar con la base de datos
const obtenerUsuarioPorEmail = async (email: string): Promise<any> => {
    const [rows]: any = await pool.query('SELECT * FROM Usuario WHERE email = ? AND activo = 1', [email]);
    return rows.length > 0 ? rows[0] : null;
};

// Helper 2: Se encarga exclusivamente de crear el JWT (soluciona el error línea 53)
const generarToken = (usuario: any): string => {
    const secret = process.env.JWT_SECRET;
    
    if (!secret) {
        throw new Error('La variable JWT_SECRET no está configurada en el .env');
    }

    const payload = {
        id_usuario: usuario.id_usuario,
        id_rol: usuario.id_rol
    };

    // Casteamos as any para apaciguar la estricta validación de StringValue de la librería
    const options: SignOptions = {
        expiresIn: (process.env.JWT_EXPIRES_IN || '2h') as any 
    };

    return jwt.sign(payload, secret, options);
};



// CONTROLADOR PRINCIPAL (Ahora mucho más limpio)

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        // 1. Validación de entrada
        if (!email || !password) {
            res.status(400).json({ status: 'error', message: 'El email y la contraseña son obligatorios' });
            return;
        }

        // 2. Búsqueda en DB
        const user = await obtenerUsuarioPorEmail(email);
        
        if (!user) {
            res.status(401).json({ status: 'error', message: 'Credenciales inválidas' });
            return;
        }

        // 3. Verificación de contraseña
        const isMatch = await bcrypt.compare(password, user.password_hash);
        
        if (!isMatch) {
            res.status(401).json({ status: 'error', message: 'Credenciales inválidas' });
            return;
        }

        // 4. Generación de Token
        const token = generarToken(user);

        // 5. Respuesta
        res.status(200).json({
            status: 'success',
            message: 'Login exitoso',
            data: {
                user: {
                    id_usuario: user.id_usuario,
                    nombre: user.nombre,
                    apellido: user.apellido,
                    email: user.email,
                    id_rol: user.id_rol 
                },
                token
            }
        });
    } catch (error) {
        console.error('Error en el endpoint de login:', error);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
};