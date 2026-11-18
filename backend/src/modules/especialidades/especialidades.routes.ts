
import { Router } from 'express';
import {
    obtenerEspecialidades,
    obtenerEspecialidadPorId,
    crearEspecialidad,
    actualizarEspecialidad,
    eliminarEspecialidad
} from './especialidades.controller';
import { verificarToken, verificarRolPorNombre } from '../../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Especialidades
 *   description: Gestión de especialidades veterinarias
 */

// Todas las operaciones requieren autenticación y rol Administrador.
router.use(verificarToken);
router.use(verificarRolPorNombre(['Administrador']));

/**
 * @swagger
 * /api/especialidades:
 *   get:
 *     summary: Obtener todas las especialidades
 *     description: Devuelve las especialidades registradas y activas. Requiere rol Administrador.
 *     tags: [Especialidades]
 *     responses:
 *       200:
 *         description: Listado de especialidades obtenido correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       401:
 *         description: Token de autenticación faltante o inválido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       403:
 *         description: El usuario no tiene permisos de administrador.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 */
router.get('/', obtenerEspecialidades);

/**
 * @swagger
 * /api/especialidades/{id}:
 *   get:
 *     summary: Obtener una especialidad por ID
 *     description: Busca una especialidad activa por su identificador.
 *     tags: [Especialidades]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identificador de la especialidad.
 *     responses:
 *       200:
 *         description: Especialidad encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       401:
 *         description: Token de autenticación faltante o inválido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       403:
 *         description: El usuario no tiene permisos de administrador.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       404:
 *         description: Especialidad no encontrada o inactiva.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 */
router.get('/:id', obtenerEspecialidadPorId);

/**
 * @swagger
 * /api/especialidades:
 *   post:
 *     summary: Crear una especialidad
 *     description: Registra una nueva especialidad veterinaria. Requiere rol Administrador.
 *     tags: [Especialidades]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Cardiología
 *               descripcion:
 *                 type: string
 *                 example: Especialidad dedicada al diagnóstico y tratamiento de enfermedades cardíacas.
 *     responses:
 *       201:
 *         description: Especialidad creada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       400:
 *         description: El nombre de la especialidad es obligatorio.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       401:
 *         description: Token de autenticación faltante o inválido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       403:
 *         description: El usuario no tiene permisos de administrador.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       409:
 *         description: Ya existe una especialidad con ese nombre.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 */
router.post('/', crearEspecialidad);

/**
 * @swagger
 * /api/especialidades/{id}:
 *   put:
 *     summary: Actualizar una especialidad
 *     description: Modifica los datos de una especialidad existente y activa.
 *     tags: [Especialidades]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identificador de la especialidad.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Cardiología veterinaria
 *               descripcion:
 *                 type: string
 *                 example: Diagnóstico y tratamiento de enfermedades cardíacas.
 *     responses:
 *       200:
 *         description: Especialidad actualizada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       401:
 *         description: Token de autenticación faltante o inválido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       403:
 *         description: El usuario no tiene permisos de administrador.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       404:
 *         description: Especialidad no encontrada, inactiva o sin cambios.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       409:
 *         description: El nuevo nombre ya está en uso por otra especialidad.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 */
router.put('/:id', actualizarEspecialidad);

/**
 * @swagger
 * /api/especialidades/{id}:
 *   delete:
 *     summary: Dar de baja una especialidad
 *     description: Realiza una baja lógica de la especialidad. No elimina físicamente el registro.
 *     tags: [Especialidades]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identificador de la especialidad.
 *     responses:
 *       200:
 *         description: Especialidad dada de baja exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       401:
 *         description: Token de autenticación faltante o inválido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       403:
 *         description: El usuario no tiene permisos de administrador.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       404:
 *         description: Especialidad no encontrada o ya inactiva.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 */
router.delete('/:id', eliminarEspecialidad);

export default router;
