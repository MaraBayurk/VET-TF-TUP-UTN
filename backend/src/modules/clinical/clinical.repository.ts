import pool from '../../config/db';
import {
    ActualizarAtencionClinicaDTO,
    AlertaClinicaDTO,
    AtencionClinicaResponseDTO,
    CrearAtencionClinicaDTO,
    TipoAtencionDTO,
    VacunaAplicadaResponseDTO
} from './clinical.dto';

export interface TurnoValidacionRow {
    id_turno: number;
    id_mascota: number;
    id_veterinario: number;
    estado_nombre: string;
    ya_tiene_atencion: number;
}

export interface MascotaActivaRow {
    id_mascota: number;
    id_cliente: number;
}

export class ClinicalRepository {

    // ==========================================
    // UTILIDADES DE IDENTIDAD Y CATÁLOGOS (RN-07, RN-08)
    // ==========================================

    static async obtenerNombreRolPorId(idRol: number): Promise<string | null> {
        const [rows]: any = await pool.query(
            `SELECT nombre
             FROM Rol
             WHERE id_rol = ?
             LIMIT 1`,
            [idRol]
        );

        return rows.length > 0 ? rows[0].nombre : null;
    }

    static async obtenerVeterinarioActivoPorUsuario(idUsuario: number): Promise<number | null> {
        const [rows]: any = await pool.query(
            `SELECT v.id_veterinario
             FROM Veterinario v
             INNER JOIN Usuario u ON u.id_usuario = v.id_usuario
             WHERE v.id_usuario = ?
             AND u.activo = 1
             LIMIT 1`,
            [idUsuario]
        );

        return rows.length > 0 ? Number(rows[0].id_veterinario) : null;
    }

    static async obtenerClienteActivoPorUsuario(idUsuario: number): Promise<number | null> {
        const [rows]: any = await pool.query(
            `SELECT c.id_cliente
             FROM Cliente c
             INNER JOIN Usuario u ON u.id_usuario = c.id_usuario
             WHERE c.id_usuario = ?
             AND u.activo = 1
             LIMIT 1`,
            [idUsuario]
        );

        return rows.length > 0 ? Number(rows[0].id_cliente) : null;
    }

    static async obtenerTiposAtencion(): Promise<TipoAtencionDTO[]> {
        const [rows] = await pool.query(
            `SELECT id_tipo_atencion, nombre
             FROM TipoAtencion
             ORDER BY id_tipo_atencion ASC`
        );

        return rows as TipoAtencionDTO[];
    }

    static async obtenerTipoAtencionPorId(idTipoAtencion: number): Promise<TipoAtencionDTO | null> {
        const [rows]: any = await pool.query(
            `SELECT id_tipo_atencion, nombre
             FROM TipoAtencion
             WHERE id_tipo_atencion = ?
             LIMIT 1`,
            [idTipoAtencion]
        );

        return rows.length > 0 ? (rows[0] as TipoAtencionDTO) : null;
    }

    // ==========================================
    // VALIDACIONES DE INTEGRIDAD DE DOMINIO
    // ==========================================

    static async obtenerMascotaActivaPorId(idMascota: number): Promise<MascotaActivaRow | null> {
        const [rows]: any = await pool.query(
            `SELECT m.id_mascota, m.id_cliente
             FROM Mascota m
             WHERE m.id_mascota = ?
             AND m.activo = 1
             LIMIT 1`,
            [idMascota]
        );

        return rows.length > 0 ? (rows[0] as MascotaActivaRow) : null;
    }

    static async obtenerTurnoParaAtencion(idTurno: number): Promise<TurnoValidacionRow | null> {
        const [rows]: any = await pool.query(
            `SELECT
                t.id_turno,
                t.id_mascota,
                t.id_veterinario,
                et.nombre AS estado_nombre,
                CASE WHEN ac.id_atencion IS NOT NULL THEN 1 ELSE 0 END AS ya_tiene_atencion
             FROM Turno t
             INNER JOIN EstadoTurno et ON et.id_estado_turno = t.id_estado_turno
             LEFT JOIN AtencionClinica ac ON ac.id_turno = t.id_turno
             WHERE t.id_turno = ?
             LIMIT 1`,
            [idTurno]
        );

        return rows.length > 0 ? (rows[0] as TurnoValidacionRow) : null;
    }

    // ==========================================
    // ESCRITURA TRANSACCIONAL (HU-VET-10-a, 10-c, RN-05, RN-09, RN-12)
    // ==========================================

