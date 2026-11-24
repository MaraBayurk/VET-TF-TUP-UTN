import {
    ActualizarAtencionClinicaDTO,
    AlertaClinicaDTO,
    AtencionClinicaResponseDTO,
    CrearAtencionClinicaDTO,
    CrearVacunaAplicadaDTO,
    TipoAtencionDTO
} from './clinical.dto';
import { ClinicalRepository } from './clinical.repository';

export class ClinicalServiceError extends Error {
    public readonly statusCode: number;

    constructor(statusCode: number, message: string) {
        super(message);
        this.name = 'ClinicalServiceError';
        this.statusCode = statusCode;
    }
}

export interface UsuarioSesion {
    id_usuario: number;
    id_rol: number;
}

// ==========================================
// FUNCIONES AUXILIARES DE VALIDACIÓN (SRP)
// ==========================================

const esFechaFormatoValido = (fecha: unknown): fecha is string => {
    if (typeof fecha !== 'string') return false;

    const coincidencia = /^(\d{4})-(\d{2})-(\d{2})$/.exec(fecha);
    if (!coincidencia) return false;

    const fechaDate = new Date(
        Date.UTC(
            Number(coincidencia[1]),
            Number(coincidencia[2]) - 1,
            Number(coincidencia[3])
        )
    );

    return fechaDate.toISOString().slice(0, 10) === fecha;
};

const esTextoObligatorioValido = (
    valor: unknown,
    longitudMaxima: number
): valor is string => {
    return (
        typeof valor === 'string' &&
        valor.trim().length > 0 &&
        valor.trim().length <= longitudMaxima
    );
};

const normalizarTextoOpcional = (
    valor: unknown,
    nombreCampo: string,
    longitudMaxima?: number
): string | null => {
    if (valor === undefined || valor === null || valor === '') {
        return null;
    }

    if (typeof valor !== 'string') {
        throw new ClinicalServiceError(400, `El campo ${nombreCampo} debe ser un texto válido`);
    }

    const limpio = valor.trim();
    if (longitudMaxima && limpio.length > longitudMaxima) {
        throw new ClinicalServiceError(
            400,
            `El campo ${nombreCampo} no puede superar los ${longitudMaxima} caracteres`
        );
    }

    return limpio || null;
};

const validarListaVacunas = (vacunas: unknown): CrearVacunaAplicadaDTO[] => {
    if (!Array.isArray(vacunas) || vacunas.length === 0) {
        throw new ClinicalServiceError(
            400,
            'Para atenciones de tipo Vacuna debe registrar al menos una vacuna aplicada'
        );
    }

    return vacunas.map((item: any, indice: number) => {
        const posicion = indice + 1;

        if (!item || typeof item !== 'object') {
            throw new ClinicalServiceError(
                400,
                `La vacuna en la posición ${posicion} tiene un formato inválido`
            );
        }

        if (!esTextoObligatorioValido(item.nombre_vacuna, 120)) {
            throw new ClinicalServiceError(
                400,
                `La vacuna #${posicion} debe incluir un nombre_vacuna válido (máximo 120 caracteres)`
            );
        }

        if (!esTextoObligatorioValido(item.laboratorio, 120)) {
            throw new ClinicalServiceError(
                400,
                `La vacuna #${posicion} debe incluir un laboratorio válido (máximo 120 caracteres)`
            );
        }

        if (!esFechaFormatoValido(item.fecha_aplicacion)) {
            throw new ClinicalServiceError(
                400,
                `La vacuna #${posicion} debe incluir una fecha_aplicacion válida (YYYY-MM-DD)`
            );
        }

        let proximaAplicacion: string | null = null;
        if (
            item.proxima_aplicacion !== undefined &&
            item.proxima_aplicacion !== null &&
            item.proxima_aplicacion !== ''
        ) {
            if (!esFechaFormatoValido(item.proxima_aplicacion)) {
                throw new ClinicalServiceError(
                    400,
                    `La vacuna #${posicion} tiene una proxima_aplicacion inválida (YYYY-MM-DD)`
                );
            }
            if (item.proxima_aplicacion < item.fecha_aplicacion) {
                throw new ClinicalServiceError(
                    400,
                    `La proxima_aplicacion de la vacuna #${posicion} no puede ser anterior a fecha_aplicacion`
                );
            }
            proximaAplicacion = item.proxima_aplicacion;
        }

        return {
            nombre_vacuna: item.nombre_vacuna.trim(),
            dosis: normalizarTextoOpcional(item.dosis, `dosis (vacuna #${posicion})`, 80),
            lote: normalizarTextoOpcional(item.lote, `lote (vacuna #${posicion})`, 80),
            fecha_aplicacion: item.fecha_aplicacion,
            proxima_aplicacion: proximaAplicacion,
            laboratorio: item.laboratorio.trim()
        };
    });
};

