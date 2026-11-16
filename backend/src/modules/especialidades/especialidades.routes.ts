
import { Router } from 'express';
import {
    obtenerEspecialidades,
    obtenerEspecialidadPorId,
    crearEspecialidad,
    actualizarEspecialidad,
    eliminarEspecialidad
} from './especialidades.controller';
import { verificarToken, verificarRol } from '../../middlewares/auth.middleware';
import { ROLES } from '../../constants/roles';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Especialidades
 *   description: Gestión de especialidades veterinarias
 */

// Todas las operaciones requieren autenticación y rol Administrador.
router.use(verificarToken);
router.use(verificarRol([ROLES.ADMINISTRADOR]));

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
 *       401:
 *         description: Token de autenticación faltante o inválido.
 *       403:
 *         description: El usuario no tiene permisos de administrador.
 *       500:
 *         description: Error interno del servidor.
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
 *       401:
 *         description: Token de autenticación faltante o inválido.
 *       403:
 *         description: El usuario no tiene permisos de administrador.
 *       404:
 *         description: Especialidad no encontrada o inactiva.
 *       500:
 *         description: Error interno del servidor.
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
 *       400:
 *         description: El nombre de la especialidad es obligatorio.
 *       401:
 *         description: Token de autenticación faltante o inválido.
 *       403:
 *         description: El usuario no tiene permisos de administrador.
 *       409:
 *         description: Ya existe una especialidad con ese nombre.
 *       500:
 *         description: Error interno del servidor.
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
 *       401:
 *         description: Token de autenticación faltante o inválido.
 *       403:
 *         description: El usuario no tiene permisos de administrador.
 *       404:
 *         description: Especialidad no encontrada, inactiva o sin cambios.
 *       409:
 *         description: El nuevo nombre ya está en uso por otra especialidad.
 *       500:
 *         description: Error interno del servidor.
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
 *       401:
 *         description: Token de autenticación faltante o inválido.
 *       403:
 *         description: El usuario no tiene permisos de administrador.
 *       404:
 *         description: Especialidad no encontrada o ya inactiva.
 *       500:
 *         description: Error interno del servidor.
 */
router.delete('/:id', eliminarEspecialidad);

export default router;
