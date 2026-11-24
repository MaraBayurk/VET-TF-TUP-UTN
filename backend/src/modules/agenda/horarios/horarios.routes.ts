
import { Router } from 'express';

import {
    crearHorario,
    listarHorarios,
    actualizarHorario,
    eliminarHorario
} from './horarios.controller';

import {
    verificarToken,
    verificarRolPorNombre
} from '../../../middlewares/auth.middleware';

const router = Router();

const soloAdministrador = verificarRolPorNombre(['Administrador']);

// Todas las rutas del módulo requieren autenticación y rol Administrador.
router.use(verificarToken, soloAdministrador);

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
 *       400:
 *         description: Filtros inválidos.
 *       401:
 *         description: Usuario no autenticado.
 *       403:
 *         description: Rol sin permisos.
 *       500:
 *         description: Error interno.
 */
router.get('/', listarHorarios);

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
 *                 example: "09:00"
 *               hora_fin:
 *                 type: string
 *                 example: "12:00"
 *               intervalo_minutos:
 *                 type: integer
 *                 example: 30
 *     responses:
 *       201:
 *         description: Horario registrado exitosamente.
 *       400:
 *         description: Datos inválidos.
 *       401:
 *         description: Usuario no autenticado.
 *       403:
 *         description: Rol sin permisos.
 *       404:
 *         description: Veterinario inexistente o inactivo.
 *       409:
 *         description: Franja horaria superpuesta.
 *       500:
 *         description: Error interno.
 */
router.post('/', crearHorario);

/**
 * @swagger
 * /api/horarios/{id}:
 *   put:
 *     summary: Modificar un horario de atención
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
 *               - id_veterinario
 *               - dia_semana
 *               - hora_inicio
 *               - hora_fin
 *             properties:
 *               id_veterinario:
 *                 type: integer
 *               dia_semana:
 *                 type: integer
 *               hora_inicio:
 *                 type: string
 *               hora_fin:
 *                 type: string
 *               intervalo_minutos:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Horario actualizado correctamente.
 *       400:
 *         description: Datos inválidos.
 *       401:
 *         description: Usuario no autenticado.
 *       403:
 *         description: Rol sin permisos.
 *       404:
 *         description: Horario o veterinario inexistente.
 *       409:
 *         description: Franja horaria superpuesta.
 *       500:
 *         description: Error interno.
 */
router.put('/:id', actualizarHorario);

/**
 * @swagger
 * /api/horarios/{id}:
 *   delete:
 *     summary: Dar de baja un horario de atención
 *     description: Realiza una baja lógica modificando el campo activo a 0.
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
 *         description: Horario dado de baja correctamente.
 *       400:
 *         description: ID inválido.
 *       401:
 *         description: Usuario no autenticado.
 *       403:
 *         description: Rol sin permisos.
 *       404:
 *         description: Horario inexistente o inactivo.
 *       500:
 *         description: Error interno.
 */
router.delete('/:id', eliminarHorario);

export default router;