    static async crearAtencionConTransaccion(
        datos: CrearAtencionClinicaDTO,
        idVeterinario: number
    ): Promise<number> {
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            const [resultAtencion]: any = await connection.query(
                `INSERT INTO AtencionClinica (
                    id_turno,
                    id_mascota,
                    id_veterinario,
                    id_tipo_atencion,
                    diagnostico,
                    tratamiento,
                    observaciones,
                    proximo_control
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    datos.id_turno ?? null,
                    datos.id_mascota,
                    idVeterinario,
                    datos.id_tipo_atencion,
                    datos.diagnostico ?? null,
                    datos.tratamiento ?? null,
                    datos.observaciones ?? null,
                    datos.proximo_control ?? null
                ]
            );

            const idAtencionCreada = Number(resultAtencion.insertId);

            // Inserción de vacunas aplicadas (1 a N) si corresponde (RN-12)
            if (datos.vacunas && datos.vacunas.length > 0) {
                for (const vacuna of datos.vacunas) {
                    await connection.query(
                        `INSERT INTO VacunaAplicada (
                            nombre_vacuna,
                            dosis,
                            lote,
                            fecha_aplicacion,
                            proxima_aplicacion,
                            laboratorio,
                            id_atencion
                        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                        [
                            vacuna.nombre_vacuna,
                            vacuna.dosis ?? null,
                            vacuna.lote ?? null,
                            vacuna.fecha_aplicacion,
                            vacuna.proxima_aplicacion ?? null,
                            vacuna.laboratorio,
                            idAtencionCreada
                        ]
                    );
                }
            }

            // Cierre automático del turno asociado a COMPLETADO (RN-05 y RN-09)
            if (datos.id_turno) {
                const [estados]: any = await connection.query(
                    `SELECT id_estado_turno
                     FROM EstadoTurno
                     WHERE LOWER(nombre) = 'completado'
                     LIMIT 1`
                );

                if (estados.length === 0) {
                    throw new Error('No se encontró el estado COMPLETADO en el catálogo EstadoTurno');
                }

                const idEstadoCompletado = Number(estados[0].id_estado_turno);

                await connection.query(
                    `UPDATE Turno
                     SET id_estado_turno = ?,
                         fecha_actualizacion = NOW()
                     WHERE id_turno = ?`,
                    [idEstadoCompletado, datos.id_turno]
                );
            }

            await connection.commit();
            return idAtencionCreada;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // ==========================================
    // LECTURA Y LIBRETA SANITARIA (HU-VET-11-a)
    // ==========================================

    private static async obtenerVacunasPorAtenciones(
        idsAtenciones: number[]
    ): Promise<VacunaAplicadaResponseDTO[]> {
        if (idsAtenciones.length === 0) {
            return [];
        }

        const placeholders = idsAtenciones.map(() => '?').join(', ');

        const [rows] = await pool.query(
            `SELECT
                id_vacuna_aplicada,
                id_atencion,
                nombre_vacuna,
                dosis,
                lote,
                fecha_aplicacion,
                proxima_aplicacion,
                laboratorio
             FROM VacunaAplicada
             WHERE id_atencion IN (${placeholders})
             ORDER BY fecha_aplicacion ASC, id_vacuna_aplicada ASC`,
            idsAtenciones
        );

        return rows as VacunaAplicadaResponseDTO[];
    }

    private static async adjuntarVacunas(
        atenciones: any[]
    ): Promise<AtencionClinicaResponseDTO[]> {
        if (atenciones.length === 0) {
            return [];
        }

        const ids = atenciones.map((a) => Number(a.id_atencion));
        const vacunas = await this.obtenerVacunasPorAtenciones(ids);

        const mapaVacunas = new Map<number, VacunaAplicadaResponseDTO[]>();

        for (const vacuna of vacunas) {
            const idAtencion = Number(vacuna.id_atencion);
            const lista = mapaVacunas.get(idAtencion) || [];
            lista.push(vacuna);
            mapaVacunas.set(idAtencion, lista);
        }

        return atenciones.map((atencion) => ({
            ...atencion,
            vacunas: mapaVacunas.get(Number(atencion.id_atencion)) || []
        })) as AtencionClinicaResponseDTO[];
    }

