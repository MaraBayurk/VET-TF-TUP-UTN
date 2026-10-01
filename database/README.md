# Base de Datos

## Descripción

El sistema utilizará una base de datos relacional **MySQL** para almacenar y gestionar la información correspondiente a la clínica veterinaria.

La base de datos permitirá mantener la integridad y consistencia de la información mediante relaciones entre las distintas entidades del sistema.

## Modelo de Datos

El modelo contempla las principales entidades necesarias para la gestión de la clínica veterinaria:

## Diccionario de Datos: Esquema `veterinaria_db`

A continuación se detalla la estructura física de la base de datos actualizada, reflejando fielmente las definiciones del diagrama entidad-relación y las restricciones del script SQL final.

### Tabla: Rol
10
Almacena los perfiles de acceso definidos para el sistema.

| Campo | Tipo de dato | Restricciones | Descripción |
|---|---|---|---|
| id_rol | TINYINT UNSIGNED | PK, AUTO_INCREMENT | Identificador único del rol. |
| nombre | VARCHAR(30) | UNIQUE, NOT NULL | Nombre descriptivo del rol. |

### Tabla: Usuario

Contiene los datos principales de registro e inicio de sesión para todas las personas que usan el sistema.

| Campo | Tipo de dato | Restricciones | Descripción |
|---|---|---|---|
| id_usuario | INT UNSIGNED | PK, AUTO_INCREMENT | Identificador único del usuario. |
| nombre | VARCHAR(100) | NOT NULL | Nombre del usuario. |
| apellido | VARCHAR(100) | NOT NULL | Apellido del usuario. |
| numero_documento | VARCHAR(20) | UNIQUE, NOT NULL | Documento de identidad del usuario. |
| email | VARCHAR(150) | UNIQUE, NOT NULL | Correo electrónico de contacto y acceso. |
| password_hash | VARCHAR(255) | NOT NULL | Contraseña cifrada del usuario. |
| telefono | VARCHAR(30) | NULL | Número de teléfono del usuario. |
| id_rol | TINYINT UNSIGNED | FK, NOT NULL | Relaciona al usuario con un nivel de acceso de la tabla Rol. |
| fecha_creacion | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Fecha y hora de creación del registro. |
| fecha_actualizacion | DATETIME | NOT NULL, ON UPDATE CURRENT_TIMESTAMP | Fecha y hora de la última modificación del registro. |
| activo | TINYINT(1) | NOT NULL, DEFAULT 1 | Valor booleano para el manejo lógico de usuarios. |

### Tabla: Cliente

Extiende la información del usuario para aquellos que son dueños de mascotas.

| Campo | Tipo de dato | Restricciones | Descripción |
|---|---|---|---|
| id_cliente | INT UNSIGNED | PK, AUTO_INCREMENT | Identificador único del cliente. |
| id_usuario | INT UNSIGNED | FK, UNIQUE, NOT NULL | Relación 1 a 1 con el registro base de la tabla Usuario. |
| direccion | VARCHAR(255) | NULL | Domicilio del cliente. |

### Tabla: Mascota

Guarda los perfiles biológicos de los pacientes veterinarios.

| Campo | Tipo de dato | Restricciones | Descripción |
|---|---|---|---|
| id_mascota | INT UNSIGNED | PK, AUTO_INCREMENT | Identificador único de la mascota. |
| id_cliente | INT UNSIGNED | FK, NOT NULL | Relaciona a la mascota con su dueño registrado en la tabla Cliente. |
| nombre | VARCHAR(100) | NOT NULL | Nombre de la mascota. |
| especie | VARCHAR(60) | NOT NULL | Clasificación de la especie del animal. |
| raza | VARCHAR(100) | NULL | Raza del paciente. |
| fecha_nacimiento | DATE | NULL | Fecha de nacimiento de la mascota. (Nota: El sistema utiliza este campo para calcular dinámicamente la edad exacta en la interfaz, evitando almacenar valores estáticos). |
| sexo | VARCHAR(20) | NOT NULL | Identificación del sexo biológico. |
| observaciones | TEXT | NULL | Notas generales sobre la mascota. |
| fecha_creacion | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Fecha y hora de registro de la mascota. |
| fecha_actualizacion | DATETIME | NOT NULL, ON UPDATE CURRENT_TIMESTAMP | Fecha y hora de la última modificación. |
| activo | TINYINT(1) | NOT NULL, DEFAULT 1 | Valor lógico para gestionar altas y bajas. |

