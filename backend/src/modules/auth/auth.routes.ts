import { Router } from 'express';
import { login } from './auth.controller';

const router = Router();

// Vinculamos el método POST de la ruta '/login' con nuestro controlador
router.post('/login', login);

export default router;