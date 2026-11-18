import { Request, Response } from 'express';
import { encriptarPassword } from '../../utils/password.util';
import { clientesRepository, type ClienteInput } from './clientes.repository';

const validarId = (id: string | string[]): id is string => typeof id === 'string' && /^\d+$/.test(id);
const getInput = (body: any, passwordHash?: string): ClienteInput => ({
  nombre: String(body.nombre ?? '').trim(),
  apellido: String(body.apellido ?? '').trim(),
  numero_documento: String(body.numero_documento ?? '').trim(),
  email: String(body.email ?? '').trim().toLowerCase(),
  telefono: String(body.telefono ?? '').trim(),
  direccion: String(body.direccion ?? '').trim(),
  ...(passwordHash ? { password_hash: passwordHash } : {}),
});
const validate = (data: ClienteInput, password?: unknown): string | null => {
  if (!data.nombre || data.nombre.length > 100 || !data.apellido || data.apellido.length > 100) return 'Nombre y apellido son obligatorios (máximo 100 caracteres)';
  if (!data.numero_documento || data.numero_documento.length > 20) return 'El documento es obligatorio (máximo 20 caracteres)';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) || data.email.length > 150) return 'Ingresá un email válido (máximo 150 caracteres)';
  if (data.telefono.length > 30 || data.direccion.length > 255) return 'El teléfono o la dirección superan el máximo permitido';
  if (password !== undefined && (typeof password !== 'string' || password.length < 8)) return 'La contraseña debe tener al menos 8 caracteres';
  return null;
};
const handleError = (res: Response, error: any, action: string) => {
  if (error.message === 'DUPLICATE_ENTRY') { res.status(409).json({ status: 'error', message: 'El email o documento ya se encuentra registrado' }); return; }
  if (error.message === 'CLIENT_ROLE_NOT_FOUND') { res.status(500).json({ status: 'error', message: 'No está configurado el rol Cliente' }); return; }
  console.error(`Error al ${action} cliente:`, error);
  res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
};

export const obtenerClientes = async (_req: Request, res: Response): Promise<void> => {
  try { res.status(200).json({ status: 'success', data: await clientesRepository.obtenerTodos() }); }
  catch (error) { handleError(res, error, 'obtener'); }
};
export const obtenerCliente = async (req: Request, res: Response): Promise<void> => {
  if (!validarId(req.params.id)) { res.status(400).json({ status: 'error', message: 'Identificador de cliente inválido' }); return; }
  try {
    const cliente = await clientesRepository.obtenerPorId(req.params.id);
    if (!cliente) { res.status(404).json({ status: 'error', message: 'Cliente no encontrado' }); return; }
    res.status(200).json({ status: 'success', data: cliente });
  } catch (error) { handleError(res, error, 'obtener'); }
};
export const crearCliente = async (req: Request, res: Response): Promise<void> => {
  const input = getInput(req.body);
  const validationError = validate(input, req.body.password);
  if (validationError) { res.status(400).json({ status: 'error', message: validationError }); return; }
  try {
    input.password_hash = await encriptarPassword(req.body.password);
    const id_cliente = await clientesRepository.crear(input);
    res.status(201).json({ status: 'success', message: 'Cliente creado exitosamente', data: { id_cliente } });
  } catch (error) { handleError(res, error, 'crear'); }
};
export const actualizarCliente = async (req: Request, res: Response): Promise<void> => {
  if (!validarId(req.params.id)) { res.status(400).json({ status: 'error', message: 'Identificador de cliente inválido' }); return; }
  const input = getInput(req.body);
  const password = req.body.password;
  const validationError = validate(input, password ? password : undefined);
  if (validationError) { res.status(400).json({ status: 'error', message: validationError }); return; }
  try {
    if (password) input.password_hash = await encriptarPassword(password);
    const updated = await clientesRepository.actualizar(req.params.id, input);
    if (!updated) { res.status(404).json({ status: 'error', message: 'Cliente no encontrado' }); return; }
    res.status(200).json({ status: 'success', message: 'Cliente actualizado exitosamente' });
  } catch (error) { handleError(res, error, 'actualizar'); }
};
export const eliminarCliente = async (req: Request, res: Response): Promise<void> => {
  if (!validarId(req.params.id)) { res.status(400).json({ status: 'error', message: 'Identificador de cliente inválido' }); return; }
  try {
    const deleted = await clientesRepository.darDeBaja(req.params.id);
    if (!deleted) { res.status(404).json({ status: 'error', message: 'Cliente no encontrado o ya inactivo' }); return; }
    res.status(200).json({ status: 'success', message: 'Cliente dado de baja exitosamente' });
  } catch (error) { handleError(res, error, 'dar de baja'); }
};
