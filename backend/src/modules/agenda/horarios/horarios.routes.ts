
import { Router } from 'express';
import {
    crearHorario,
    listarHorarios
} from './horarios.controller';
import {
    verificarToken,
    verificarRolPorNombre
} from '../../../middlewares/auth.middleware';

const router = Router();

const soloAdministrador = verificarRolPorNombre(['Administrador']);

/**
 * @swagger
 * /api/horarios:
 *   get:
 *     summary: Consultar horarios de atención
 *     tags: [Agenda]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id_veterinario
 *         required: false
 *         schema:
 *           type: integer
 *       - in: query
 *         name: dia_semana
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 7
 *     responses:
 *       200:
 *         description: Horarios obtenidos correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       400:
 *         description: Filtros inválidos.
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
 *         description: Rol sin permisos.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       500:
 *         description: Error interno.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 */
router.get('/', verificarToken, soloAdministrador, listarHorarios);

/**
 * @swagger
 * /api/horarios:
 *   post:
 *     summary: Registrar un horario de atención para un veterinario
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
 *               - id_veterinario
 *               - dia_semana
 *               - hora_inicio
 *               - hora_fin
 *             properties:
 *               id_veterinario:
 *                 type: integer
 *                 example: 1
 *               dia_semana:
 *                 type: integer
 *                 example: 1
 *               hora_inicio:
 *                 type: string
 *                 example: "09:00:00"
 *               hora_fin:
 *                 type: string
 *                 example: "12:00:00"
 *               intervalo_minutos:
 *                 type: integer
 *                 example: 30
 *     responses:
 *       201:
 *         description: Horario registrado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       400:
 *         description: Datos inválidos.
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
 *         description: Rol sin permisos.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       404:
 *         description: Veterinario inexistente o inactivo.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       409:
 *         description: Franja horaria superpuesta.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       500:
 *         description: Error interno.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 */
router.post('/', verificarToken, soloAdministrador, crearHorario);

export default router;
