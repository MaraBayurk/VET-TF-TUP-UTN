# Trabajo Final — 2° Entrega
## 1. UML

![Diagrama UML](./UML.png)

# 2. Requerimientos y Reglas de Negocio

## 2.1 Requerimientos Funcionales

Son las acciones específicas que el sistema debe permitir realizar a los usuarios.

- **Gestión de Acceso:** El sistema debe permitir la autenticación de usuarios mediante correo electrónico y contraseña, redirigiendo a interfaces específicas según el rol (ADMIN, VETERINARIO, CLIENTE).

- **Gestión de Usuarios:** El sistema debe permitir al Administrador realizar el alta, búsqueda, actualización y baja lógica de los perfiles de clientes y personal médico.

- **Gestión de Catálogos:** El sistema debe permitir al Administrador administrar (CRUD completo) las especialidades médicas para asignarlas a los veterinarios.

- **Gestión de Pacientes:** El sistema debe permitir la autogestión total, habilitando al Cliente (desde su portal web), al Administrador y al Veterinario para dar de alta nuevas mascotas, vinculándolas obligatoriamente al perfil de un Cliente existente, así como aplicar bajas lógicas para mantener la trazabilidad. 


- **Gestión de Turnos:** El sistema debe permitir solicitar turnos (Cliente/Administrador) y gestionar su estado a lo largo del ciclo de vida: PENDIENTE, APROBADO, CANCELADO o COMPLETADO (Administrador).

- **Historial Clínico:** El sistema debe permitir al Veterinario registrar la atención clínica (Consulta, Vacuna o Control) y permitir tanto a Veterinarios como a Clientes consultar el historial médico inmutable de las mascotas.

## 2.2 Requerimientos No Funcionales

Definen la arquitectura, tecnologías y atributos de calidad del sistema.

- **Pila Tecnológica:** El sistema debe estar desarrollado utilizando Node.js/Express para la API backend y React (con TypeScript) para el frontend.

- **Persistencia de Datos y Mapeo Estructural:** La información debe almacenarse en una base de datos relacional MySQL, garantizando la integridad referencial (Foreign Keys) y la normalización. Respecto al mapeo estructural del diagrama UML, las enumeraciones (<<enumeration>> Rol, EstadoTurno, TipoAtencion) fueron implementadas físicamente como Tablas Catálogo (Tablas Paramétricas) con claves primarias de tipo TINYINT. Se descartó el uso del tipo nativo ENUM de MySQL para garantizar la escalabilidad: si en el futuro se requieren nuevos estados o roles, se agregarán como registros (DML) sin necesidad de alterar la estructura física de las tablas (DDL). 

- **Persistencia de Datos:** La información debe almacenarse en una base de datos relacional MySQL, garantizando la integridad referencial (Foreign Keys) y normalización.

- **Paradigma y Diseño:** El backend debe construirse respetando la Programación Orientada a Objetos (POO), aplicando herencia para los perfiles de usuario y respetando los principios SOLID.

- **Seguridad y Auditoría:** Las contraseñas deben estar encriptadas (ej. bcrypt) y la comunicación protegida. El sistema debe dejar registro del usuario creador y fecha de modificación en las transacciones clave (Turnos).

- **Normalización (Tercera Forma Normal - 3FN):** El modelo relacional físico fue diseñado respetando estrictamente las reglas de normalización hasta la 3FN para garantizar la integridad referencial y eliminar redundancias estructurales:
    - Primera Forma Normal (1FN - Atomicidad): Todos los campos contienen valores atómicos. Se eliminaron los grupos repetitivos; por ejemplo, en lugar de almacenar una lista de animales en el perfil del usuario, se creó la tabla independiente Mascota vinculada mediante la clave foránea id_cliente.
    - Segunda Forma Normal (2FN - Dependencia Completa): Todas las entidades poseen una clave primaria simple (identificadores autoincrementales, como id_usuario o id_turno). Por lo tanto, todo atributo no clave depende funcionalmente por completo de la clave primaria, eliminando el riesgo de dependencias parciales.
    - Tercera Forma Normal (3FN - Sin Dependencias Transitivas): Ningún atributo no clave depende de otro atributo no clave. Esto se evidencia en la extracción de catálogos y descripciones: en la tabla Turno no se almacena la cadena de texto del estado (ej. "Pendiente"), sino su clave foránea id_estado_turno. Del mismo modo, la tabla Veterinario no guarda el nombre de su área médica, sino que depende exclusivamente de Especialidad_id_especialidad, evitando anomalías de inserción y actualización.


