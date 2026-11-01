import { Router } from 'express';
import { 
    obtenerUsuarios, 
    obtenerUsuarioPorId, 
    crearUsuario, 
    eliminarUsuario, 
    actualizarMiPerfil 
} from './usuarios.controller';
import { verificarToken, verificarRol } from '../../middlewares/auth.middleware';

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
router.get('/', verificarRol([1]), obtenerUsuarios);
router.get('/:id', verificarRol([1]), obtenerUsuarioPorId);
router.post('/', verificarRol([1]), crearUsuario);
router.delete('/:id', verificarRol([1]), eliminarUsuario);

export default router;