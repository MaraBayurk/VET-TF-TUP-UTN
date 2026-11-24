
import bcrypt from 'bcrypt';
import pool from '../src/config/db';

const verificar = async () => {
    try {
        const email = 'admin-1928107f47@vet.local';

        // Ingresar localmente la contraseña que mostró seed:admin.
        const password = 'Vet-tI3VcmN8-XRB6vLccjF1KkIV!';

        const [rows]: any = await pool.query(
            `SELECT password_hash
             FROM Usuario
             WHERE email = ?
               AND activo = 1`,
            [email]
        );

        if (rows.length === 0) {
            console.log('No se encontró el administrador activo.');
            return;
        }

        const coincide = await bcrypt.compare(
            password,
            rows[0].password_hash
        );

        console.log(
            coincide
                ? 'La contraseña coincide con el hash.'
                : 'La contraseña NO coincide con el hash.'
        );

    } catch (error) {
        console.error('Error al verificar:', error);
    } finally {
        await pool.end();
    }
};

void verificar();
