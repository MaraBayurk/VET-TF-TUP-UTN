
import { Router } from 'express';
import {
    solicitarTurno,
    obtenerHorariosDisponibles,
    obtenerMisTurnos,
    obtenerAgendaVeterinario,
    obtenerTodosLosTurnos,
    cancelarMiTurno,
    actualizarEstadoTurno
} from './turnos.controller';
import {
    verificarToken,
    verificarRolPorNombre
} from '../../middlewares/auth.middleware';

const router = Router();

const soloCliente = verificarRolPorNombre(['Cliente']);
const soloVeterinario = verificarRolPorNombre(['Veterinario']);
const soloAdministrador = verificarRolPorNombre(['Administrador']);

const rolesSolicitud = verificarRolPorNombre([
    'Administrador',
    'Cliente'
]);

/**
 * @swagger
 * /api/turnos/mis-turnos:
 *   get:
 *     summary: Consultar próximos turnos del cliente autenticado
 *     tags: [Agenda]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Turnos obtenidos correctamente.
 */
router.get('/mis-turnos', verificarToken, soloCliente, obtenerMisTurnos);

/**
 * @swagger
 * /api/turnos/agenda:
 *   get:
 *     summary: Consultar agenda del veterinario autenticado
 *     tags: [Agenda]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Agenda obtenida correctamente.
 */
router.get('/agenda', verificarToken, soloVeterinario, obtenerAgendaVeterinario);

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
    rolesSolicitud,
    obtenerHorariosDisponibles
);

/**
 * @swagger
 * /api/turnos:
 *   get:
 *     summary: Consultar todos los turnos
 *     tags: [Agenda]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Turnos obtenidos correctamente.
 */
router.get('/', verificarToken, soloAdministrador, obtenerTodosLosTurnos);

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
 *               id_veterinario:
 *                 type: integer
 *               fecha_hora:
 *                 type: string
 *                 format: date-time
 *               motivo:
 *                 type: string
 *               observaciones:
 *                 type: string
 *     responses:
 *       201:
 *         description: Turno solicitado exitosamente.
 */
router.post('/', verificarToken, rolesSolicitud, solicitarTurno);

/**
 * @swagger
 * /api/turnos/{id}/cancelar:
 *   patch:
 *     summary: Cancelar un turno propio
 *     tags: [Agenda]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Turno cancelado correctamente.
 *       403:
 *         description: El turno no pertenece al cliente.
 *       404:
 *         description: Turno inexistente.
 *       409:
 *         description: El turno no puede cancelarse.
 */
router.patch(
    '/:id/cancelar',
    verificarToken,
    soloCliente,
    cancelarMiTurno
);

/**
 * @swagger
 * /api/turnos/{id}/estado:
 *   patch:
 *     summary: Actualizar el estado de un turno
 *     tags: [Agenda]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - estado
 *             properties:
 *               estado:
 *                 type: string
 *                 enum: [APROBADO, CANCELADO, COMPLETADO]
 *     responses:
 *       200:
 *         description: Estado actualizado correctamente.
 *       400:
 *         description: Estado inválido.
 *       404:
 *         description: Turno inexistente.
 *       409:
 *         description: Transición no permitida.
 */
router.patch(
    '/:id/estado',
    verificarToken,
    soloAdministrador,
    actualizarEstadoTurno
);

export default router;
