import { Router } from 'express';
import { crearHorario } from './horarios.controller';
import { verificarToken, verificarRol } from '../../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/horarios:
 *   post:
 *     summary: Registrar un nuevo horario de atención para un veterinario
 *     tags: [Agenda]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_veterinario:
 *                 type: integer
 *                 example: 2
 *               dia_semana:
 *                 type: integer
 *                 description: 1=Lunes, 7=Domingo
 *                 example: 1
 *               hora_inicio:
 *                 type: string
 *                 example: "09:00:00"
 *               hora_fin:
 *                 type: string
 *                 example: "13:00:00"
 *               intervalo_minutos:
 *                 type: integer
 *                 example: 30
 *     responses:
 *       201:
 *         description: Horario de atención registrado exitosamente.
 *       400:
 *         description: Datos incompletos o inválidos en la solicitud.
 *       401:
 *         description: No autorizado, token faltante o inválido.
 *       403:
 *         description: Prohibido, el usuario no tiene los permisos necesarios (Solo Administrador).
 *       500:
 *         description: Error interno del servidor.
 */
router.post('/', verificarToken, verificarRol([1]), crearHorario);

export default router;