import { Request, Response } from 'express';
import { EspecialidadesRepository } from './especialidades.repository';
import { CrearEspecialidadDTO, ActualizarEspecialidadDTO } from './especialidades.dto';

export const obtenerEspecialidades = async (req: Request, res: Response): Promise<void> => {
    try {
        const especialidades = await EspecialidadesRepository.obtenerTodas();
        res.status(200).json({ status: 'success', data: especialidades });
    } catch (error) {
        console.error('Error al obtener especialidades:', error);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
};

export const obtenerEspecialidadPorId = async (req: Request, res: Response): Promise<void> => {
    try {
        const especialidad = await EspecialidadesRepository.obtenerPorId(req.params.id as string);
        if (!especialidad) {
            res.status(404).json({ status: 'error', message: 'Especialidad no encontrada o inactiva' });
            return;
        }
        res.status(200).json({ status: 'success', data: especialidad });
    } catch (error) {
        console.error('Error al obtener especialidad:', error);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
};

export const crearEspecialidad = async (req: Request, res: Response): Promise<void> => {
    try {
        const { nombre, descripcion } = req.body;
        if (!nombre) {
            res.status(400).json({ status: 'error', message: 'El nombre de la especialidad es obligatorio' });
            return;
        }

        const nuevaEspecialidad: CrearEspecialidadDTO = { nombre, descripcion };
        const id_especialidad = await EspecialidadesRepository.crear(nuevaEspecialidad);

        res.status(201).json({
            status: 'success',
            message: 'Especialidad creada exitosamente',
            data: { id_especialidad }
        });
    } catch (error: any) {
        if (error.message === 'DUPLICATE_NAME') {
            res.status(409).json({ status: 'error', message: 'Ya existe una especialidad con ese nombre' });
            return;
        }
        console.error('Error al crear especialidad:', error);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
};

export const actualizarEspecialidad = async (req: Request, res: Response): Promise<void> => {
    try {
        const { nombre, descripcion } = req.body;
        const datosActualizar: ActualizarEspecialidadDTO = { nombre, descripcion };

        const fueActualizada = await EspecialidadesRepository.actualizar(req.params.id as string, datosActualizar);

        if (!fueActualizada) {
            res.status(404).json({ status: 'error', message: 'Especialidad no encontrada, inactiva o sin cambios' });
            return;
        }

        res.status(200).json({ status: 'success', message: 'Especialidad actualizada exitosamente' });
    } catch (error: any) {
        if (error.message === 'DUPLICATE_NAME') {
            res.status(409).json({ status: 'error', message: 'El nuevo nombre ya está en uso por otra especialidad' });
            return;
        }
        console.error('Error al actualizar especialidad:', error);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
};

export const eliminarEspecialidad = async (req: Request, res: Response): Promise<void> => {
    try {
        const fueEliminada = await EspecialidadesRepository.eliminarLogicamente(req.params.id as string);
        if (!fueEliminada) {
            res.status(404).json({ status: 'error', message: 'Especialidad no encontrada o ya inactiva' });
            return;
        }
        res.status(200).json({ status: 'success', message: 'Especialidad dada de baja exitosamente' });
    } catch (error) {
        console.error('Error al dar de baja la especialidad:', error);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
};