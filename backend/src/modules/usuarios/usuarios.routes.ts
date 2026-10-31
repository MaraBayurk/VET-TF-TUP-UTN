import { Router } from 'express';
import { obtenerUsuarios, obtenerUsuarioPorId, crearUsuario, eliminarUsuario } from './usuarios.controller';
import { verificarToken, verificarRol } from '../../middlewares/auth.middleware';

const router = Router();

// 1. Inyectamos el middleware de autenticación a TODAS las rutas de este archivo
router.use(verificarToken);

// 2. Definimos las rutas y validamos que solo el Administrador (id_rol: 1) tenga acceso al ABML
router.get('/', verificarRol([1]), obtenerUsuarios);
router.get('/:id', verificarRol([1]), obtenerUsuarioPorId);
router.post('/', verificarRol([1]), crearUsuario);
router.delete('/:id', verificarRol([1]), eliminarUsuario);

export default router;