## 2.3 Reglas de Negocio

Son las restricciones lógicas y operativas propias del dominio de la clínica veterinaria que gobiernan cómo se comportan los datos.

- **RN-01: Trazabilidad Histórica (Baja Lógica):** Queda estrictamente prohibida la eliminación física (DELETE) de registros de Usuarios y Mascotas en la base de datos. Se debe aplicar una "Baja Lógica" cambiando el estado del atributo activo a false para preservar el historial clínico y contable ante cualquier eventualidad legal.

- **RN-02: Dependencia Estricta del Paciente:** Una Mascota no puede existir en el sistema de forma aislada. Su creación requiere obligatoriamente la vinculación a un Cliente responsable registrado en el sistema (Relación 1 a N).

- **RN-03: Inmutabilidad del Registro Clínico:** Una vez que un Veterinario guarda un registro de AtencionClinica, este no puede ser eliminado del sistema. Solo se permite su creación, lectura y actualización (corrección de errores ortográficos o ampliación de observaciones).

- **RN-04: Exclusividad de Especialidades:** El vínculo con una especialidad médica se persiste de forma exclusiva en la tabla Veterinario aplicando la estrategia Class Table Inheritance. Para Administradores y Clientes, esta relación es estructuralmente inexistente, evitando la proliferación de valores nulos en la base de datos. 

- **RN-05: Control Centralizado de Agenda:** Los Clientes tienen permisos limitados sobre los turnos: solo pueden solicitarlos (ingresan como PENDIENTE) o cancelarlos. La potestad de reprogramar o dar por completado un turno recae exclusivamente en el Administrador de la clínica.

- **RN-06: Auditoría de Reservas:** Todo Turno generado debe registrar inmutablemente el ID del usuario que originó la transacción (id_usuario_creador), permitiendo a la clínica auditar si el turno fue auto-gestionado por el dueño o cargado manualmente por el recepcionista.

- **RN-07: Resolución de Identidad (Usuarios a Perfiles Específicos):** Dado que el modelo implementa la separación de tablas mediante Class Table Inheritance, las operaciones exclusivas de un rol (como la creación de mascotas por parte de un Cliente o el registro de una atención por un Veterinario) requieren una resolución de identidad. La sesión del sistema opera sobre la base del id_usuario. Antes de ejecutar inserciones o consultas en entidades dependientes (como Mascota o Turno), el backend debe obligatoriamente cruzar el id_usuario con la tabla de la extensión del perfil (Cliente o Veterinario) para obtener y operar con la clave primaria específica (id_cliente o id_veterinario). 

- **RN-08: Gestión de Dominios Cerrados (Estados y Tipos):** Los valores correspondientes a los roles de sistema, los estados de los turnos y los tipos de atención clínica operan como dominios cerrados mediante tablas catálogo. El código de la aplicación (backend) debe consumir estos catálogos dinámicamente mediante sus respectivos identificadores (id_rol, id_estado_turno, id_tipo_atencion) en lugar de validar cadenas de texto plano (strings) en el código, asegurando la consistencia entre la base de datos y la lógica de negocio. 


---

# 3. Módulos a Desarrollar

## 3.1 Módulo de Autenticación y Seguridad

