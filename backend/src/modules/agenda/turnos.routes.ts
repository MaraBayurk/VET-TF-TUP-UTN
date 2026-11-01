import { Router } from 'express';
import { solicitarTurno } from './turnos.controller';
import { verificarToken, verificarRol } from '../../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/turnos:
 *   post:
 *     summary: Solicitar un nuevo turno médico
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
 *               id_mascota:
 *                 type: integer
 *                 example: 1
 *               id_veterinario:
 *                 type: integer
 *                 example: 1
 *               fecha_hora:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-11-15T14:30:00Z"
 *               motivo:
 *                 type: string
 *                 example: "Consulta general anual"
 *               observaciones:
 *                 type: string
 *                 example: "El paciente presenta leve cojera en pata delantera derecha"
 *     responses:
 *       201:
 *         description: Turno médico solicitado exitosamente.
 *       400:
 *         description: Datos incompletos o inválidos en la solicitud.
 *       401:
 *         description: No autorizado, token faltante o inválido.
 *       403:
 *         description: Prohibido, el usuario carece de los privilegios requeridos.
 *       500:
 *         description: Error interno del servidor.
 */
router.post('/', verificarToken, verificarRol([1, 2]), solicitarTurno);

export default router;