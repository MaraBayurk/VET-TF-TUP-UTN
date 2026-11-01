import { Request, Response } from 'express';
import { UsuariosRepository } from './usuarios.repository';
import { CrearUsuarioDTO, ActualizarPerfilDTO } from './usuarios.dto';
// Ajusta las rutas de estas importaciones si las tienes en carpetas distintas
import { encriptarPassword } from '../../utils/password.util'; 
import { validarDatosRequeridos } from '../../utils/validator.util';

export const obtenerUsuarios = async (req: Request, res: Response): Promise<void> => {
    try {
        const usuarios = await UsuariosRepository.obtenerTodos();
        res.status(200).json({ status: 'success', data: usuarios });
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
};

export const obtenerUsuarioPorId = async (req: Request, res: Response): Promise<void> => {
    try {
        const usuario = await UsuariosRepository.obtenerPorId(req.params.id as string);
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

export const crearUsuario = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!validarDatosRequeridos(req.body)) {
            res.status(400).json({ status: 'error', message: 'Faltan campos obligatorios base' });
            return;
        }

        const { nombre, apellido, numero_documento, email, password, telefono, id_rol, direccion, matricula, id_especialidad } = req.body;
        const password_hash = await encriptarPassword(password);

        const nuevoUsuario: CrearUsuarioDTO = {
            nombre, apellido, numero_documento, email, password_hash, telefono, id_rol,
            direccion, matricula, id_especialidad
        };

        const id_usuario = await UsuariosRepository.crear(nuevoUsuario);

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

        console.error('Error al crear usuario:', error);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
};

export const eliminarUsuario = async (req: Request, res: Response): Promise<void> => {
    try {
        const fueEliminado = await UsuariosRepository.eliminarLogicamente(req.params.id as string);

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
        const idRol = (req as any).usuario.id_rol;
        
        const { telefono, direccion } = req.body;
        const datos: ActualizarPerfilDTO = { telefono, direccion };

        // Evitamos llamadas a la base de datos si el body está vacío
        if (telefono === undefined && direccion === undefined) {
            res.status(400).json({ status: 'error', message: 'No se enviaron datos para actualizar' });
            return;
        }

        await UsuariosRepository.actualizarPerfil(idUsuario, idRol, datos);

        res.status(200).json({ 
            status: 'success', 
            message: 'Tus datos de contacto han sido actualizados exitosamente' 
        });

    } catch (error) {
        console.error('Error al actualizar el perfil:', error);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
};