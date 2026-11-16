
import { Router } from 'express';
import {
    solicitarTurno,
    obtenerHorariosDisponibles
} from './turnos.controller';
import {
    verificarToken,
    verificarRolPorNombre
} from '../../middlewares/auth.middleware';

const router = Router();

const rolesAgenda = verificarRolPorNombre([
    'Administrador',
    'Cliente'
]);

/**
 * @swagger
 * /api/turnos/disponibles:
 *   get:
 *     summary: Consultar horarios disponibles de un veterinario
 *     tags: [Agenda]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id_veterinario
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: fecha
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: "2026-11-23"
 *     responses:
 *       200:
 *         description: Horarios disponibles consultados correctamente.
 *       400:
 *         description: Parámetros inválidos.
 *       401:
 *         description: No autorizado.
 *       403:
 *         description: Sin permisos.
 *       404:
 *         description: Veterinario no encontrado.
 */
router.get(
    '/disponibles',
    verificarToken,
    rolesAgenda,
    obtenerHorariosDisponibles
);

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
 *                 example: "2026-11-23T09:30:00-03:00"
 *               motivo:
 *                 type: string
 *               observaciones:
 *                 type: string
 *     responses:
 *       201:
 *         description: Turno solicitado exitosamente.
 *       400:
 *         description: Datos inválidos.
 *       401:
 *         description: No autorizado.
 *       403:
 *         description: Sin permisos.
 *       500:
 *         description: Error interno.
 */
router.post(
    '/',
    verificarToken,
    rolesAgenda,
    solicitarTurno
);

export default router;