const validarTurnoAsociado = async (
    idTurno: number,
    idMascota: number,
    idVeterinario: number
): Promise<void> => {
    const turno = await ClinicalRepository.obtenerTurnoParaAtencion(idTurno);

    if (!turno) {
        throw new ClinicalServiceError(404, 'El turno indicado no existe');
    }

    if (turno.estado_nombre.toLowerCase() !== 'aprobado') {
        throw new ClinicalServiceError(
            400,
            'Solo se puede registrar una atención clínica sobre un turno en estado APROBADO'
        );
    }

    if (Number(turno.id_mascota) !== idMascota) {
        throw new ClinicalServiceError(
            400,
            'La mascota indicada no coincide con la mascota del turno'
        );
    }

    if (Number(turno.id_veterinario) !== idVeterinario) {
        throw new ClinicalServiceError(
            400,
            'El turno seleccionado pertenece a otro veterinario'
        );
    }

    if (Number(turno.ya_tiene_atencion) === 1) {
        throw new ClinicalServiceError(
            400,
            'El turno indicado ya posee una atención clínica registrada'
        );
    }
};

// ==========================================
// SERVICIO PRINCIPAL DEL MÓDULO CLINICAL
// ==========================================

export class ClinicalService {

    static async obtenerTiposAtencion(): Promise<TipoAtencionDTO[]> {
        return ClinicalRepository.obtenerTiposAtencion();
    }