### Tabla: TipoAtencion

Catálogo paramétrico de las clases de atenciones médicas.

| Campo | Tipo de dato | Restricciones | Descripción |
|---|---|---|---|
| id_tipo_atencion | TINYINT UNSIGNED | PK, AUTO_INCREMENT | Identificador único del tipo de atención. |
| nombre | VARCHAR(30) | UNIQUE, NOT NULL | Denominación del tipo de atención médica. |

### Tabla: EstadoTurno

Catálogo paramétrico del ciclo de vida de un turno.

| Campo | Tipo de dato | Restricciones | Descripción |
|---|---|---|---|
| id_estado_turno | TINYINT UNSIGNED | PK, AUTO_INCREMENT | Identificador único del estado del turno. |
| nombre | VARCHAR(20) | UNIQUE, NOT NULL | Etiqueta descriptiva del estado de la cita. |

### Tabla: Especialidad

Define las ramas médicas con las que cuenta la veterinaria.

| Campo | Tipo de dato | Restricciones | Descripción |
|---|---|---|---|
| id_especialidad | INT UNSIGNED | PK, AUTO_INCREMENT | Identificador único de la especialidad. |
| nombre | VARCHAR(100) | UNIQUE, NOT NULL | Título de la especialidad. |
| descripcion | VARCHAR(255) | NULL | Texto explicativo sobre el alcance de la especialidad. |
| activo | TINYINT(1) | NOT NULL, DEFAULT 1 | Valor lógico para gestionar la disponibilidad (baja lógica) de la especialidad. |

### Tabla: Veterinario

Extiende la información del usuario para el personal médico.

| Campo | Tipo de dato | Restricciones | Descripción |
|---|---|---|---|
| id_veterinario | INT UNSIGNED | PK, AUTO_INCREMENT | Identificador único del veterinario. |
| id_usuario | INT UNSIGNED | FK, UNIQUE, NOT NULL | Relación 1 a 1 con el perfil base de la tabla Usuario. |
| matricula | VARCHAR(50) | UNIQUE, NOT NULL | Número de registro o matrícula profesional. |
| id_especialidad | INT UNSIGNED | FK, NOT NULL | Vincula al profesional con la tabla Especialidad. |

### Tabla: Turno

Registra las reservas de agenda en la clínica.

| Campo | Tipo de dato | Restricciones | Descripción |
|---|---|---|---|
| id_turno | INT UNSIGNED | PK, AUTO_INCREMENT | Identificador único del turno. |
| id_mascota | INT UNSIGNED | FK, NOT NULL | Mascota citada para la atención. |
| id_veterinario | INT UNSIGNED | FK, NOT NULL | Profesional médico responsable de la cita. |
| id_usuario_creador | INT UNSIGNED | FK, NOT NULL | Usuario que originó el turno, con fines de auditoría. |
| id_estado_turno | TINYINT UNSIGNED | FK, NOT NULL | Indicador del estado actual del turno. |
| fecha_hora | DATETIME | NOT NULL | Día y horario programados para la consulta. |
| motivo | VARCHAR(500) | NULL | Descripción de la razón del turno. |
| observaciones | TEXT | NULL | Apuntes adicionales sobre el turno. |
| fecha_creacion | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Fecha y hora en que se solicitó el turno. |
| fecha_actualizacion | DATETIME | NOT NULL, ON UPDATE CURRENT_TIMESTAMP | Fecha y hora del último cambio o modificación. |

### Tabla: AtencionClinica

Historial de las intervenciones y evaluaciones de salud realizadas a las mascotas.

