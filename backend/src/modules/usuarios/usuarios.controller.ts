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
        // 1. Extract Method: Validación limpia
        if (!validarDatosRequeridos(req.body)) {
            res.status(400).json({ status: 'error', message: 'Faltan campos obligatorios' });
            return;
        }

        const { nombre, apellido, numero_documento, email, password, telefono, id_rol } = req.body;

        // 2. Extract Method: Criptografía aislada
        const password_hash = await encriptarPassword(password);

        // 3. Introduce Parameter Object: Mapeo estricto mediante DTO
        const nuevoUsuario: CrearUsuarioDTO = {
            nombre,
            apellido,
            numero_documento,
            email,
            password_hash,
            telefono,
            id_rol
        };

        // 4. Move Method: El controlador ya no sabe de SQL, solo delega
        const id_usuario = await UsuariosRepository.crear(nuevoUsuario);

        res.status(201).json({
            status: 'success',
            message: 'Usuario creado exitosamente',
            data: { id_usuario }
        });

    } catch (error: any) {
        // 5. Abstracción de Errores: Ya no dependemos de "ER_DUP_ENTRY" de MariaDB
        if (error.message === 'DUPLICATE_ENTRY') {
            res.status(409).json({ status: 'error', message: 'El email o número de documento ya se encuentra registrado' });
            return;
        }

        console.error('Error al crear usuario:', error);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
};