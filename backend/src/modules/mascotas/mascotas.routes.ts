
import { Router } from 'express';

import {
    obtenerMascotas,
    obtenerMascotaPorId,
    crearMascota,
    actualizarMascota,
    eliminarMascota
} from './mascotas.controller';

import {
    verificarToken,
    verificarRolPorNombre
} from '../../middlewares/auth.middleware';

const router = Router();

router.use(verificarToken);

// Administrador, Cliente y Veterinario.
const todosLosRoles = verificarRolPorNombre([
    'Administrador',
    'Cliente',
    'Veterinario'
]);

// Solo Administrador y Veterinario.
const rolesDeGestion = verificarRolPorNombre([
    'Administrador',
    'Veterinario'
]);

/**
 * @swagger
 * tags:
 *   name: Mascotas
 *   description: Gestión de mascotas de la veterinaria
 */

/**
 * @swagger
 * /api/mascotas:
 *   get:
 *     summary: Obtener listado de mascotas
 *     description: Los clientes solamente pueden consultar sus propias mascotas. Administradores y veterinarios pueden consultar todas.
 *     tags: [Mascotas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Listado de mascotas obtenido correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       401:
 *         description: Token inválido o no proporcionado.
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
 *         description: Perfil de cliente no encontrado o inactivo.
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
router.get('/', todosLosRoles, obtenerMascotas);

/**
 * @swagger
 * /api/mascotas/{id}:
 *   get:
 *     summary: Obtener una mascota por ID
 *     description: El cliente solamente puede consultar mascotas de su propiedad.
 *     tags: [Mascotas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identificador de la mascota.
 *     responses:
 *       200:
 *         description: Mascota encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       400:
 *         description: Identificador inválido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       401:
 *         description: Token inválido o no proporcionado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       403:
 *         description: La mascota no pertenece al cliente autenticado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       404:
 *         description: Mascota no encontrada o inactiva.
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
router.get('/:id', todosLosRoles, obtenerMascotaPorId);

/**
 * @swagger
 * /api/mascotas:
 *   post:
 *     summary: Registrar una mascota
 *     description: Los clientes registran mascotas a su nombre automáticamente. Administradores y veterinarios deben indicar el ID de un cliente activo.
 *     tags: [Mascotas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - especie
 *               - sexo
 *             properties:
 *               id_cliente:
 *                 type: integer
 *                 description: Obligatorio para Administrador y Veterinario. Para Cliente se obtiene del usuario autenticado.
 *                 example: 3
 *               nombre:
 *                 type: string
 *                 maxLength: 100
 *                 example: Luna
 *               especie:
 *                 type: string
 *                 maxLength: 60
 *                 example: Perro
 *               raza:
 *                 type: string
 *                 nullable: true
 *                 maxLength: 100
 *                 example: Caniche
 *               fecha_nacimiento:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *                 example: '2022-05-10'
 *               sexo:
 *                 type: string
 *                 maxLength: 20
 *                 example: Hembra
 *               observaciones:
 *                 type: string
 *                 nullable: true
 *                 example: Mascota de prueba
 *     responses:
 *       201:
 *         description: Mascota registrada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       400:
 *         description: Datos inválidos o cliente inexistente o inactivo.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       401:
 *         description: Token inválido o no proporcionado.
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
 *         description: Perfil de cliente no encontrado o inactivo.
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
router.post('/', todosLosRoles, crearMascota);

/**
 * @swagger
 * /api/mascotas/{id}:
 *   put:
 *     summary: Actualizar una mascota
 *     description: Los clientes solamente pueden modificar raza, sexo y observaciones de sus propias mascotas. Administradores y veterinarios pueden modificar todos los datos.
 *     tags: [Mascotas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identificador de la mascota.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 maxLength: 100
 *                 example: Luna
 *               especie:
 *                 type: string
 *                 maxLength: 60
 *                 example: Perro
 *               raza:
 *                 type: string
 *                 nullable: true
 *                 maxLength: 100
 *                 example: Caniche
 *               fecha_nacimiento:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *                 example: '2022-05-10'
 *               sexo:
 *                 type: string
 *                 maxLength: 20
 *                 example: Hembra
 *               observaciones:
 *                 type: string
 *                 nullable: true
 *                 example: Actualización de observaciones
 *     responses:
 *       200:
 *         description: Datos de la mascota actualizados exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       400:
 *         description: Identificador o datos inválidos, o no se enviaron campos válidos.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       401:
 *         description: Token inválido o no proporcionado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       403:
 *         description: La mascota no pertenece al cliente autenticado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       404:
 *         description: Mascota no encontrada o inactiva.
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
router.put('/:id', todosLosRoles, actualizarMascota);

/**
 * @swagger
 * /api/mascotas/{id}:
 *   delete:
 *     summary: Dar de baja una mascota
 *     description: Realiza una baja lógica y cancela los turnos futuros pendientes o aprobados asociados a la mascota. Solo Administradores y Veterinarios pueden realizar esta operación.
 *     tags: [Mascotas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identificador de la mascota.
 *     responses:
 *       200:
 *         description: Mascota dada de baja y turnos futuros cancelados.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       400:
 *         description: Identificador inválido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       401:
 *         description: Token inválido o no proporcionado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       403:
 *         description: El usuario no tiene permisos para dar de baja mascotas.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       404:
 *         description: Mascota no encontrada o ya inactiva.
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
router.delete('/:id', rolesDeGestion, eliminarMascota);

export default router;
