import { Request, Response } from 'express';
import pool from '../../config/db';
import bcrypt from 'bcrypt';

export const login = async (req: Request, res: Response): Promise<void> => {
    // 1. Extraemos los datos que vienen en el cuerpo de la petición
    const { email, password } = req.body;

    try {
        // 2. Validamos que ambos datos hayan sido enviados
        if (!email || !password) {
            res.status(400).json({
                status: 'error',
                message: 'El email y la contraseña son obligatorios'
            });
            return;
        }

        // 3. Buscamos al usuario en la base de datos (asegurando que esté activo)
        // Usamos el nombre exacto de la tabla de tu script SQL
        const [rows]: any = await pool.query('SELECT * FROM Usuario WHERE email = ? AND activo = 1', [email]);
        const users = rows as any[];

        // Si el arreglo está vacío, el email no existe o el usuario está inactivo
        if (users.length === 0) {
            res.status(401).json({ status: 'error', message: 'Credenciales inválidas' });
            return;
        }

        // Tomamos el primer (y único) usuario encontrado
        const user = users[0];

        // 4. Comparamos la contraseña recibida con el password_hash de la BD
        const isMatch = await bcrypt.compare(password, user.password_hash);

        // Si no coinciden, rechazamos el acceso
        if (!isMatch) {
            res.status(401).json({ status: 'error', message: 'Credenciales inválidas' });
            return;
        }

        // 5. Si todo es correcto, devolvemos los datos básicos del usuario
        // (En la tarea #33, aquí mismo generaremos el JWT)
        res.status(200).json({
            status: 'success',
            message: 'Login exitoso',
            data: {
                id_usuario: user.id_usuario,
                nombre: user.nombre,
                apellido: user.apellido,
                email: user.email,
                id_rol: user.id_rol
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