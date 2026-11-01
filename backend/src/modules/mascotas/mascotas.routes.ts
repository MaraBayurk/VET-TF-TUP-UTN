import { Router } from 'express';
import {
    obtenerMascotas,
    obtenerMascotaPorId,
    crearMascota,
    actualizarMascota,
    eliminarMascota
} from './mascotas.controller';
import { verificarToken, verificarRol } from '../../middlewares/auth.middleware';

const router = Router();

router.use(verificarToken);

// ==========================================
// RUTAS ABM (Admin, Veterinario, Cliente)
// ==========================================
router.get('/', verificarRol([1, 2, 3]), obtenerMascotas);
router.get('/:id', verificarRol([1, 2, 3]), obtenerMascotaPorId);
router.post('/', verificarRol([1, 2, 3]), crearMascota);
router.put('/:id', verificarRol([1, 2, 3]), actualizarMascota);

// ==========================================
// RUTA EXCLUSIVA CLÍNICA (Admin, Veterinario)
// ==========================================
// HU-VET-05: El cliente (2) tiene prohibido dar de baja
router.delete('/:id', verificarRol([1, 3]), eliminarMascota);

export default router;