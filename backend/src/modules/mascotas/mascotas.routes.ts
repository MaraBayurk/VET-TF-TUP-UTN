
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

router.get('/', todosLosRoles, obtenerMascotas);
router.get('/:id', todosLosRoles, obtenerMascotaPorId);
router.post('/', todosLosRoles, crearMascota);
router.put('/:id', todosLosRoles, actualizarMascota);
router.delete('/:id', rolesDeGestion, eliminarMascota);

export default router;
