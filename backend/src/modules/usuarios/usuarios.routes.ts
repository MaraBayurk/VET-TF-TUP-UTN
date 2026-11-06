import { Router } from 'express';
import { 
    obtenerUsuarios, 
    obtenerUsuarioPorId, 
    crearUsuario, 
    eliminarUsuario, 
    actualizarMiPerfil 
} from './usuarios.controller';
import { verificarToken, verificarRol } from '../../middlewares/auth.middleware';
import { ROLES } from "../../constants/roles";

const router = Router();

// Middleware global para este router: Todos deben estar logueados
router.use(verificarToken);

// ==========================================
// RUTAS DE PERFIL (Cualquier usuario autenticado)
// ==========================================
// IMPORTANTE: Esta ruta debe ir antes de las rutas con /:id
router.put('/perfil', actualizarMiPerfil);

// ==========================================
// RUTAS ADMINISTRATIVAS (Solo id_rol: 1)
// ==========================================
router.get('/', verificarRol([ROLES.ADMINISTRADOR]), obtenerUsuarios);
router.get('/:id', verificarRol([ROLES.ADMINISTRADOR]), obtenerUsuarioPorId);
router.post('/', verificarRol([ROLES.ADMINISTRADOR]), crearUsuario);
router.delete('/:id', verificarRol([ROLES.ADMINISTRADOR]), eliminarUsuario);

export default router;