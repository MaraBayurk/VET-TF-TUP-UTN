import { Router } from 'express';
import { verificarToken, verificarRolPorNombre } from '../../middlewares/auth.middleware';
import { actualizarCliente, crearCliente, eliminarCliente, obtenerCliente, obtenerClientes } from './clientes.controller';

const router = Router();
const soloEquipo = verificarRolPorNombre(['Administrador', 'Veterinario']);
router.use(verificarToken, soloEquipo);
router.get('/', obtenerClientes);
router.get('/:id', obtenerCliente);
router.post('/', crearCliente);
router.put('/:id', actualizarCliente);
router.delete('/:id', eliminarCliente);
export default router;