    static async crearAtencion(
        idUsuario: number,
        body: any
    ): Promise<number> {
        // RN-07: Resolver id_veterinario desde la sesión autenticada
        const idVeterinario = await ClinicalRepository.obtenerVeterinarioActivoPorUsuario(idUsuario);

        if (!idVeterinario) {
            throw new ClinicalServiceError(
                404,
                'No se encontró un perfil de veterinario activo asociado al usuario autenticado'
            );
        }

        // Validar mascota activa (RN-10)
        const idMascota = Number(body.id_mascota);
        if (!Number.isInteger(idMascota) || idMascota <= 0) {
            throw new ClinicalServiceError(400, 'Debe proporcionar un id_mascota válido');
        }

        const mascotaActiva = await ClinicalRepository.obtenerMascotaActivaPorId(idMascota);
        if (!mascotaActiva) {
            throw new ClinicalServiceError(
                400,
                'La mascota indicada no existe o se encuentra inactiva'
            );
        }

        // Validar catálogo TipoAtencion por ID (RN-08)
        const idTipoAtencion = Number(body.id_tipo_atencion);
        if (!Number.isInteger(idTipoAtencion) || idTipoAtencion <= 0) {
            throw new ClinicalServiceError(400, 'Debe proporcionar un id_tipo_atencion válido');
        }

        const tipoAtencion = await ClinicalRepository.obtenerTipoAtencionPorId(idTipoAtencion);
        if (!tipoAtencion) {
            throw new ClinicalServiceError(400, 'El tipo de atención indicado no existe');
        }

        // Validar campos clínicos opcionales
        const diagnostico = normalizarTextoOpcional(body.diagnostico, 'diagnostico');
        const tratamiento = normalizarTextoOpcional(body.tratamiento, 'tratamiento');
        const observaciones = normalizarTextoOpcional(body.observaciones, 'observaciones');

        let proximoControl: string | null = null;
        if (
            body.proximo_control !== undefined &&
            body.proximo_control !== null &&
            body.proximo_control !== ''
        ) {
            if (!esFechaFormatoValido(body.proximo_control)) {
                throw new ClinicalServiceError(
                    400,
                    'El campo proximo_control debe tener formato válido YYYY-MM-DD'
                );
            }
            proximoControl = body.proximo_control;
        }

        // Validar turno opcional (RN-09)
        let idTurno: number | null = null;
        if (body.id_turno !== undefined && body.id_turno !== null && body.id_turno !== '') {
            const turnoNum = Number(body.id_turno);
            if (!Number.isInteger(turnoNum) || turnoNum <= 0) {
                throw new ClinicalServiceError(400, 'El campo id_turno debe ser un entero positivo');
            }
            await validarTurnoAsociado(turnoNum, idMascota, idVeterinario);
            idTurno = turnoNum;
        }

        // Validar vacunas según TipoAtencion (RN-12 y HU-VET-10-c)
        const esVacuna = tipoAtencion.nombre.toLowerCase() === 'vacuna';
        let vacunasValidadas: CrearVacunaAplicadaDTO[] = [];

        if (esVacuna) {
            vacunasValidadas = validarListaVacunas(body.vacunas);
        } else if (Array.isArray(body.vacunas) && body.vacunas.length > 0) {
            throw new ClinicalServiceError(
                400,
                'Solo se pueden registrar vacunas aplicadas cuando el tipo de atención es Vacuna'
            );
        }

        const dto: CrearAtencionClinicaDTO = {
            id_mascota: idMascota,
            id_tipo_atencion: idTipoAtencion,
            id_turno: idTurno,
            diagnostico,
            tratamiento,
            observaciones,
            proximo_control: proximoControl,
            vacunas: vacunasValidadas
        };

        return ClinicalRepository.crearAtencionConTransaccion(dto, idVeterinario);
    }

    static async obtenerHistorialPorMascota(
        idMascota: number,
        usuario: UsuarioSesion
    ): Promise<AtencionClinicaResponseDTO[]> {
        const nombreRol = await ClinicalRepository.obtenerNombreRolPorId(usuario.id_rol);
        const esCliente = nombreRol?.toLowerCase() === 'cliente';

        if (esCliente) {
            const idCliente = await ClinicalRepository.obtenerClienteActivoPorUsuario(
                usuario.id_usuario
            );

            if (!idCliente) {
                throw new ClinicalServiceError(404, 'Perfil de cliente no encontrado o inactivo');
            }

            const mascota = await ClinicalRepository.obtenerMascotaActivaPorId(idMascota);

            if (!mascota || Number(mascota.id_cliente) !== idCliente) {
                throw new ClinicalServiceError(
                    403,
                    'Acceso denegado: solo puede consultar la libreta sanitaria de sus propias mascotas'
                );
            }
        }

        return ClinicalRepository.obtenerHistorialPorMascota(idMascota);
    }

    static async obtenerAtencionPorId(
        idAtencion: number,
        usuario: UsuarioSesion
    ): Promise<AtencionClinicaResponseDTO> {
        const atencion = await ClinicalRepository.obtenerPorId(idAtencion);

        if (!atencion) {
            throw new ClinicalServiceError(404, 'Atención clínica no encontrada');
        }

        const nombreRol = await ClinicalRepository.obtenerNombreRolPorId(usuario.id_rol);
        const esCliente = nombreRol?.toLowerCase() === 'cliente';

        if (esCliente) {
            const idCliente = await ClinicalRepository.obtenerClienteActivoPorUsuario(
                usuario.id_usuario
            );

            if (!idCliente || atencion.id_cliente !== idCliente) {
                throw new ClinicalServiceError(
                    403,
                    'Acceso denegado: la atención clínica no pertenece a sus mascotas'
                );
            }
        }

        const { id_cliente: _idClienteOculto, ...respuestaLimpia } = atencion;
        return respuestaLimpia;
    }

