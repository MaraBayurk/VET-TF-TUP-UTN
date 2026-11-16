import { Router } from 'express';
import {
    obtenerMascotas,
    obtenerMascotaPorId,
    crearMascota,
    actualizarMascota,
    eliminarMascota
} from './mascotas.controller';
import { verificarToken, verificarRol } from '../../middlewares/auth.middleware';
import { ROLES } from "../../constants/roles";

const router = Router();

router.use(verificarToken);

// ==========================================
// RUTAS ABM (Admin, Veterinario, Cliente)
// ==========================================
router.get('/', verificarRol([
  ROLES.ADMINISTRADOR,
  ROLES.CLIENTE,
  ROLES.VETERINARIO,
]), obtenerMascotas);
router.get('/:id',verificarRol([
  ROLES.ADMINISTRADOR,
  ROLES.CLIENTE,
  ROLES.VETERINARIO,
]), obtenerMascotaPorId);
router.post('/', verificarRol([
  ROLES.ADMINISTRADOR,
  ROLES.CLIENTE,
  ROLES.VETERINARIO,
]), crearMascota);
router.put('/:id', verificarRol([
  ROLES.ADMINISTRADOR,
  ROLES.CLIENTE,
  ROLES.VETERINARIO,
]), actualizarMascota);

// ==========================================
// RUTA EXCLUSIVA CLÍNICA (Admin, Veterinario)
// ==========================================
// HU-VET-05: El cliente (2) tiene prohibido dar de baja
router.delete('/:id', verificarRol([ROLES.ADMINISTRADOR, ROLES.VETERINARIO]), eliminarMascota);

export default router;