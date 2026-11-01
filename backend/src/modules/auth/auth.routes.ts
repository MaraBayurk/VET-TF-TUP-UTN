import { Router } from 'express';
import { login } from './auth.controller';
import { verificarToken, verificarRol, AuthRequest } from '../../middlewares/auth.middleware';
import { Response } from 'express';

const router = Router();

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
 *         description: No autorizado, token faltante o inválido.
 *       403:
 *         description: Prohibido, el usuario no tiene los permisos necesarios.
 */
router.get('/perfil-admin', verificarToken, verificarRol([1]), (req: AuthRequest, res: Response) => {
    res.status(200).json({
        status: 'success',
        message: '¡Bienvenido administrador! Tienes acceso a esta ruta protegida.',
        usuarioAutenticado: req.usuario
    });
});

export default router;