    static async obtenerHistorialPorMascota(
        idMascota: number
    ): Promise<AtencionClinicaResponseDTO[]> {
        const [rows]: any = await pool.query(
            `SELECT
                a.id_atencion,
                a.id_turno,
                a.id_mascota,
                m.nombre AS mascota_nombre,
                m.especie AS mascota_especie,
                a.id_veterinario,
                uv.nombre AS veterinario_nombre,
                uv.apellido AS veterinario_apellido,
                v.matricula AS veterinario_matricula,
                a.id_tipo_atencion,
                ta.nombre AS tipo_atencion_nombre,
                a.diagnostico,
                a.tratamiento,
                a.observaciones,
                a.proximo_control,
                a.fecha_atencion,
                a.id_usuario_ultima_modificacion,
                um.nombre AS modificador_nombre,
                um.apellido AS modificador_apellido,
                a.fecha_ultima_modificacion,
                a.activo
             FROM AtencionClinica a
             INNER JOIN Mascota m ON m.id_mascota = a.id_mascota
             INNER JOIN Veterinario v ON v.id_veterinario = a.id_veterinario
             INNER JOIN Usuario uv ON uv.id_usuario = v.id_usuario
             INNER JOIN TipoAtencion ta ON ta.id_tipo_atencion = a.id_tipo_atencion
             LEFT JOIN Usuario um ON um.id_usuario = a.id_usuario_ultima_modificacion
             WHERE a.id_mascota = ?
             AND a.activo = 1
             ORDER BY a.fecha_atencion DESC, a.id_atencion DESC`,
            [idMascota]
        );

        return this.adjuntarVacunas(rows);
    }

    static async obtenerPorId(
        idAtencion: number
    ): Promise<(AtencionClinicaResponseDTO & { id_cliente: number }) | null> {
        const [rows]: any = await pool.query(
            `SELECT
                a.id_atencion,
                a.id_turno,
                a.id_mascota,
                m.id_cliente,
                m.nombre AS mascota_nombre,
                m.especie AS mascota_especie,
                a.id_veterinario,
                uv.nombre AS veterinario_nombre,
                uv.apellido AS veterinario_apellido,
                v.matricula AS veterinario_matricula,
                a.id_tipo_atencion,
                ta.nombre AS tipo_atencion_nombre,
                a.diagnostico,
                a.tratamiento,
                a.observaciones,
                a.proximo_control,
                a.fecha_atencion,
                a.id_usuario_ultima_modificacion,
                um.nombre AS modificador_nombre,
                um.apellido AS modificador_apellido,
                a.fecha_ultima_modificacion,
                a.activo
             FROM AtencionClinica a
             INNER JOIN Mascota m ON m.id_mascota = a.id_mascota
             INNER JOIN Veterinario v ON v.id_veterinario = a.id_veterinario
             INNER JOIN Usuario uv ON uv.id_usuario = v.id_usuario
             INNER JOIN TipoAtencion ta ON ta.id_tipo_atencion = a.id_tipo_atencion
             LEFT JOIN Usuario um ON um.id_usuario = a.id_usuario_ultima_modificacion
             WHERE a.id_atencion = ?
             AND a.activo = 1
             LIMIT 1`,
            [idAtencion]
        );

        if (rows.length === 0) {
            return null;
        }

        const [conVacunas] = await this.adjuntarVacunas(rows);
        return {
            ...conVacunas,
            id_cliente: Number(rows[0].id_cliente)
        };
    }

    // ==========================================
    // ALERTAS DE PRÓXIMOS CONTROLES Y VACUNAS (HU-VET-11-b)
    // ==========================================

