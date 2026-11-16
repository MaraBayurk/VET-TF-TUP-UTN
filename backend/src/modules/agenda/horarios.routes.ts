
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

const rolesSolicitud = verificarRolPorNombre([
    'Administrador',
    'Cliente'
]);

const rolesConsultaDisponibilidad = verificarRolPorNombre([
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
 *         example: 1
 *       - in: query
 *         name: fecha
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         example: "2026-11-23"
 *     responses:
 *       200:
 *         description: Horarios disponibles obtenidos correctamente.
 *       400:
 *         description: Parámetros inválidos.
 *       401:
 *         description: Usuario no autenticado.
 *       403:
 *         description: Rol sin permisos.
 *       404:
 *         description: Veterinario inexistente.
 *       500:
 *         description: Error interno.
 */
router.get(
    '/disponibles',
    verificarToken,
    rolesConsultaDisponibilidad,
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
 *             required:
 *               - id_mascota
 *               - id_veterinario
 *               - fecha_hora
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
 *                 example: "Consulta general"
 *               observaciones:
 *                 type: string
 *                 example: "Control de rutina"
 *     responses:
 *       201:
 *         description: Turno solicitado exitosamente.
 *       400:
 *         description: Datos inválidos.
 *       401:
 *         description: Usuario no autenticado.
 *       403:
 *         description: No tiene permisos o la mascota no le pertenece.
 *       409:
 *         description: Horario ocupado.
 *       500:
 *         description: Error interno.
 */
router.post(
    '/',
    verificarToken,
    rolesSolicitud,
    solicitarTurno
);

export default router;
