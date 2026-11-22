import { Response } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { ClinicalService, ClinicalServiceError } from './clinical.service';

// ==========================================
// FUNCIONES AUXILIARES DEL CONTROLADOR (SRP)
// ==========================================

const parsearIdNumerico = (valor: string | string[] | undefined): number | null => {
    if (typeof valor !== 'string' || !/^\d+$/.test(valor)) {
        return null;
    }

    const numero = Number(valor);
    return Number.isInteger(numero) && numero > 0 ? numero : null;
};

const manejarError = (res: Response, error: unknown, contexto: string): void => {
    if (error instanceof ClinicalServiceError) {
        res.status(error.statusCode).json({
            status: 'error',
            message: error.message
        });
        return;
    }

    console.error(`Error en ${contexto}:`, error);
    res.status(500).json({
        status: 'error',
        message: 'Error interno del servidor'
    });
};

// ==========================================
// CATÁLOGO: TIPOS DE ATENCIÓN (RN-08)
// ==========================================

export const obtenerTiposAtencion = async (
    _req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const tipos = await ClinicalService.obtenerTiposAtencion();

        res.status(200).json({
            status: 'success',
            data: tipos
        });
    } catch (error) {
        manejarError(res, error, 'obtenerTiposAtencion');
    }
};

// ==========================================
// REGISTRAR ATENCIÓN CLÍNICA (HU-VET-10-a y 10-c)
// ==========================================

export const crearAtencion = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const usuario = req.usuario;

        if (!usuario) {
            res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
            return;
        }

        const idAtencion = await ClinicalService.crearAtencion(
            usuario.id_usuario,
            req.body
        );

        res.status(201).json({
            status: 'success',
            message: 'Atención clínica registrada exitosamente',
            data: {
                id_atencion: idAtencion
            }
        });
    } catch (error) {
        manejarError(res, error, 'crearAtencion');
    }
};

// ==========================================
// LIBRETA SANITARIA POR MASCOTA (HU-VET-11-a)
// ==========================================

export const obtenerHistorialPorMascota = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const usuario = req.usuario;

        if (!usuario) {
            res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
            return;
        }

        const idMascota = parsearIdNumerico(req.params.idMascota);

        if (!idMascota) {
            res.status(400).json({
                status: 'error',
                message: 'El identificador de la mascota no es válido'
            });
            return;
        }

        const historial = await ClinicalService.obtenerHistorialPorMascota(
            idMascota,
            usuario
        );

        res.status(200).json({
            status: 'success',
            data: historial
        });
    } catch (error) {
        manejarError(res, error, 'obtenerHistorialPorMascota');
    }
};

// ==========================================
// PANEL DE ALERTAS (HU-VET-11-b)
// ==========================================

export const obtenerAlertas = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const usuario = req.usuario;

        if (!usuario) {
            res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
            return;
        }

        const alertas = await ClinicalService.obtenerAlertas(usuario);

        res.status(200).json({
            status: 'success',
            data: alertas
        });
    } catch (error) {
        manejarError(res, error, 'obtenerAlertas');
    }
};

// ==========================================
// OBTENER DETALLE DE ATENCIÓN POR ID
// ==========================================

export const obtenerAtencionPorId = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const usuario = req.usuario;

        if (!usuario) {
            res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
            return;
        }

        const idAtencion = parsearIdNumerico(req.params.id);

        if (!idAtencion) {
            res.status(400).json({
                status: 'error',
                message: 'El identificador de la atención clínica no es válido'
            });
            return;
        }

        const atencion = await ClinicalService.obtenerAtencionPorId(
            idAtencion,
            usuario
        );

        res.status(200).json({
            status: 'success',
            data: atencion
        });
    } catch (error) {
        manejarError(res, error, 'obtenerAtencionPorId');
    }
};

// ==========================================
// MODIFICAR ATENCIÓN CLÍNICA (HU-VET-10-b, RN-03)
// ==========================================

export const actualizarAtencion = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const usuario = req.usuario;

        if (!usuario) {
            res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
            return;
        }

        const idAtencion = parsearIdNumerico(req.params.id);

        if (!idAtencion) {
            res.status(400).json({
                status: 'error',
                message: 'El identificador de la atención clínica no es válido'
            });
            return;
        }

        await ClinicalService.actualizarAtencion(
            idAtencion,
            usuario.id_usuario,
            req.body
        );

        res.status(200).json({
            status: 'success',
            message: 'Atención clínica actualizada exitosamente'
        });
    } catch (error) {
        manejarError(res, error, 'actualizarAtencion');
    }
};

// ==========================================
// BAJA LÓGICA DE ATENCIÓN CLÍNICA (HU-VET-10-d)
// ==========================================

export const darDeBajaLogica = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const usuario = req.usuario;

        if (!usuario) {
            res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
            return;
        }

        const idAtencion = parsearIdNumerico(req.params.id);

        if (!idAtencion) {
            res.status(400).json({
                status: 'error',
                message: 'El identificador de la atención clínica no es válido'
            });
            return;
        }

        await ClinicalService.darDeBajaLogica(
            idAtencion,
            usuario.id_usuario
        );

        res.status(200).json({
            status: 'success',
            message: 'Atención clínica dada de baja lógicamente'
        });
    } catch (error) {
        manejarError(res, error, 'darDeBajaLogica');
    }
};