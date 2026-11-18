import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { MascotasRepository } from "./mascotas.repository";
import { CrearMascotaDTO, ActualizarMascotaDTO } from "./mascotas.dto";

const obtenerIdMascota = (id: string | string[]): string | null => {
  if (typeof id !== "string" || !/^\d+$/.test(id)) {
    return null;
  }

  return id;
};

// Obtiene la fecha actual en Argentina con formato YYYY-MM-DD.
const obtenerFechaActual = (): string => {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Tucuman",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const anio = partes.find((p) => p.type === "year")?.value;
  const mes = partes.find((p) => p.type === "month")?.value;
  const dia = partes.find((p) => p.type === "day")?.value;

  return `${anio}-${mes}-${dia}`;
};

// Verifica que sea una fecha real, tenga formato correcto y no sea futura.
const esFechaNacimientoValida = (fecha: unknown): fecha is string => {
  if (typeof fecha !== "string") return false;

  const coincidencia = /^(\d{4})-(\d{2})-(\d{2})$/.exec(fecha);
  if (!coincidencia) return false;

  const fechaDate = new Date(
    Date.UTC(
      Number(coincidencia[1]),
      Number(coincidencia[2]) - 1,
      Number(coincidencia[3]),
    ),
  );

  const fechaNormalizada = fechaDate.toISOString().slice(0, 10);

  return fechaNormalizada === fecha && fecha <= obtenerFechaActual();
};

const esTextoValido = (
  valor: unknown,
  longitudMaxima: number,
): valor is string => {
  return (
    typeof valor === "string" &&
    valor.trim().length > 0 &&
    valor.trim().length <= longitudMaxima
  );
};

const obtenerIdClienteDelUsuario = async (
  idUsuario: number,
): Promise<number | null> => {
  return MascotasRepository.obtenerClienteActivoPorUsuario(idUsuario);
};

const esRolCliente = async (idRol: number): Promise<boolean> => {
  const nombreRol = await MascotasRepository.obtenerNombreRolPorId(idRol);

  return nombreRol?.toLowerCase() === "cliente";
};

// ==========================================
// LISTAR MASCOTAS
// ==========================================

export const obtenerMascotas = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const usuario = req.usuario;

    if (!usuario) {
      res.status(401).json({
        status: "error",
        message: "Usuario no autenticado",
      });
      return;
    }

    if (await esRolCliente(usuario.id_rol)) {
      const idCliente = await obtenerIdClienteDelUsuario(usuario.id_usuario);

      if (!idCliente) {
        res.status(404).json({
          status: "error",
          message: "Perfil de cliente no encontrado o inactivo",
        });
        return;
      }

      const mascotas = await MascotasRepository.obtenerPorCliente(idCliente);

      res.status(200).json({
        status: "success",
        data: mascotas,
      });
      return;
    }

    const mascotas = await MascotasRepository.obtenerTodas();

    res.status(200).json({
      status: "success",
      data: mascotas,
    });
  } catch (error) {
    console.error("Error al obtener mascotas:", error);
    res.status(500).json({
      status: "error",
      message: "Error interno del servidor",
    });
  }
};

// ==========================================
// OBTENER MASCOTA POR ID
// ==========================================

export const obtenerMascotaPorId = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const usuario = req.usuario;

    if (!usuario) {
      res.status(401).json({
        status: "error",
        message: "Usuario no autenticado",
      });
      return;
    }

    const idMascota = obtenerIdMascota(req.params.id);

    if (!idMascota) {
      res.status(400).json({
        status: "error",
        message: "El identificador de la mascota no es válido",
      });
      return;
    }

    const mascota = await MascotasRepository.obtenerPorId(idMascota);

    if (!mascota) {
      res.status(404).json({
        status: "error",
        message: "Mascota no encontrada o inactiva",
      });
      return;
    }

    if (await esRolCliente(usuario.id_rol)) {
      const idCliente = await obtenerIdClienteDelUsuario(usuario.id_usuario);

      if (!idCliente || Number(mascota.id_cliente) !== idCliente) {
        res.status(403).json({
          status: "error",
          message: "Acceso denegado: la mascota no le pertenece",
        });
        return;
      }
    }

    res.status(200).json({
      status: "success",
      data: mascota,
    });
  } catch (error) {
    console.error("Error al obtener mascota:", error);
    res.status(500).json({
      status: "error",
      message: "Error interno del servidor",
    });
  }
};