- **Gestión de Accesos:** Desarrollo del sistema de Login y Logout para todos los usuarios.
- **Autorización basada en Roles (RBAC):** Implementación de middlewares en Node.js para proteger las rutas según el rol del usuario (Administrador, Veterinario, Cliente), asegurando que un cliente no pueda acceder a endpoints exclusivos de la clínica.

## 3.2 Módulo de Gestión de Usuarios y Perfiles

- **ABML de Usuarios (Admin):** Interfaz y endpoints para que el Administrador pueda crear, buscar, actualizar y aplicar la baja lógica (soft delete) a cualquier cuenta del sistema (asignando roles y vinculando veterinarios a sus especialidades).
- **Autogestión de Perfil:** Vista para que los clientes y veterinarios puedan visualizar y actualizar sus propios datos personales de contacto (teléfono, dirección, etc.).

## 3.3 Módulo de Gestión de Mascotas (Pacientes)

- **Alta y Vinculación (Autogestión):** Funcionalidad transversal que permite registrar una nueva mascota. Cuando la acción es ejecutada por el Cliente en el portal, el sistema vincula automáticamente el animal a su sesión activa; cuando es ejecutada por un Administrador o Veterinario en la clínica, el sistema exige ingresar manualmente el ID de un Cliente existente. 
- **Búsqueda y Actualización (Admin/Vet):** Listados filtrables para que tanto el Administrador como el Veterinario puedan buscar mascotas por dueño, número de documento o nombre. Incluye la capacidad de actualizar datos básicos (raza, edad) y aplicar bajas lógicas en caso de fallecimiento, conservando la trazabilidad. 
- **Mis Mascotas (Cliente):** Interfaz central del portal del cliente donde el dueño puede visualizar las tarjetas de información de sus mascotas activas y gestionar sus perfiles (actualizar datos básicos como raza, observaciones o sexo), consolidando la autonomía del usuario sobre la información de sus animales. 


## 3.4 Módulo de Agenda y Turnos

- **Solicitud de Turnos:** Interfaz web para que el Cliente o el Administrador soliciten un turno para una mascota específica, vinculando fecha, hora, veterinario y motivo.
- **Gestión y Trazabilidad (Admin):** Panel de control para que el administrador visualice, apruebe o modifique los turnos. Incluye el registro interno de auditoría (id_usuario_creador y fecha_actualizacion).
- **Cancelación de Turnos:** Funcionalidad para que tanto clientes como administradores puedan cambiar el estado de un turno a "CANCELADO" sin eliminar el registro físico.
- **Consulta de Agenda (Veterinario):** Vista de solo lectura para que el profesional médico pueda visualizar los turnos que tiene asignados en el día, incluyendo el motivo de la consulta, el horario y el paciente a atender. 

## 3.5 Módulo de Atención Clínica y Libreta Sanitaria

- **Registro Médico (Veterinario):** Formularios para que el profesional registre el resultado de una visita, categorizándola mediante el tipo de atención (Consulta, Vacuna o Control), ingresando diagnóstico, tratamiento y fecha del proximo_control.
- **Libreta Sanitaria Digital (Propuesta de Valor):**  Vista de solo lectura diseñada como el núcleo del portal web del Cliente, donde el dueño puede consultar la línea de tiempo inmutable con el historial de vacunas y atenciones de sus propias mascotas. El Veterinario también cuenta con un acceso equivalente (modo clínico) para revisar el historial completo de cualquier paciente antes de atenderlo.


## 3.6 Módulo de Catálogos (Configuración)

- **Gestión de Especialidades:** CRUD exclusivo para el Administrador que permite administrar las áreas médicas disponibles en la clínica (Cardiología, Diagnóstico por imagen, etc.) para luego asignarlas al plantel veterinario.

---

# 4. Matriz de Permisos del MVP

