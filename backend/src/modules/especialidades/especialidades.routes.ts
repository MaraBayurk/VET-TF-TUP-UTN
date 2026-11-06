import { Router } from 'express';
import {
    obtenerEspecialidades,
    obtenerEspecialidadPorId,
    crearEspecialidad,
    actualizarEspecialidad,
    eliminarEspecialidad
} from './especialidades.controller';
import { verificarToken, verificarRol } from '../../middlewares/auth.middleware';
import { ROLES } from "../../constants/roles";

const router = Router();

// Blindaje de seguridad: Token obligatorio y solo Rol 1 (Administrador)
router.use(verificarToken);
router.use(verificarRol([ROLES.ADMINISTRADOR]));

router.get('/', obtenerEspecialidades);
router.get('/:id', obtenerEspecialidadPorId);
router.post('/', crearEspecialidad);
router.put('/:id', actualizarEspecialidad);
router.delete('/:id', eliminarEspecialidad);

export default router;