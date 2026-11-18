
import { Router } from 'express';
import {
    obtenerUsuarios,
    obtenerUsuarioPorId,
    crearUsuario,
    eliminarUsuario,
    actualizarMiPerfil,
    obtenerCatalogosUsuarios,
    actualizarUsuario
} from './usuarios.controller';
import { verificarToken, verificarRolPorNombre } from '../../middlewares/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(verificarToken);
router.get('/catalogos', verificarRolPorNombre(['Administrador']), obtenerCatalogosUsuarios);

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Gestión de usuarios y perfiles del sistema
 */

/**
 * @swagger
 * /api/usuarios:
 *   get:
 *     summary: Obtener todos los usuarios activos
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       401:
 *         description: Token faltante o inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       403:
 *         description: Acceso restringido al administrador
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 */
router.get('/', verificarRolPorNombre(['Administrador']), obtenerUsuarios);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   get:
 *     summary: Obtener un usuario por su ID
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identificador del usuario
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       401:
 *         description: Token faltante o inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       403:
 *         description: Acceso restringido al administrador
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       404:
 *         description: Usuario no encontrado o inactivo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 */
router.get('/:id', verificarRolPorNombre(['Administrador']), obtenerUsuarioPorId);

/**
 * @swagger
 * /api/usuarios:
 *   post:
 *     summary: Crear un usuario
 *     description: Permite al administrador crear usuarios clientes, veterinarios o administradores.
 *     tags: [Usuarios]
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
 *               - apellido
 *               - numero_documento
 *               - email
 *               - password
 *               - id_rol
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Carlos
 *               apellido:
 *                 type: string
 *                 example: Gomez
 *               numero_documento:
 *                 type: string
 *                 example: "30111222"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: carlos@vet.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: VetCarlos2026
 *               telefono:
 *                 type: string
 *                 example: "3815551111"
 *               id_rol:
 *                 type: integer
 *                 description: Identificador del rol registrado en la tabla Rol.
 *               direccion:
 *                 type: string
 *                 description: Dato adicional requerido para clientes
 *                 example: San Miguel de Tucumán
 *               matricula:
 *                 type: string
 *                 description: Dato requerido para veterinarios
 *                 example: VET-001
 *               id_especialidad:
 *                 type: integer
 *                 description: Especialidad del veterinario
 *                 example: 1
 *     responses:
 *       201:
 *         description: Usuario y perfil extendido creados exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       400:
 *         description: Faltan datos obligatorios, faltan datos del veterinario o el rol no existe o no está soportado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       401:
 *         description: Token faltante o inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       403:
 *         description: Operación exclusiva del administrador
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       409:
 *         description: Email, documento o matrícula duplicados
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 */
router.post('/', verificarRolPorNombre(['Administrador']), crearUsuario);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   delete:
 *     summary: Dar de baja un usuario
 *     description: Realiza una baja lógica del usuario, conservando su registro.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identificador del usuario
 *     responses:
 *       200:
 *         description: Usuario dado de baja exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       401:
 *         description: Token faltante o inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       403:
 *         description: Operación exclusiva del administrador
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       404:
 *         description: Usuario no encontrado o ya inactivo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 */
router.delete('/:id', verificarRolPorNombre(['Administrador']), eliminarUsuario);

/**
 * @swagger
 * /api/usuarios/perfil:
 *   put:
 *     summary: Actualizar los datos de contacto del usuario autenticado
 *     description: Permite modificar el teléfono y, para clientes, la dirección.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               telefono:
 *                 type: string
 *                 example: "3815552222"
 *               direccion:
 *                 type: string
 *                 example: Yerba Buena, Tucumán
 *     responses:
 *       200:
 *         description: Datos de contacto actualizados exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       400:
 *         description: No se enviaron datos para actualizar
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       401:
 *         description: Token faltante o inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       404:
 *         description: Usuario no encontrado o inactivo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       409:
 *         description: El perfil extendido no coincide con el rol registrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 */
router.put('/perfil', actualizarMiPerfil);
router.put('/:id', verificarRolPorNombre(['Administrador']), actualizarUsuario);

export default router;