// ==========================================
// CREAR MASCOTA
// ==========================================

export const crearMascota = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const usuario = req.usuario;

    if (!usuario) {
      res.status(401).json({
        status: "error",
        message: "Usuario no autenticado",
      });
      return;
    }

    const { nombre, especie, raza, fecha_nacimiento, sexo, observaciones } =
      req.body;

    if (
      !esTextoValido(nombre, 100) ||
      !esTextoValido(especie, 60) ||
      !esTextoValido(sexo, 20)
    ) {
      res.status(400).json({
        status: "error",
        message:
          "Nombre, especie y sexo son obligatorios y deben respetar sus longitudes máximas",
      });
      return;
    }

    if (
      raza !== undefined &&
      raza !== null &&
      raza !== "" &&
      (typeof raza !== "string" || raza.trim().length > 100)
    ) {
      res.status(400).json({
        status: "error",
        message: "La raza no puede superar los 100 caracteres",
      });
      return;
    }

    if (
      observaciones !== undefined &&
      observaciones !== null &&
      typeof observaciones !== "string"
    ) {
      res.status(400).json({
        status: "error",
        message: "Las observaciones deben ser un texto válido",
      });
      return;
    }

    if (
      fecha_nacimiento !== undefined &&
      fecha_nacimiento !== null &&
      fecha_nacimiento !== "" &&
      !esFechaNacimientoValida(fecha_nacimiento)
    ) {
      res.status(400).json({
        status: "error",
        message:
          "La fecha de nacimiento debe ser válida y no puede ser futura. Formato esperado: YYYY-MM-DD",
      });
      return;
    }

    let idClienteAsignado: number;

    if (await esRolCliente(usuario.id_rol)) {
      // RN-13: el cliente solo puede registrar mascotas a su nombre.
      const idClientePropio = await obtenerIdClienteDelUsuario(
        usuario.id_usuario,
      );

      if (!idClientePropio) {
        res.status(404).json({
          status: "error",
          message:
            "No se encontró un perfil de cliente activo asociado al usuario",
        });
        return;
      }

      // No se utiliza el id_cliente enviado en el body.
      idClienteAsignado = idClientePropio;
    } else {
      const idClienteBody = Number(req.body.id_cliente);

      if (!Number.isInteger(idClienteBody) || idClienteBody <= 0) {
        res.status(400).json({
          status: "error",
          message: "Debe proporcionar un id_cliente válido",
        });
        return;
      }

      const clienteActivo =
        await MascotasRepository.obtenerClienteActivoPorId(idClienteBody);

      if (!clienteActivo) {
        res.status(400).json({
          status: "error",
          message: "El cliente no existe o se encuentra inactivo",
        });
        return;
      }

      idClienteAsignado = clienteActivo;
    }

    const nuevaMascota: CrearMascotaDTO = {
      id_cliente: idClienteAsignado,
      nombre: nombre.trim(),
      especie: especie.trim(),
      raza: typeof raza === "string" ? raza.trim() || null : null,
      fecha_nacimiento: fecha_nacimiento || null,
      sexo: sexo.trim(),
      observaciones:
        typeof observaciones === "string" ? observaciones.trim() || null : null,
    };

    const idMascota = await MascotasRepository.crear(nuevaMascota);

    res.status(201).json({
      status: "success",
      message: "Mascota registrada exitosamente",
      data: {
        id_mascota: idMascota,
      },
    });
  } catch (error) {
    console.error("Error al crear mascota:", error);
    res.status(500).json({
      status: "error",
      message: "Error interno del servidor",
    });
  }
};

// ==========================================
// ACTUALIZAR MASCOTA
// ==========================================