| **Entidad**         | **Acción**               | **Administrador**    | **Veterinario**      | **Cliente**          |
| ------------------- | ------------------------ | -------------------- | -------------------- | -------------------- |
| Usuarios            | Crear                    | ✔ (Cualquier rol)    | X                    | X                    |
| (Perfiles)          | Consultar                | ✔ (Todos)            | ✔ (Solo propio)      | ✔ (Solo propio)      |
|                     | Modificar                | ✔ (Todos)            | ✔ (Solo propio)      | ✔ (Solo propio)      |
|                     | Dar de baja              | ✔ (Todos)            | X                    | X                    |
| Mascotas            | Crear                    | ✔                    | ✔                    | ✔ (Para sí mismo)    |
| (Pacientes)         | Consultar                | ✔ (Todas)            | ✔ (Todas)            | ✔ (Solo propias)     |
|                     | Modificar                | ✔ (Todas)            | ✔ (Todas)            | ✔ (Solo propias)     |
|                     | Dar de baja              | ✔ (Todas)            | ✔ (Todas)            | ✔ (Solo propias)     |
| Turnos              | Crear (Solicitar)        | ✔                    | X                    | ✔ (Solo propios)     |
| (Agenda)            | Consultar                | ✔ (Todos)            | ✔ (Solo asignados)   | ✔ (Solo propios)     |
|                     | Modificar (Reprogramar)  | ✔ (Control total)    | X                    | X                    |
|                     | Cancelar / Completar     | ✔ (Ambas acciones)   | X                    | ✔ (Solo cancelar)    |
| Atención Clínica    | Crear (Registrar)        | X                    | ✔                    | X                    |
| (Libreta Sanitaria) | Consultar                | X                    | ✔ (Todas)            | ✔ (Solo propias)     |
|                     | Modificar (Correcciones) | X                    | ✔ (Sus registros)    | X                    |
|                     | Dar de baja              | X (RN-03: Inmutable)  | X (RN-03: Inmutable)  | X (RN-03: Inmutable) |
| Especialidades      | Crear                    | ✔                    | X                    | X                    |
| (Catálogo)          | Consultar                | ✔                    | ✔                    | X                    |
|                     | Modificar                | ✔                    | X                    | X                    |
|                     | Dar de baja              | ✔                    | X                    | X                    |

**Referencias:**

- ✔: Permiso concedido (con el alcance aclarado entre paréntesis).
- X: Permiso denegado por arquitectura o regla de negocio.
- RN-03: El historial clínico tiene estrictamente prohibida su eliminación para garantizar trazabilidad legal.

---

# 5. Historias de Usuario

## 5.1 Módulo 1: Autenticación y Seguridad

### HU-VET-01: Iniciar sesión en el sistema

Como usuario registrado (Administrador, Veterinario o Cliente), quiero iniciar sesión utilizando mi email y contraseña, para acceder a las funcionalidades correspondientes a mi perfil.

#### Criterios de aceptación

- El sistema debe validar que las credenciales coincidan con los registros de la base de datos.
- Se debe validar el atributo activo: si el usuario tiene activo = false (baja lógica), el sistema debe denegar el acceso y mostrar un mensaje de error.
- Tras un inicio exitoso, el sistema debe redirigir a una vista específica según el atributo rol del usuario.

---

## 5.2 Módulo 2: Gestión de Usuarios y Perfiles

### HU-VET-02: Gestión Integral de Usuarios y Perfiles (ABML)
Como Administrador, quiero registrar, consultar, actualizar y dar de baja lógicamente a los usuarios, para controlar los accesos y administrar los perfiles específicos de la clínica veterinaria.
Criterios de Aceptación:
- Mapeo de Herencia (Alta de usuario): La creación de un perfil debe impactar en las tablas correspondientes aplicando la estrategia de herencia Class Table Inheritance:
    - Si el rol es ADMIN, los datos se insertan únicamente en la tabla base Usuario.
    - Si el rol es CLIENTE, el sistema debe generar el registro base en Usuario y su extensión vinculada en la tabla Cliente.
    - Si el rol es VETERINARIO, el sistema debe generar el registro base en Usuario y su extensión vinculada en la tabla Veterinario.
