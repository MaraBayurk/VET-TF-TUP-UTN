import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { UsuariosRepository } from './usuarios.repository';
import { CrearUsuarioDTO } from './usuarios.dto';


// EXTRACT METHOD (Funciones auxiliares)
const validarDatosRequeridos = (datos: any): boolean => {
    const { nombre, apellido, numero_documento, email, password, id_rol } = datos;
    return Boolean(nombre && apellido && numero_documento && email && password && id_rol);
};

const encriptarPassword = async (password: string): Promise<string> => {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
};


// CONTROLADOR PRINCIPAL REFACTORIZADO

export const obtenerUsuarios = async (req: Request, res: Response): Promise<void> => {
    try {
        // Move Method: Delegamos la lógica al Repositorio
        const usuarios = await UsuariosRepository.obtenerTodos();
        res.status(200).json({ status: 'success', data: usuarios });
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ status: 'error', message: 'Error al consultar la base de datos' });
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
        console.error('Error al obtener el usuario:', error);
        res.status(500).json({ status: 'error', message: 'Error al consultar la base de datos' });
    }
};

export const crearUsuario = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!validarDatosRequeridos(req.body)) {
            res.status(400).json({ status: 'error', message: 'Faltan campos obligatorios base' });
            return;
        }

        // Agregamos los campos extra en la destructuración
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
        // Manejamos el error específico del veterinario sin romper la abstracción
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
        // Casting a string para evitar el error estricto de TypeScript
        const fueEliminado = await UsuariosRepository.eliminarLogicamente(req.params.id as string);

        if (!fueEliminado) {
            res.status(404).json({
                status: 'error',
                message: 'Usuario no encontrado o ya se encontraba inactivo'
            });
            return;
        }

        res.status(200).json({
            status: 'success',
            message: 'Usuario dado de baja exitosamente'
        });

    } catch (error) {
        console.error('Error al dar de baja al usuario:', error);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
};