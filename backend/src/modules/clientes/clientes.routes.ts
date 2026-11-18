import { Router } from 'express';
import { verificarToken, verificarRolPorNombre } from '../../middlewares/auth.middleware';
import { actualizarCliente, crearCliente, eliminarCliente, obtenerCliente, obtenerClientes } from './clientes.controller';

const router = Router();
const soloEquipo = verificarRolPorNombre(['Administrador', 'Veterinario']);
router.use(verificarToken, soloEquipo);

/**
 * @swagger
 * tags:
 *   name: Clientes
 *   description: Administración de cuentas de clientes de la veterinaria
 */

/**
 * @swagger
 * /api/clientes:
 *   get:
 *     summary: Listar clientes
 *     description: Devuelve clientes activos e inactivos con el conteo de mascotas activas y turnos asociados.
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Clientes obtenidos correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       401:
 *         description: Token faltante o inválido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       403:
 *         description: Se requiere rol Administrador o Veterinario.
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
router.get('/', obtenerClientes);

/**
 * @swagger
 * /api/clientes/{id}:
 *   get:
 *     summary: Consultar detalle de cliente
 *     description: Devuelve los datos del cliente, sus mascotas y el historial completo de turnos.
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Identificador del perfil Cliente (id_cliente).
 *     responses:
 *       200:
 *         description: Cliente encontrado.
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
 *         description: Token faltante o inválido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       403:
 *         description: Se requiere rol Administrador o Veterinario.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       404:
 *         description: Cliente no encontrado.
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
router.get('/:id', obtenerCliente);

/**
 * @swagger
 * /api/clientes:
 *   post:
 *     summary: Crear cliente
 *     description: Crea en una transacción la cuenta con rol Cliente y su perfil. Requiere Administrador o Veterinario.
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, apellido, numero_documento, email, password]
 *             properties:
 *               nombre:
 *                 type: string
 *                 maxLength: 100
 *               apellido:
 *                 type: string
 *                 maxLength: 100
 *               numero_documento:
 *                 type: string
 *                 maxLength: 20
 *               email:
 *                 type: string
 *                 format: email
 *                 maxLength: 150
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *               telefono:
 *                 type: string
 *                 maxLength: 30
 *               direccion:
 *                 type: string
 *                 maxLength: 255
 *     responses:
 *       201:
 *         description: Cliente creado correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       400:
 *         description: Datos obligatorios o formato inválido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       401:
 *         description: Token faltante o inválido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       403:
 *         description: Se requiere rol Administrador o Veterinario.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       409:
 *         description: Email o documento ya registrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       500:
 *         description: Error interno o rol Cliente no configurado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 */
router.post('/', crearCliente);

/**
 * @swagger
 * /api/clientes/{id}:
 *   put:
 *     summary: Actualizar cliente
 *     description: Actualiza los datos personales y de contacto. La contraseña es opcional y solo se reemplaza si se envía.
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Identificador del perfil Cliente (id_cliente).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, apellido, numero_documento, email]
 *             properties:
 *               nombre:
 *                 type: string
 *                 maxLength: 100
 *               apellido:
 *                 type: string
 *                 maxLength: 100
 *               numero_documento:
 *                 type: string
 *                 maxLength: 20
 *               email:
 *                 type: string
 *                 format: email
 *                 maxLength: 150
 *               telefono:
 *                 type: string
 *                 maxLength: 30
 *               direccion:
 *                 type: string
 *                 maxLength: 255
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Cliente actualizado correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       400:
 *         description: Identificador o datos inválidos.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       401:
 *         description: Token faltante o inválido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       403:
 *         description: Se requiere rol Administrador o Veterinario.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       404:
 *         description: Cliente no encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       409:
 *         description: Email o documento ya registrado.
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
router.put('/:id', actualizarCliente);

/**
 * @swagger
 * /api/clientes/{id}:
 *   delete:
 *     summary: Dar de baja cliente
 *     description: Realiza una baja lógica y conserva la cuenta y sus registros relacionados.
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Identificador del perfil Cliente (id_cliente).
 *     responses:
 *       200:
 *         description: Cliente dado de baja correctamente.
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
 *         description: Token faltante o inválido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       403:
 *         description: Se requiere rol Administrador o Veterinario.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       404:
 *         description: Cliente no encontrado o ya inactivo.
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
router.delete('/:id', eliminarCliente);

export default router;