| Campo | Tipo de dato | Restricciones | Descripción |
|---|---|---|---|
| id_atencion | INT UNSIGNED | PK, AUTO_INCREMENT | Identificador único de la atención clínica. |
| id_turno | INT UNSIGNED | FK, UNIQUE, NULL | Vínculo opcional con el turno agendado previamente. |
| id_mascota | INT UNSIGNED | FK, NOT NULL | Identificador de la mascota atendida. |
| id_veterinario | INT UNSIGNED | FK, NOT NULL | Identificador del profesional que realizó la atención. |
| id_tipo_atencion | TINYINT UNSIGNED | FK, NOT NULL | Clasificación de la intervención realizada. |
| diagnostico | TEXT | NULL | Conclusión médica de la atención. |
| tratamiento | TEXT | NULL | Prescripción o pasos a seguir estipulados. |
| observaciones | TEXT | NULL | Detalles adicionales sobre la visita médica. |
| proximo_control | DATE | NULL | Fecha programada para una revisión posterior. |
| fecha_atencion | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Fecha y hora en que se ejecuta la visita. |
| id_usuario_ultima_modificacion | INT UNSIGNED | FK, NULL | Usuario que realizó la última modificación del registro clínico. |
| fecha_ultima_modificacion | DATETIME | NULL | Fecha y hora de la última modificación. |
| activo | TINYINT(1) | NOT NULL, DEFAULT 1 | Indicador de baja lógica para ocultar registros clínicos cargados por error sin eliminarlos físicamente. |

### Tabla: HorarioAtencion

Configuración paramétrica de la disponibilidad temporal del plantel veterinario.

| Campo | Tipo de dato | Restricciones | Descripción |
|---|---|---|---|
| id_horario | INT UNSIGNED | PK, AUTO_INCREMENT | Identificador único del horario. |
| id_veterinario | INT UNSIGNED | FK, NOT NULL | Veterinario al que pertenece la franja horaria. |
| dia_semana | TINYINT UNSIGNED | NOT NULL | Indicador numérico del día de la semana (1 = lunes y 7 = domingo). |
| hora_inicio | TIME | NOT NULL | Hora de inicio de la disponibilidad. |
| hora_fin | TIME | NOT NULL | Hora de finalización de la disponibilidad. |
| intervalo_minutos | SMALLINT UNSIGNED | NOT NULL, DEFAULT 30 | Duración estándar de cada sesión, expresada en minutos. |
| activo | TINYINT(1) | NOT NULL, DEFAULT 1 | Booleano para activar o desactivar el horario. |

### Tabla: VacunaAplicada

Registro detallado de los productos biológicos administrados a un paciente. Permite asociar una o múltiples vacunas a una misma atención clínica.

| Campo | Tipo de dato | Restricciones | Descripción |
|---|---|---|---|
| id_vacuna_aplicada | INT UNSIGNED | PK, AUTO_INCREMENT | Identificador único autoincremental. |
| id_atencion | INT UNSIGNED | FK, NOT NULL | Dependencia de una instancia de AtencionClinica en particular (relación 1 a N). |
| nombre_vacuna | VARCHAR(120) | NOT NULL | Identificación de la vacuna proporcionada. |
| dosis | VARCHAR(80) | NULL | Proporción de la vacuna aplicada. |
| lote | VARCHAR(80) | NULL | Número de trazabilidad del biológico. |
| fecha_aplicacion | DATE | NOT NULL | Día específico en que ocurrió la aplicación. |
| proxima_aplicacion | DATE | NULL | Fecha para la renovación o refuerzo de la vacuna, si procede. |
| laboratorio | VARCHAR(120) | NULL | Información del fabricante. |

---

## Consideraciones generales

- Las claves primarias permiten identificar de manera única cada registro de las tablas.
- Las claves foráneas mantienen la integridad referencial entre las entidades del sistema.
- Los campos de tipo `DATETIME` almacenan fechas y horas, mientras que los campos `DATE` almacenan únicamente fechas.
- Los campos de tipo `VARCHAR` almacenan cadenas de caracteres de longitud variable, mientras que `TEXT` permite almacenar textos más extensos.
- Los campos de tipo `TINYINT(1)` se utilizan para representar valores booleanos, como el estado activo o inactivo de un registro.
- Las bajas de usuarios y mascotas se gestionan mediante campos de estado, permitiendo conservar los registros históricos.

## Persistencia

La información será almacenada en **MySQL**, utilizando relaciones entre las entidades mediante claves primarias y claves foráneas. Se contemplará la integridad referencial y la normalización de los datos.