export const actualizarMascota = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const usuario = req.usuario;

    if (!usuario) {
      res.status(401).json({
        status: "error",
        message: "Usuario no autenticado",
      });
      return;
    }
    const idMascota = obtenerIdMascota(req.params.id);

    if (!idMascota) {
      res.status(400).json({
        status: "error",
        message: "El identificador de la mascota no es válido",
      });
      return;
    }

    const mascotaExistente = await MascotasRepository.obtenerPorId(idMascota);

    if (!mascotaExistente) {
      res.status(404).json({
        status: "error",
        message: "Mascota no encontrada o inactiva",
      });
      return;
    }

    const esCliente = await esRolCliente(usuario.id_rol);

    if (esCliente) {
      const idCliente = await obtenerIdClienteDelUsuario(usuario.id_usuario);

      if (!idCliente || Number(mascotaExistente.id_cliente) !== idCliente) {
        res.status(403).json({
          status: "error",
          message: "Acceso denegado: la mascota no le pertenece",
        });
        return;
      }
    }

    const { nombre, especie, raza, fecha_nacimiento, sexo, observaciones } =
      req.body;

    const datosActualizar: ActualizarMascotaDTO = {};

    // El cliente solo puede modificar raza, sexo y observaciones.
    if (!esCliente) {
      if (nombre !== undefined) {
        if (!esTextoValido(nombre, 100)) {
          res.status(400).json({
            status: "error",
            message: "El nombre debe tener entre 1 y 100 caracteres",
          });
          return;
        }
        datosActualizar.nombre = nombre.trim();
      }

      if (especie !== undefined) {
        if (!esTextoValido(especie, 60)) {
          res.status(400).json({
            status: "error",
            message: "La especie debe tener entre 1 y 60 caracteres",
          });
          return;
        }
        datosActualizar.especie = especie.trim();
      }

      if (fecha_nacimiento !== undefined) {
        if (
          fecha_nacimiento !== null &&
          fecha_nacimiento !== "" &&
          !esFechaNacimientoValida(fecha_nacimiento)
        ) {
          res.status(400).json({
            status: "error",
            message:
              "La fecha de nacimiento debe ser válida y no puede ser futura",
          });
          return;
        }
        datosActualizar.fecha_nacimiento = fecha_nacimiento || null;
      }
    }

    if (raza !== undefined) {
      if (
        raza !== null &&
        raza !== "" &&
        (typeof raza !== "string" || raza.trim().length > 100)
      ) {
        res.status(400).json({
          status: "error",
          message: "La raza no puede superar los 100 caracteres",
        });
        return;
      }
      datosActualizar.raza =
        typeof raza === "string" ? raza.trim() || null : null;
    }

    if (sexo !== undefined) {
      if (!esTextoValido(sexo, 20)) {
        res.status(400).json({
          status: "error",
          message: "El sexo debe tener entre 1 y 20 caracteres",
        });
        return;
      }
      datosActualizar.sexo = sexo.trim();
    }

    if (observaciones !== undefined) {
      if (observaciones !== null && typeof observaciones !== "string") {
        res.status(400).json({
          status: "error",
          message: "Las observaciones deben ser un texto válido",
        });
        return;
      }
      datosActualizar.observaciones =
        typeof observaciones === "string" ? observaciones.trim() || null : null;
    }

    const fueActualizada = await MascotasRepository.actualizar(
      idMascota,
      datosActualizar,
    );

    if (!fueActualizada) {
      res.status(400).json({
        status: "error",
        message: "No se enviaron campos válidos para actualizar",
      });
      return;
    }

    res.status(200).json({
      status: "success",
      message: "Datos de la mascota actualizados exitosamente",
    });
  } catch (error) {
    console.error("Error al actualizar mascota:", error);
    res.status(500).json({
      status: "error",
      message: "Error interno del servidor",
    });
  }
};

// ==========================================
// ELIMINAR MASCOTA
// ==========================================

export const eliminarMascota = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const idMascota = obtenerIdMascota(req.params.id);

    if (!idMascota) {
      res.status(400).json({
        status: "error",
        message: "El identificador de la mascota no es válido",
      });
      return;
    }

    const fueEliminada =
      await MascotasRepository.eliminarLogicamenteConCascada(idMascota);

    if (!fueEliminada) {
      res.status(404).json({
        status: "error",
        message: "Mascota no encontrada o ya inactiva",
      });
      return;
    }

    res.status(200).json({
      status: "success",
      message: "Mascota dada de baja y turnos futuros cancelados",
    });
  } catch (error) {
    console.error("Error al dar de baja la mascota:", error);
    res.status(500).json({
      status: "error",
      message: "Error interno del servidor",
    });
  }
};
