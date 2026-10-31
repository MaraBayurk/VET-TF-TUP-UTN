import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import pool from './src/config/db';

// 1. Importamos el enrutador de autenticación que acabamos de crear
import authRoutes from './src/modules/auth/auth.routes';

const app: Application = express();

// Middlewares globales
app.use(cors());
// express.json() es vital: sin esto, req.body llegaría como "undefined" y el login fallaría
app.use(express.json());

// Endpoint de prueba (Tarea 19)
app.get('/api/test-db', async (req: Request, res: Response) => {
    try {
        const [rows] = await pool.query('SELECT 1 + 1 AS solution');
        res.status(200).json({
            status: 'success',
            message: '¡Conexión a MariaDB exitosa!',
            data: rows
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error de conexión',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
});

// 2. Montamos las rutas de autenticación
// Al poner '/api/auth' aquí, la ruta '/login' de tu enrutador se convierte automáticamente en '/api/auth/login'
app.use('/api/auth', authRoutes);

export default app;