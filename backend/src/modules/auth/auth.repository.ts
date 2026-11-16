import pool from "../../config/db";
import { RegistroClienteDTO } from "./auth.dto";

export class AuthRepository {
  async registrarCliente(
    datos: Omit<RegistroClienteDTO, "password"> & { password_hash: string },
  ): Promise<number> {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // 1. Obtener dinámicamente el ID del rol Cliente
      const [roles]: any = await connection.query(
        `SELECT id_rol FROM Rol WHERE LOWER(nombre) = LOWER(?) LIMIT 1`,
        ["Cliente"],
      );

      if (roles.length === 0) {
        throw new Error("CLIENT_ROLE_NOT_FOUND");
      }

      const idRolCliente = roles[0].id_rol;

      // 2. Crear el usuario
      const [resultadoUsuario]: any = await connection.query(
        `INSERT INTO Usuario
                    (nombre, apellido, numero_documento, email, password_hash, telefono, id_rol)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          datos.nombre,
          datos.apellido,
          datos.numero_documento,
          datos.email,
          datos.password_hash,
          datos.telefono || null,
          idRolCliente,
        ],
      );

      const idUsuario = resultadoUsuario.insertId;

      // 3. Crear el perfil de Cliente asociado
      await connection.query(`INSERT INTO Cliente (id_usuario) VALUES (?)`, [
        idUsuario,
      ]);

      // 4. Confirmar ambas operaciones
      await connection.commit();

      return idUsuario;
    } catch (error: any) {
      await connection.rollback();

      if (error.code === "ER_DUP_ENTRY") {
        throw new Error("DUPLICATE_ENTRY");
      }

      throw error;
    } finally {
      connection.release();
    }
  }

async obtenerPerfilPorId(idUsuario: number): Promise<any | null> {
    const [rows]: any = await pool.query(
        `SELECT
            u.id_usuario,
            u.nombre,
            u.apellido,
            u.email,
            u.telefono,
            u.id_rol,
            r.nombre AS rol
         FROM Usuario u
         INNER JOIN Rol r ON r.id_rol = u.id_rol
         WHERE u.id_usuario = ?
         AND u.activo = 1
         LIMIT 1`,
        [idUsuario]
    );

    return rows.length > 0 ? rows[0] : null;
}

}

export const authRepository = new AuthRepository();