- Asignación de Especialidad: Al crear o actualizar un perfil con rol VETERINARIO, es obligatorio proporcionar una especialidad médica válida, la cual se persiste exclusivamente a través del campo Especialidad_id_especialidad en la tabla Veterinario. Los usuarios con roles CLIENTE o ADMIN carecen por completo de esta relación.
- Baja Lógica (Soft Delete): La acción de dar de baja a cualquier perfil debe modificar únicamente el atributo activo = false en la tabla base Usuario. Queda estrictamente prohibida la ejecución de eliminaciones físicas (SQL DELETE) para garantizar la trazabilidad histórica de los turnos y atenciones.
- Visibilidad de Inactivos: Los usuarios dados de baja lógica no deben aparecer en los listados ni selectores habituales de la interfaz. Solo serán visibles si el Administrador activa un filtro explícito para consultar registros inactivos.


### HU-VET-03: Autogestión de Perfil Personal

Como usuario autenticado, quiero poder actualizar mis propios datos personales, para mantener mi información de contacto al día.

#### Criterios de aceptación

- El usuario solo puede invocar el método actualizarPerfil() sobre su propio id_usuario.
- El sistema no debe permitir que, mediante esta vista, el usuario modifique su propio rol, su estado activo, ni su id_especialidad.

---

## 5.3 Módulo 3: Gestión de Mascotas (Pacientes)

### HU-VET-04: Alta y vinculación de Paciente

Como Veterinario, quiero registrar una nueva mascota asociándola obligatoriamente a un cliente existente, para iniciar su legajo clínico en la veterinaria.

#### Criterios de aceptación

- La creación de la mascota exige el ingreso de un id_cliente válido. Si no se provee, el método crear() debe fallar.
- Por defecto, el registro se crea con el atributo activo = true.
- Se debe validar que la fecha_nacimiento no sea mayor a la fecha actual del sistema.

### HU-VET-05: Baja lógica de Paciente

Como Veterinario, quiero aplicar una baja lógica a una mascota (por fallecimiento o inactividad prolongada), para excluirla de las atenciones futuras sin eliminar su historial médico.

#### Criterios de aceptación

- El método darDeBaja() debe cambiar el estado del atributo activo a false.
- El sistema debe restringir la creación de nuevos turnos o atenciones clínicas para mascotas con activo = false.
- Los turnos históricos y atenciones previas de esa mascota deben permanecer inmutables y consultables.

### HU-VET-06-a: Visualización de mis mascotas

Como Cliente, quiero visualizar un listado con los perfiles de mis mascotas, para consultar su información básica registrada.

#### Criterios de aceptación

- El método buscarMascotas() invocado por el Cliente debe filtrar automáticamente los resultados asociados a su perfil. Para ello, el sistema utilizará el id_usuario de la sesión activa para consultar la tabla Cliente, obtener el id_cliente correspondiente, y utilizar este último para buscar en la tabla Mascota.
- Solo se deben listar las mascotas que tengan activo = true (baja lógica).

### HU-VET-06-b: Actualización de datos de mascotas (Autogestión) 

Como Cliente, quiero poder editar la información básica de los perfiles de mis mascotas, para mantener sus datos actualizados sin tener que depender del recepcionista de la clínica. 

#### Criterios de aceptación:

- El sistema debe permitir al usuario modificar campos descriptivos de la mascota (raza, sexo, observaciones, etc.).
- Validación de pertenencia: El método actualizarMascota() ejecutado por el Cliente debe validar obligatoriamente que el id_mascota que se intenta modificar pertenezca al id_cliente de su sesión activa, impidiendo que altere datos de mascotas de otros usuarios.
- El sistema debe actualizar automáticamente el campo fecha_actualizacion de la tabla Mascota al momento de guardar los cambios.


