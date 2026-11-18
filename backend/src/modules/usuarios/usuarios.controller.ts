import { Request, Response } from 'express';
import { CrearUsuarioDTO, ActualizarPerfilDTO, ActualizarUsuarioDTO } from './usuarios.dto';
// Ajusta las rutas de estas importaciones si las tienes en carpetas distintas
import { encriptarPassword } from '../../utils/password.util'; 
import { validarDatosRequeridos } from '../../utils/validator.util';

import { usuariosRepository } from './usuarios.dependencies';

export const obtenerUsuarios = async (req: Request, res: Response): Promise<void> => {
    try {
        const usuarios = await usuariosRepository.obtenerTodos();
        res.status(200).json({ status: 'success', data: usuarios });
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
};

export const obtenerUsuarioPorId = async (req: Request, res: Response): Promise<void> => {
    try {
        const usuario = await usuariosRepository.obtenerPorId(req.params.id as string);
        if (!usuario) {
            res.status(404).json({ status: 'error', message: 'Usuario no encontrado o inactivo' });
            return;
        }
        res.status(200).json({ status: 'success', data: usuario });
    } catch (error) {
        console.error('Error al obtener usuario por id:', error);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
};

export const obtenerCatalogosUsuarios = async (_req: Request, res: Response): Promise<void> => {
    try {
        const [roles, especialidades] = await Promise.all([
            usuariosRepository.obtenerRoles(), usuariosRepository.obtenerEspecialidades()
        ]);
        res.status(200).json({ status: 'success', data: { roles, especialidades } });
    } catch (error) {
        console.error('Error al obtener catálogos de usuarios:', error);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
};

export const actualizarUsuario = async (req: Request, res: Response): Promise<void> => {
    try {
        const { nombre, apellido, numero_documento, email, telefono, id_rol, direccion, matricula, id_especialidad, password } = req.body;
        if (!nombre || !apellido || !numero_documento || !email || !id_rol) {
            res.status(400).json({ status: 'error', message: 'Completá nombre, apellido, documento, email y rol' });
            return;
        }
        if (!/^\S+@\S+\.\S+$/.test(email) || !Number.isInteger(Number(id_rol)) || (password !== undefined && password !== '' && (typeof password !== 'string' || password.length < 8))) {
            res.status(400).json({ status: 'error', message: 'Revisá el email, el rol y que la nueva contraseña tenga al menos 8 caracteres' });
            return;
        }
        const datos: ActualizarUsuarioDTO = { nombre, apellido, numero_documento, email, telefono, id_rol, direccion, matricula, id_especialidad };
        if (password) datos.password_hash = await encriptarPassword(password);
        const actualizado = await usuariosRepository.actualizar(req.params.id as string, datos);
        if (!actualizado) { res.status(404).json({ status: 'error', message: 'Usuario no encontrado o inactivo' }); return; }
        res.status(200).json({ status: 'success', message: 'Usuario actualizado exitosamente' });
    } catch (error: any) {
        if (['DUPLICATE_ENTRY', 'ROLE_CHANGE_NOT_SUPPORTED', 'MISSING_VET_DATA', 'ROLE_NOT_SUPPORTED', 'SPECIALTY_NOT_FOUND'].includes(error.message)) {
            const status = error.message === 'DUPLICATE_ENTRY' ? 409 : 400;
            const messages: Record<string, string> = {
                DUPLICATE_ENTRY: 'El email, documento o matrícula ya se encuentra registrado',
                ROLE_CHANGE_NOT_SUPPORTED: 'No se puede cambiar el rol de una cuenta existente',
                MISSING_VET_DATA: 'Para un veterinario, la matrícula y especialidad son obligatorias',
                ROLE_NOT_SUPPORTED: 'El rol indicado no existe o no está soportado',
                SPECIALTY_NOT_FOUND: 'La especialidad seleccionada no existe o está inactiva'
            };
            res.status(status).json({ status: 'error', message: messages[error.message] });
            return;
        }
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
};

export const crearUsuario = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!validarDatosRequeridos(req.body)) {
            res.status(400).json({ status: 'error', message: 'Faltan campos obligatorios base' });
            return;
        }

        const { nombre, apellido, numero_documento, email, password, telefono, id_rol, direccion, matricula, id_especialidad } = req.body;
        if (typeof password !== 'string' || password.length < 8 || !/^\S+@\S+\.\S+$/.test(email) || !Number.isInteger(Number(id_rol))) {
            res.status(400).json({ status: 'error', message: 'Revisá el email, la contraseña (mínimo 8 caracteres) y el rol' });
            return;
        }
        const password_hash = await encriptarPassword(password);

        const nuevoUsuario: CrearUsuarioDTO = {
            nombre, apellido, numero_documento, email, password_hash, telefono, id_rol,
            direccion, matricula, id_especialidad
        };

        const id_usuario = await usuariosRepository.crear(nuevoUsuario);

        res.status(201).json({
            status: 'success',
            message: 'Usuario y perfil extendido creados exitosamente',
            data: { id_usuario }
        });

    } catch (error: any) {
        if (error.message === 'DUPLICATE_ENTRY') {
            res.status(409).json({ status: 'error', message: 'El email, documento o matrícula ya se encuentra registrado' });
            return;
        }
        if (error.message === 'MISSING_VET_DATA') {
            res.status(400).json({ status: 'error', message: 'Para registrar un veterinario, la matrícula y la especialidad son obligatorias' });
            return;
        }
        if (error.message === 'ROLE_NOT_FOUND') {
            res.status(400).json({ status: 'error', message: 'El rol indicado no existe en el catálogo de roles' });
            return;
        }
        if (error.message === 'ROLE_NOT_SUPPORTED') {
            res.status(400).json({ status: 'error', message: 'El rol no tiene un perfil habilitado para el sistema' });
            return;
        }
        if (error.message === 'SPECIALTY_NOT_FOUND') {
            res.status(400).json({ status: 'error', message: 'La especialidad seleccionada no existe o está inactiva' });
            return;
        }

        console.error('Error al crear usuario:', error);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
};

export const eliminarUsuario = async (req: Request, res: Response): Promise<void> => {
    try {
        const fueEliminado = await usuariosRepository.eliminarLogicamente(req.params.id as string);

        if (!fueEliminado) {
            res.status(404).json({ status: 'error', message: 'Usuario no encontrado o ya se encontraba inactivo' });
            return;
        }

        res.status(200).json({ status: 'success', message: 'Usuario dado de baja exitosamente' });

    } catch (error) {
        console.error('Error al dar de baja al usuario:', error);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
};

export const actualizarMiPerfil = async (req: Request, res: Response): Promise<void> => {
    try {
        // Obtenemos los datos del usuario desde el token JWT inyectado por el middleware
        const idUsuario = (req as any).usuario.id_usuario; 
        const { telefono, direccion } = req.body;
        const datos: ActualizarPerfilDTO = { telefono, direccion };

        // Evitamos llamadas a la base de datos si el body está vacío
        if (telefono === undefined && direccion === undefined) {
            res.status(400).json({ status: 'error', message: 'No se enviaron datos para actualizar' });
            return;
        }

        await usuariosRepository.actualizarPerfil(idUsuario, datos);

        res.status(200).json({ 
            status: 'success', 
            message: 'Tus datos de contacto han sido actualizados exitosamente' 
        });

    } catch (error) {
        if ((error as Error).message === 'USER_NOT_FOUND') {
            res.status(404).json({ status: 'error', message: 'Usuario no encontrado o inactivo' });
            return;
        }
        if ((error as Error).message === 'PROFILE_MISMATCH') {
            res.status(409).json({ status: 'error', message: 'El perfil extendido del usuario no coincide con su rol' });
            return;
        }
        console.error('Error al actualizar el perfil:', error);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
};
