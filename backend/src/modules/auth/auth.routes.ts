import { Router } from 'express';
import { login } from './auth.controller';
import { verificarToken, verificarRol, AuthRequest } from '../../middlewares/auth.middleware';
import { Response } from 'express';

const router = Router();

// Ruta pública
router.post('/login', login);

// Ruta protegida de prueba (Solo para administradores, id_rol: 1)
router.get('/perfil-admin', verificarToken, verificarRol([1]), (req: AuthRequest, res: Response) => {
    res.status(200).json({
        status: 'success',
        message: '¡Bienvenido administrador! Tienes acceso a esta ruta protegida.',
        usuarioAutenticado: req.usuario
    });
});

export default router;