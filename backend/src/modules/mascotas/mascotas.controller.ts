import { Request, Response } from 'express';
import { MascotasRepository } from './mascotas.repository';
import { CrearMascotaDTO, ActualizarMascotaDTO } from './mascotas.dto';

export const obtenerMascotas = async (req: Request, res: Response): Promise<void> => {
    try {
        const idRol = (req as any).usuario.id_rol;
        const idUsuario = (req as any).usuario.id_usuario;

        // HU-VET-06-a: Si es Cliente, solo ve las suyas. Si es Admin/Vet, ve todas.
        if (idRol === 2) {
            const idCliente = await MascotasRepository.obtenerIdClientePorUsuario(idUsuario);
            if (!idCliente) {
                res.status(404).json({ status: 'error', message: 'Perfil de cliente no encontrado' });
                return;
            }
            const mascotasPropias = await MascotasRepository.obtenerPorCliente(idCliente);
            res.status(200).json({ status: 'success', data: mascotasPropias });
        } else {
            const mascotas = await MascotasRepository.obtenerTodas();
            res.status(200).json({ status: 'success', data: mascotas });
        }
    } catch (error) {
        console.error('Error al obtener mascotas:', error);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
};

export const obtenerMascotaPorId = async (req: Request, res: Response): Promise<void> => {
    try {
        const idRol = (req as any).usuario.id_rol;
        const mascota = await MascotasRepository.obtenerPorId(req.params.id as string);

        if (!mascota) {
            res.status(404).json({ status: 'error', message: 'Mascota no encontrada o inactiva' });
            return;
        }

        // RN-13: Validación de propiedad para Clientes
        if (idRol === 2) {
            const idCliente = await MascotasRepository.obtenerIdClientePorUsuario((req as any).usuario.id_usuario);
            if (mascota.id_cliente !== idCliente) {
                res.status(403).json({ status: 'error', message: 'Acceso denegado: La mascota no le pertenece' });
                return;
            }
        }

        res.status(200).json({ status: 'success', data: mascota });
    } catch (error) {
        console.error('Error al obtener mascota:', error);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
};

export const crearMascota = async (req: Request, res: Response): Promise<void> => {
    try {
        const idRol = (req as any).usuario.id_rol;
        const idUsuario = (req as any).usuario.id_usuario;
        const { nombre, especie, raza, fecha_nacimiento, sexo, observaciones } = req.body;

        // HU-VET-04: El cliente fuerza su propio ID. Admin/Vet lo envían por body.
        let id_cliente_asignado = req.body.id_cliente;
        if (idRol === 2) {
            const idClientePropio = await MascotasRepository.obtenerIdClientePorUsuario(idUsuario);
            if (!idClientePropio) {
                res.status(400).json({ status: 'error', message: 'No se encontró un perfil de cliente asociado a su usuario' });
                return;
            }
            id_cliente_asignado = idClientePropio;
        }

        if (!id_cliente_asignado || !nombre || !especie || !sexo) {
            res.status(400).json({ status: 'error', message: 'Faltan campos obligatorios' });
            return;
        }

        // HU-VET-04: Validación de fecha no futura
        if (fecha_nacimiento) {
            const fechaNac = new Date(fecha_nacimiento);
            const hoy = new Date();
            if (fechaNac > hoy) {
                res.status(400).json({ status: 'error', message: 'La fecha de nacimiento no puede ser futura' });
                return;
            }
        }

        const nuevaMascota: CrearMascotaDTO = {
            id_cliente: id_cliente_asignado, nombre, especie, raza, fecha_nacimiento, sexo, observaciones
        };
        const id_mascota = await MascotasRepository.crear(nuevaMascota);

        res.status(201).json({ status: 'success', message: 'Mascota registrada exitosamente', data: { id_mascota } });
    } catch (error: any) {
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            res.status(400).json({ status: 'error', message: 'El id_cliente proporcionado no existe en el sistema' });
            return;
        }
        console.error('Error al crear mascota:', error);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
};

export const actualizarMascota = async (req: Request, res: Response): Promise<void> => {
    try {
        const idRol = (req as any).usuario.id_rol;
        const mascotaExistente = await MascotasRepository.obtenerPorId(req.params.id as string);

        if (!mascotaExistente) {
            res.status(404).json({ status: 'error', message: 'Mascota no encontrada o inactiva' });
            return;
        }

        const { nombre, especie, raza, fecha_nacimiento, sexo, observaciones } = req.body;
        let datosActualizar: ActualizarMascotaDTO = {};

        if (idRol === 2) {
            // HU-VET-06-b: Validación de propiedad y filtrado de campos para Cliente
            const idCliente = await MascotasRepository.obtenerIdClientePorUsuario((req as any).usuario.id_usuario);
            if (mascotaExistente.id_cliente !== idCliente) {
                res.status(403).json({ status: 'error', message: 'Acceso denegado: La mascota no le pertenece' });
                return;
            }
            // El cliente solo puede editar estos 3 campos (descarta nombre, especie, fecha)
            datosActualizar = { raza, sexo, observaciones };
        } else {
            // Admin y Veterinario pueden actualizar todo
            datosActualizar = { nombre, especie, raza, fecha_nacimiento, sexo, observaciones };
        }

        const fueActualizada = await MascotasRepository.actualizar(req.params.id as string, datosActualizar);

        if (!fueActualizada) {
            res.status(400).json({ status: 'error', message: 'No se enviaron campos válidos para actualizar' });
            return;
        }

        res.status(200).json({ status: 'success', message: 'Datos de la mascota actualizados exitosamente' });
    } catch (error) {
        console.error('Error al actualizar mascota:', error);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
};

export const eliminarMascota = async (req: Request, res: Response): Promise<void> => {
    try {
        // HU-VET-05: El controlador ya está protegido por rutas (solo rol 1 y 3), pero por seguridad extra:
        const fueEliminada = await MascotasRepository.eliminarLogicamenteConCascada(req.params.id as string);
        if (!fueEliminada) {
            res.status(404).json({ status: 'error', message: 'Mascota no encontrada o ya inactiva' });
            return;
        }
        res.status(200).json({ status: 'success', message: 'Mascota dada de baja y turnos futuros cancelados' });
    } catch (error) {
        console.error('Error al dar de baja la mascota:', error);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
};