
import { Router, Response } from 'express';
import { login, register } from './auth.controller';
import {
    verificarToken,
    verificarRol,
    AuthRequest
} from '../../middlewares/auth.middleware';
import { ROLES } from '../../constants/roles';

const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar una nueva cuenta de cliente
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - apellido
 *               - numero_documento
 *               - email
 *               - password
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Juan
 *               apellido:
 *                 type: string
 *                 example: Pérez
 *               numero_documento:
 *                 type: string
 *                 example: "30123456"
 *               email:
 *                 type: string
 *                 example: juan@email.com
 *               password:
 *                 type: string
 *                 example: "Contraseña123"
 *               telefono:
 *                 type: string
 *                 example: "3815555555"
 *     responses:
 *       201:
 *         description: Cuenta creada exitosamente.
 *       400:
 *         description: Datos inválidos o campos obligatorios faltantes.
 *       409:
 *         description: Email o documento ya registrado.
 *       500:
 *         description: Error interno del servidor.
 */
router.post('/register', register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión en el sistema
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@vet.com
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Login exitoso. Devuelve el token JWT y los datos del usuario.
 *       401:
 *         description: Credenciales inválidas.
 *       500:
 *         description: Error interno del servidor.
 */
router.post('/login', login);

/**
 * @swagger
 * /api/auth/perfil-admin:
 *   get:
 *     summary: Obtener perfil de administrador (Ruta de prueba)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Acceso concedido al administrador.
 *       401:
 *         description: No autorizado.
 *       403:
 *         description: El usuario no tiene permisos.
 */
router.get(
    '/perfil-admin',
    verificarToken,
    verificarRol([ROLES.ADMINISTRADOR]),
    (req: AuthRequest, res: Response) => {
        res.status(200).json({
            status: 'success',
            message: '¡Bienvenido administrador! Tienes acceso a esta ruta protegida.',
            usuarioAutenticado: req.usuario
        });
    }
);

export default router;
