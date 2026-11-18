
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
} from '../../../middlewares/auth.middleware';

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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       401:
 *         description: Usuario no autenticado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       403:
 *         description: El rol no tiene permisos de cliente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       404:
 *         description: No se encontró un perfil de cliente activo.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       500:
 *         description: Error interno al consultar los turnos.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       401:
 *         description: Usuario no autenticado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       403:
 *         description: El rol no tiene permisos de veterinario.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       404:
 *         description: No se encontró un perfil de veterinario activo.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       500:
 *         description: Error interno al consultar la agenda.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
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
 *           minimum: 1
 *         description: Identificador del perfil de veterinario.
 *       - in: query
 *         name: fecha
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha local en formato YYYY-MM-DD.
 *     responses:
 *       200:
 *         description: Horarios disponibles consultados correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       400:
 *         description: Parámetros inválidos.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       401:
 *         description: No autorizado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       403:
 *         description: Sin permisos.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       404:
 *         description: Veterinario no encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       500:
 *         description: Error interno al consultar la disponibilidad.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       401:
 *         description: Usuario no autenticado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       403:
 *         description: El rol no tiene permisos de administrador.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       500:
 *         description: Error interno al consultar los turnos.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
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
 *                 minimum: 1
 *                 description: Mascota para la que se solicita el turno.
 *               id_veterinario:
 *                 type: integer
 *                 minimum: 1
 *                 description: Perfil de veterinario que atenderá el turno.
 *               fecha_hora:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha ISO 8601 con zona horaria explícita, por ejemplo 2026-11-20T10:30:00-03:00.
 *               motivo:
 *                 type: string
 *                 maxLength: 500
 *                 nullable: true
 *               observaciones:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Turno solicitado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       400:
 *         description: Datos inválidos, fecha pasada o bloque fuera del horario configurado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       401:
 *         description: Token faltante, inválido o usuario no identificado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       403:
 *         description: Rol sin permisos o mascota ajena al cliente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       404:
 *         description: Mascota o veterinario inexistente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       409:
 *         description: El horario solicitado ya está ocupado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       500:
 *         description: Error interno al procesar la solicitud.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
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
 *           minimum: 1
 *         description: Identificador del turno.
 *     responses:
 *       200:
 *         description: Turno cancelado correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       400:
 *         description: Identificador inválido o el turno ya comenzó.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       401:
 *         description: Usuario no autenticado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       403:
 *         description: El turno no pertenece al cliente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       404:
 *         description: Turno inexistente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       409:
 *         description: El turno no puede cancelarse.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       500:
 *         description: Error interno al cancelar el turno.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
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
 *           minimum: 1
 *         description: Identificador del turno.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_estado_turno
 *             properties:
 *               id_estado_turno:
 *                 type: integer
 *                 minimum: 1
 *                 description: ID del estado destino en el catálogo EstadoTurno. Solo se admiten estados habilitados por la regla de transición.
 *     responses:
 *       200:
 *         description: Estado actualizado correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       400:
 *         description: Estado inválido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       401:
 *         description: Usuario no autenticado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       403:
 *         description: El rol no tiene permisos de administrador.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       404:
 *         description: Turno inexistente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       409:
 *         description: Transición no permitida.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       500:
 *         description: Error interno o faltan estados requeridos en el catálogo.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 */
router.patch(
    '/:id/estado',
    verificarToken,
    soloAdministrador,
    actualizarEstadoTurno
);

export default router;