    static async obtenerAlertasProximos30Dias(
        idCliente?: number
    ): Promise<AlertaClinicaDTO[]> {
        const filtroCliente = idCliente !== undefined ? 'AND m.id_cliente = ?' : '';
        const params: any[] = idCliente !== undefined ? [idCliente, idCliente] : [];

        const [rows] = await pool.query(
            `SELECT
                'CONTROL' AS tipo_alerta,
                a.proximo_control AS fecha_vencimiento,
                a.id_atencion,
                m.id_mascota,
                m.nombre AS mascota_nombre,
                m.especie AS mascota_especie,
                c.id_cliente,
                uc.nombre AS cliente_nombre,
                uc.apellido AS cliente_apellido,
                uc.telefono AS cliente_telefono,
                COALESCE(ta.nombre, 'Control clínico') AS detalle
             FROM AtencionClinica a
             INNER JOIN Mascota m ON m.id_mascota = a.id_mascota
             INNER JOIN Cliente c ON c.id_cliente = m.id_cliente
             INNER JOIN Usuario uc ON uc.id_usuario = c.id_usuario
             INNER JOIN TipoAtencion ta ON ta.id_tipo_atencion = a.id_tipo_atencion
             WHERE a.activo = 1
             AND m.activo = 1
             AND uc.activo = 1
             AND a.proximo_control IS NOT NULL
             AND a.proximo_control BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
             ${filtroCliente}

             UNION ALL

             SELECT
                'VACUNA' AS tipo_alerta,
                va.proxima_aplicacion AS fecha_vencimiento,
                a.id_atencion,
                m.id_mascota,
                m.nombre AS mascota_nombre,
                m.especie AS mascota_especie,
                c.id_cliente,
                uc.nombre AS cliente_nombre,
                uc.apellido AS cliente_apellido,
                uc.telefono AS cliente_telefono,
                va.nombre_vacuna AS detalle
             FROM VacunaAplicada va
             INNER JOIN AtencionClinica a ON a.id_atencion = va.id_atencion
             INNER JOIN Mascota m ON m.id_mascota = a.id_mascota
             INNER JOIN Cliente c ON c.id_cliente = m.id_cliente
             INNER JOIN Usuario uc ON uc.id_usuario = c.id_usuario
             WHERE a.activo = 1
             AND m.activo = 1
             AND uc.activo = 1
             AND va.proxima_aplicacion IS NOT NULL
             AND va.proxima_aplicacion BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
             ${filtroCliente}

             ORDER BY fecha_vencimiento ASC`,
            params
        );

        return rows as AlertaClinicaDTO[];
    }

    // ==========================================
    // ACTUALIZACIÓN Y BAJA LÓGICA CON AUDITORÍA (RN-03, HU-VET-10-b, 10-d)
    // ==========================================

    static async actualizar(
        idAtencion: number,
        datos: ActualizarAtencionClinicaDTO,
        idUsuarioModificador: number
    ): Promise<boolean> {
        const camposAActualizar: string[] = [];
        const valores: any[] = [];

        if (datos.diagnostico !== undefined) {
            camposAActualizar.push('diagnostico = ?');
            valores.push(datos.diagnostico);
        }

        if (datos.tratamiento !== undefined) {
            camposAActualizar.push('tratamiento = ?');
            valores.push(datos.tratamiento);
        }

        if (datos.observaciones !== undefined) {
            camposAActualizar.push('observaciones = ?');
            valores.push(datos.observaciones);
        }

        if (datos.proximo_control !== undefined) {
            camposAActualizar.push('proximo_control = ?');
            valores.push(datos.proximo_control);
        }

        const tieneVacunasParaActualizar = datos.vacunas !== undefined;

        if (camposAActualizar.length === 0 && !tieneVacunasParaActualizar) {
            return false;
        }

        // Auditoría obligatoria (RN-03)
        camposAActualizar.push('id_usuario_ultima_modificacion = ?');
        valores.push(idUsuarioModificador);

        camposAActualizar.push('fecha_ultima_modificacion = NOW()');
        valores.push(idAtencion);

        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            const [result]: any = await connection.query(
                `UPDATE AtencionClinica
                 SET ${camposAActualizar.join(', ')}
                 WHERE id_atencion = ?
                 AND activo = 1`,
                valores
            );

            if (result.affectedRows === 0) {
                await connection.rollback();
                return false;
            }

            if (tieneVacunasParaActualizar && datos.vacunas) {
                await connection.query(
                    `DELETE FROM VacunaAplicada WHERE id_atencion = ?`,
                    [idAtencion]
                );

                for (const vacuna of datos.vacunas) {
                    await connection.query(
                        `INSERT INTO VacunaAplicada (
                            nombre_vacuna,
                            dosis,
                            lote,
                            fecha_aplicacion,
                            proxima_aplicacion,
                            laboratorio,
                            id_atencion
                        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                        [
                            vacuna.nombre_vacuna,
                            vacuna.dosis ?? null,
                            vacuna.lote ?? null,
                            vacuna.fecha_aplicacion,
                            vacuna.proxima_aplicacion ?? null,
                            vacuna.laboratorio,
                            idAtencion
                        ]
                    );
                }
            }

            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async darDeBajaLogica(
        idAtencion: number,
        idUsuarioModificador: number
    ): Promise<boolean> {
        const [result]: any = await pool.query(
            `UPDATE AtencionClinica
             SET activo = 0,
                 id_usuario_ultima_modificacion = ?,
                 fecha_ultima_modificacion = NOW()
             WHERE id_atencion = ?
             AND activo = 1`,
            [idUsuarioModificador, idAtencion]
        );

        return result.affectedRows > 0;
    }
}