    static async obtenerAlertas(usuario: UsuarioSesion): Promise<AlertaClinicaDTO[]> {
        const nombreRol = await ClinicalRepository.obtenerNombreRolPorId(usuario.id_rol);
        const esCliente = nombreRol?.toLowerCase() === 'cliente';

        if (esCliente) {
            const idCliente = await ClinicalRepository.obtenerClienteActivoPorUsuario(
                usuario.id_usuario
            );

            if (!idCliente) {
                throw new ClinicalServiceError(404, 'Perfil de cliente no encontrado o inactivo');
            }

            return ClinicalRepository.obtenerAlertasProximos30Dias(idCliente);
        }

        return ClinicalRepository.obtenerAlertasProximos30Dias();
    }

    static async actualizarAtencion(
        idAtencion: number,
        idUsuarioModificador: number,
        body: any
    ): Promise<void> {
        const atencionExistente = await ClinicalRepository.obtenerPorId(idAtencion);

        if (!atencionExistente) {
            throw new ClinicalServiceError(404, 'Atención clínica no encontrada o inactiva');
        }

        const esVacuna =
            atencionExistente.tipo_atencion_nombre.trim().toLowerCase() === 'vacuna';

        const datosActualizar: ActualizarAtencionClinicaDTO = {};

        if (body.diagnostico !== undefined) {
            datosActualizar.diagnostico = normalizarTextoOpcional(body.diagnostico, 'diagnostico');
        }

        if (body.tratamiento !== undefined) {
            datosActualizar.tratamiento = normalizarTextoOpcional(body.tratamiento, 'tratamiento');
        }

        if (body.observaciones !== undefined) {
            datosActualizar.observaciones = normalizarTextoOpcional(
                body.observaciones,
                'observaciones'
            );
        }

        if (esVacuna) {
            datosActualizar.proximo_control = null;
        } else if (body.proximo_control !== undefined) {
            if (body.proximo_control === null || body.proximo_control === '') {
                datosActualizar.proximo_control = null;
            } else if (!esFechaFormatoValido(body.proximo_control)) {
                throw new ClinicalServiceError(
                    400,
                    'El campo proximo_control debe tener formato válido YYYY-MM-DD'
                );
            } else {
                datosActualizar.proximo_control = body.proximo_control;
            }
        }

        if (body.vacunas !== undefined) {
            if (!esVacuna) {
                throw new ClinicalServiceError(
                    400,
                    'Solo se pueden modificar vacunas aplicadas en atenciones de tipo Vacuna'
                );
            }
            datosActualizar.vacunas = validarListaVacunas(body.vacunas);
        }

        if (Object.keys(datosActualizar).length === 0) {
            throw new ClinicalServiceError(
                400,
                'Debe enviar al menos un campo válido para actualizar'
            );
        }

        const fueActualizada = await ClinicalRepository.actualizar(
            idAtencion,
            datosActualizar,
            idUsuarioModificador
        );

        if (!fueActualizada) {
            throw new ClinicalServiceError(404, 'Atención clínica no encontrada o inactiva');
        }
    }

    static async darDeBajaLogica(
        idAtencion: number,
        idUsuarioModificador: number
    ): Promise<void> {
        const fueDadaDeBaja = await ClinicalRepository.darDeBajaLogica(
            idAtencion,
            idUsuarioModificador
        );

        if (!fueDadaDeBaja) {
            throw new ClinicalServiceError(404, 'Atención clínica no encontrada o ya inactiva');
        }
    }
}