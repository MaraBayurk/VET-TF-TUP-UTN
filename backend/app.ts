import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import pool from './src/config/db';

const app: Application = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

// Endpoint de prueba de conexión a la BD
app.get('/api/test-db', async (req: Request, res: Response) => {
    try {
        const [rows] = await pool.query('SELECT 1 + 1 AS solution');
        res.status(200).json({
            status: 'success',
            message: '¡Conexión a MariaDB exitosa!',
            data: rows
        });
    } catch (error) {
        console.error('Error conectando a la base de datos:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error al conectar con la base de datos',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
});

export default app;