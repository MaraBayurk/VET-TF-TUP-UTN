import { Router } from 'express';
import {
    obtenerTiposAtencion,
    crearAtencion,
    obtenerHistorialPorMascota,
    obtenerAlertas,
    obtenerAtencionPorId,
    actualizarAtencion,
    darDeBajaLogica
} from './clinical.controller';
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

// Solo Veterinario (HU-VET-10-a, HU-VET-10-b, HU-VET-10-c).
const soloVeterinario = verificarRolPorNombre(['Veterinario']);

// Solo Administrador (HU-VET-10-d).
const soloAdministrador = verificarRolPorNombre(['Administrador']);

/**
 * @swagger
 * tags:
 *   name: Atenciones Clínicas
 *   description: Gestión de atenciones médicas, vacunas aplicadas, libreta sanitaria y alertas preventivas
 */

/**
 * @swagger
 * /api/atenciones/tipos:
 *   get:
 *     summary: Obtener catálogo de tipos de atención
 *     description: Devuelve los tipos de atención disponibles desde el catálogo TipoAtencion (Consulta, Control, Vacuna, Urgencia).
 *     tags: [Atenciones Clínicas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Catálogo obtenido correctamente.
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
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 */
router.get('/tipos', todosLosRoles, obtenerTiposAtencion);

/**
 * @swagger
 * /api/atenciones/alertas:
 *   get:
 *     summary: Obtener alertas de próximos controles y vacunas (30 días)
 *     description: Devuelve vencimientos de proximo_control y proxima_aplicacion en los próximos 30 días. Para Cliente filtra únicamente sus mascotas; para Veterinario y Administrador devuelve el listado global.
 *     tags: [Atenciones Clínicas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Listado de alertas obtenido correctamente.
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
router.get('/alertas', todosLosRoles, obtenerAlertas);

/**
 * @swagger
 * /api/atenciones/mascota/{idMascota}:
 *   get:
 *     summary: Consultar libreta sanitaria de una mascota
 *     description: Devuelve el historial cronológico de atenciones clínicas activas y sus vacunas aplicadas. El Cliente solo puede consultar mascotas de su propiedad.
 *     tags: [Atenciones Clínicas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idMascota
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identificador de la mascota.
 *     responses:
 *       200:
 *         description: Historial clínico obtenido correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       400:
 *         description: Identificador de mascota inválido.
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
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 */
router.get('/mascota/:idMascota', todosLosRoles, obtenerHistorialPorMascota);

/**
 * @swagger
 * /api/atenciones:
 *   post:
 *     summary: Registrar una nueva atención clínica
 *     description: Exclusivo para Veterinario. Si se incluye id_turno, el turno debe estar en estado APROBADO y se actualizará automáticamente a COMPLETADO. Si el tipo de atención es Vacuna, es obligatorio enviar el arreglo vacunas con laboratorio.
 *     tags: [Atenciones Clínicas]
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
 *               - id_tipo_atencion
 *             properties:
 *               id_mascota:
 *                 type: integer
 *                 example: 1
 *               id_tipo_atencion:
 *                 type: integer
 *                 description: ID del catálogo TipoAtencion (ej. 1 Consulta, 2 Control, 3 Vacuna, 4 Urgencia).
 *                 example: 1
 *               id_turno:
 *                 type: integer
 *                 nullable: true
 *                 description: Opcional. Si se envía, el turno debe estar APROBADO y coincidir con mascota y veterinario.
 *                 example: null
 *               diagnostico:
 *                 type: string
 *                 nullable: true
 *                 example: Control general en buen estado clínico.
 *               tratamiento:
 *                 type: string
 *                 nullable: true
 *                 example: Desparasitación preventiva cada 3 meses.
 *               observaciones:
 *                 type: string
 *                 nullable: true
 *                 example: Peso estable, mucosas rosadas.
 *               proximo_control:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *                 example: '2026-12-15'
 *               vacunas:
 *                 type: array
 *                 description: Obligatorio únicamente cuando el tipo de atención es Vacuna.
 *                 items:
 *                   type: object
 *                   required:
 *                     - nombre_vacuna
 *                     - fecha_aplicacion
 *                     - laboratorio
 *                   properties:
 *                     nombre_vacuna:
 *                       type: string
 *                       example: Antirrábica
 *                     dosis:
 *                       type: string
 *                       nullable: true
 *                       example: 1 ml
 *                     lote:
 *                       type: string
 *                       nullable: true
 *                       example: LOTE-2026-A1
 *                     fecha_aplicacion:
 *                       type: string
 *                       format: date
 *                       example: '2026-11-22'
 *                     proxima_aplicacion:
 *                       type: string
 *                       format: date
 *                       nullable: true
 *                       example: '2027-11-22'
 *                     laboratorio:
 *                       type: string
 *                       example: Zoetis
 *     responses:
 *       201:
 *         description: Atención clínica registrada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       400:
 *         description: Datos inválidos o violación de regla de negocio.
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
 *         description: Rol sin permisos (solo Veterinario).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       404:
 *         description: Perfil de veterinario o turno no encontrado.
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
router.post('/', soloVeterinario, crearAtencion);

/**
 * @swagger
 * /api/atenciones/{id}:
 *   get:
 *     summary: Obtener detalle de una atención clínica por ID
 *     description: Devuelve una atención activa junto con sus vacunas aplicadas. El Cliente solo puede consultar atenciones de sus mascotas.
 *     tags: [Atenciones Clínicas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identificador de la atención clínica.
 *     responses:
 *       200:
 *         description: Atención clínica encontrada.
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
 *         description: La atención no pertenece a las mascotas del cliente autenticado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       404:
 *         description: Atención clínica no encontrada.
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
router.get('/:id', todosLosRoles, obtenerAtencionPorId);

/**
 * @swagger
 * /api/atenciones/{id}:
 *   put:
 *     summary: Modificar una atención clínica activa
 *     description: Exclusivo para Veterinario. Permite editar diagnostico, tratamiento, observaciones y proximo_control, registrando auditoría de modificación (RN-03). Las vacunas aplicadas son inmutables.
 *     tags: [Atenciones Clínicas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identificador de la atención clínica.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               diagnostico:
 *                 type: string
 *                 nullable: true
 *                 example: Ampliación de diagnóstico tras resultados de laboratorio.
 *               tratamiento:
 *                 type: string
 *                 nullable: true
 *                 example: Continuar medicación por 7 días.
 *               observaciones:
 *                 type: string
 *                 nullable: true
 *                 example: Evolución favorable.
 *               proximo_control:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *                 example: '2026-12-20'
 *     responses:
 *       200:
 *         description: Atención clínica actualizada exitosamente.
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
 *         description: Token inválido o no proporcionado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       403:
 *         description: Rol sin permisos (solo Veterinario).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       404:
 *         description: Atención clínica no encontrada o inactiva.
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
router.put('/:id', soloVeterinario, actualizarAtencion);

/**
 * @swagger
 * /api/atenciones/{id}:
 *   delete:
 *     summary: Dar de baja lógica una atención clínica
 *     description: Exclusivo para Administrador. Cambia activo a 0 y registra auditoría de modificación (HU-VET-10-d). No elimina físicamente el registro.
 *     tags: [Atenciones Clínicas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identificador de la atención clínica.
 *     responses:
 *       200:
 *         description: Atención clínica dada de baja lógicamente.
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
 *         description: Rol sin permisos (solo Administrador).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiEnvelope'
 *       404:
 *         description: Atención clínica no encontrada o ya inactiva.
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
router.delete('/:id', soloAdministrador, darDeBajaLogica);

export default router;