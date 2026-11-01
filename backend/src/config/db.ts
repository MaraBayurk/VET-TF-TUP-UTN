import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Cargar variables de entorno desde el archivo .env
dotenv.config();

// Crear un "pool" de conexiones en lugar de una conexión única.
// Esto es una buena práctica de arquitectura porque gestiona múltiples 
// peticiones concurrentes de manera eficiente sin saturar a MariaDB.
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'veterinariaDB',
    port: Number(process.env.DB_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
// Agrega esta propiedad obligatoria para Aiven
    ssl: {
        rejectUnauthorized: false
    }
});

export default pool;