### HU-VET-06-c: Búsqueda de pacientes por parte de Recepción 
Como Administrador, quiero buscar y visualizar las mascotas registradas asociadas a un cliente específico, para poder seleccionar al paciente correcto al momento de agendar un turno de forma manual. Criterios de aceptación:

- El método buscarMascotas() ejecutado por el perfil Administrador debe permitir filtrar resultados por el id_cliente o nombre del dueño.
- El sistema debe devolver el listado de mascotas activas (activo = true) permitiendo al Administrador seleccionarlas para continuar con el flujo de solicitud de turno.


---

## 5.4 Módulo 4: Agenda y Turnos

### HU-VET-07: Solicitud de Turno Médico

Como Cliente o Administrador, quiero solicitar un turno seleccionando mascota, fecha, hora, motivo y veterinario, para reservar un espacio de atención en la clínica.

#### Criterios de aceptación

- Al ejecutar solicitarTurno(), el registro se guarda por defecto con el estado = PENDIENTE.
- El sistema debe registrar automáticamente en el atributo id_usuario_creador el ID de la persona logueada (ya sea el propio cliente o el administrador en recepción).
- Se debe validar que la combinación de fecha, hora e id_veterinario no colisione con un turno previamente APROBADO.

### HU-VET-08: Gestión de Agenda Diaria

Como Administrador, quiero buscar, actualizar o cancelar turnos del sistema, para organizar y optimizar el flujo de atención clínica.

#### Criterios de aceptación

- El Administrador puede modificar el estado de un turno a APROBADO o CANCELADO.
- Cualquier invocación a actualizarTurno() o cancelarTurno() debe registrar la estampa de tiempo actual en el atributo fecha_actualizacion para mantener trazabilidad.

### HU-VET-09: Cancelación de Turno Propio

Como Cliente, quiero cancelar un turno que solicité previamente, para liberar el horario si no puedo asistir.

#### Criterios de aceptación

- El Cliente solo puede ejecutar el método cancelarTurno() sobre aquellos registros donde la mascota pertenezca a su id_cliente.
- La acción solo modifica el estado a CANCELADO y estampa la fecha_actualizacion; bajo ningún concepto elimina físicamente la fila de la base de datos.

---

## 5.5 Módulo 5: Atención Clínica y Libreta Sanitaria

### HU-VET-10: Registro de Atención Médica

Como Veterinario, quiero registrar una atención clínica indicando tipo, diagnóstico y tratamiento, para dejar constancia formal e inmutable de la consulta de un paciente.

#### Criterios de aceptación

- El sistema debe obligar a clasificar la visita utilizando el TipoAtencion (CONSULTA, VACUNA, CONTROL).
- El registro de atención se asocia automáticamente al id_veterinario logueado y al id_mascota seleccionada.
- Si la atención requiere seguimiento, el sistema debe permitir ingresar el atributo proximo_control.

### HU-VET-11: Consulta de Libreta Sanitaria

Como Cliente o Veterinario, quiero leer el historial de atenciones clínicas de una mascota, para conocer de manera cronológica sus tratamientos y diagnósticos pasados.

#### Criterios de aceptación

- El acceso a este módulo es de solo lectura (no existen métodos de actualización o eliminación en la vista de Libreta Sanitaria).
- Si el actor es un Cliente, el método buscarAtenciones() debe limitarse estrictamente a los historiales correspondientes a los id_mascota de los que es dueño.

---

## 5.6 Módulo 6: Catálogos y Configuración

### HU-VET-12: ABM de Especialidades Médicas

Como Administrador, quiero crear, buscar, actualizar y eliminar especialidades, para mantener actualizado el catálogo que clasifica a los profesionales de la veterinaria.

#### Criterios de aceptación

- El método crearEspecialidad() exige un nombre único.
- El método eliminarEspecialidad() debe fallar y mostrar un mensaje de error relacional si la especialidad que se intenta borrar está actualmente asignada a uno o más usuarios con rol VETERINARIO.