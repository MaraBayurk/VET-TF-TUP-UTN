# Backend

## Descripción

El backend es el componente encargado de procesar las solicitudes del frontend, ejecutar la lógica de negocio, aplicar las reglas de seguridad y gestionar el acceso a la base de datos del sistema VET.

Está desarrollado con las siguientes tecnologías:

- **Node.js:** entorno de ejecución de JavaScript.
- **Express:** framework para la construcción de la API REST.
- **TypeScript:** lenguaje utilizado para desarrollar el backend con tipado estático.
- **MySQL:** sistema de gestión de bases de datos relacionales.
- **mysql2:** biblioteca utilizada para establecer conexiones y ejecutar consultas sobre MySQL.
- **JWT:** mecanismo de autenticación mediante tokens.
- **bcrypt:** biblioteca utilizada para el hashing de contraseñas.
- **Swagger / OpenAPI:** herramientas para documentar y probar los endpoints de la API.

## Arquitectura

El backend adopta una arquitectura modular organizada por funcionalidades y responsabilidades.

Cada módulo concentra los componentes necesarios para implementar sus operaciones, separando principalmente:

- **Routes:** definen los endpoints y vinculan las solicitudes HTTP con sus controladores.
- **Controllers:** reciben las solicitudes, ejecutan las validaciones correspondientes y coordinan las operaciones.
- **Repositories:** centralizan el acceso y las consultas a la base de datos.
- **DTOs:** definen las estructuras de datos utilizadas en determinadas operaciones.

Esta organización permite mantener una separación de responsabilidades y facilita el mantenimiento y la evolución del sistema.

## Estructura de carpetas

```text
backend/
├── src/
│   ├── config/
│   │   ├── db.ts
│   │   └── swagger.ts
│   ├── middlewares/
│   │   └── auth.middleware.ts
│   ├── modules/
│   │   ├── agenda/
│   │   │   ├── horarios/
│   │   │   │   ├── horarios.controller.ts
│   │   │   │   ├── horarios.repository.ts
│   │   │   │   └── horarios.routes.ts
│   │   │   └── turnos/
│   │   │       ├── turnos.controller.ts
│   │   │       ├── turnos.repository.ts
│   │   │       └── turnos.routes.ts
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.dto.ts
│   │   │   ├── auth.repository.ts
│   │   │   └── auth.routes.ts
│   │   ├── catalogs/
│   │   │   └── index.ts
│   │   ├── clinical/
│   │   │   └── index.ts
│   │   ├── clientes/
│   │   │   ├── clientes.controller.ts
│   │   │   ├── clientes.repository.ts
│   │   │   └── clientes.routes.ts
│   │   ├── especialidades/
│   │   │   ├── especialidades.controller.ts
│   │   │   ├── especialidades.dto.ts
│   │   │   ├── especialidades.repository.ts
│   │   │   └── especialidades.routes.ts
│   │   ├── mascotas/
│   │   │   ├── mascotas.controller.ts
│   │   │   ├── mascotas.dto.ts
│   │   │   ├── mascotas.repository.ts
│   │   │   └── mascotas.routes.ts
│   │   └── usuarios/
│   │       ├── usuarios.controller.ts
│   │       ├── usuarios.dependencies.ts
│   │       ├── usuarios.dto.ts
│   │       ├── usuarios.repository.interface.ts
│   │       ├── usuarios.repository.ts
│   │       └── usuarios.routes.ts
│   └── utils/
│       ├── password.util.ts
│       └── validator.util.ts
├── app.ts
├── server.ts
├── .env.example
├── package.json
└── README.md
```

## Organización del backend

### Config

La carpeta `config/` centraliza la configuración general de la aplicación.

- **db.ts:** configura el pool de conexiones con MySQL mediante `mysql2/promise`.
- **swagger.ts:** configura la documentación interactiva de la API mediante Swagger.

### Middlewares

La carpeta `middlewares/` contiene mecanismos que intervienen en el procesamiento de las solicitudes HTTP.

Actualmente se utiliza el middleware de autenticación y autorización para:

- Verificar la validez del token JWT.
- Identificar al usuario autenticado.
- Controlar el acceso a determinadas operaciones según el rol del usuario.

### Modules

La carpeta `modules/` contiene la lógica organizada según las funcionalidades del sistema.

| Módulo | Responsabilidad |
|---|---|
| `auth/` | Registro de clientes, inicio de sesión, consulta del perfil autenticado y cierre de sesión del lado del cliente. |
| `usuarios/` | Gestión administrativa de cuentas de Administrador y Veterinario; solo accesible para Administradores. |
| `clientes/` | Listado, detalle, alta, actualización y baja lógica de clientes, incluyendo la consulta de mascotas y turnos asociados. |
| `mascotas/` | Alta, consulta, actualización y baja lógica de mascotas, aplicando controles de permisos y pertenencia. |
| `especialidades/` | Consulta, creación, actualización y baja lógica de especialidades veterinarias. |
| `agenda/` | Gestión de turnos, disponibilidad y horarios de atención de los veterinarios. |
| `catalogs/` | Solo contiene el archivo de estructura `index.ts`; no existe aún un módulo centralizado de catálogos. Las consultas de roles y estados están en los repositorios de sus funcionalidades, y las especialidades se gestionan en `especialidades/`. |
| `clinical/` | Solo contiene el archivo de estructura `index.ts`; no hay endpoints ni lógica backend para atenciones clínicas o vacunación. Las tablas clínicas sí están definidas en el modelo y el script SQL. |

#### Módulo Agenda

El módulo `agenda/` se encuentra organizado en dos submódulos para separar sus responsabilidades:

**Turnos (`agenda/turnos/`)**

Gestiona las operaciones relacionadas con las reservas de atención veterinaria:

- Consulta de disponibilidad.
- Solicitud de turnos.
- Listado y consulta de reservas.
- Gestión y cancelación de turnos.
- Validaciones de permisos, pertenencia de mascotas, fechas y superposición de reservas.

**Horarios (`agenda/horarios/`)**

Gestiona los horarios de atención configurados para los veterinarios, que se utilizan para determinar la disponibilidad de turnos.

Cada submódulo cuenta con sus propios controladores, repositorios y rutas.

### Utils

La carpeta `utils/` agrupa funciones auxiliares reutilizables:

- **password.util.ts:** utilidades relacionadas con el manejo de contraseñas.
- **validator.util.ts:** utilidades relacionadas con la validación de datos.

### App.ts y Server.ts

`app.ts` configura Express, incorpora los middlewares generales y registra las rutas implementadas. `server.ts` importa esa aplicación e inicia el servidor HTTP en el puerto configurado.

## Seguridad

El backend implementa mecanismos de autenticación y autorización para proteger los recursos de la API.

Entre las medidas contempladas se encuentran:

- Autenticación mediante tokens JWT.
- Hashing de contraseñas mediante bcrypt.
- Autorización basada en roles: Administrador, Veterinario y Cliente.
- Verificación de permisos en el servidor.
- Validación de pertenencia de las mascotas en las operaciones correspondientes.
- Baja lógica de registros para preservar la información histórica.

Los controles de acceso se ejecutan en el backend, independientemente de las restricciones de visualización que pueda implementar el frontend.

### API de Clientes

Todas las rutas requieren un JWT válido y el rol **Administrador** o **Veterinario**. El identificador de las rutas corresponde a `id_cliente`.

| Método | Ruta | Operación |
|---|---|---|
| `GET` | `/api/clientes` | Lista clientes activos e inactivos con cantidad de mascotas activas y turnos. |
| `GET` | `/api/clientes/:id` | Devuelve datos de contacto, mascotas y los últimos turnos del cliente. |
| `POST` | `/api/clientes` | Crea la cuenta de usuario y su perfil Cliente en una transacción. Requiere nombre, apellido, documento, email y contraseña; teléfono y dirección son opcionales. |
| `PUT` | `/api/clientes/:id` | Actualiza los datos de contacto y, opcionalmente, la contraseña. |
| `DELETE` | `/api/clientes/:id` | Da de baja lógicamente la cuenta, conservando sus datos relacionados. |

Los emails y documentos duplicados se rechazan con `409`. Las contraseñas se guardan con hash y nunca se devuelven en las respuestas. El módulo usa las columnas existentes en `Usuario` y `Cliente`; no agrega campos al esquema.

## Base de datos

El backend utiliza **MySQL** como sistema de persistencia.

La conexión se configura mediante un pool utilizando `mysql2/promise`. Los parámetros de conexión se obtienen de variables de entorno para evitar incluir credenciales directamente en el código fuente.

La estructura de la base de datos, sus entidades, relaciones y restricciones se encuentran documentadas en la carpeta `database/` del repositorio.

## Comunicación con el frontend

El backend expone una API REST que permite al frontend realizar operaciones mediante solicitudes HTTP.

Las respuestas se envían en formato JSON y utilizan los códigos de estado HTTP correspondientes para informar el resultado de cada operación.

Para el desarrollo y la validación de los endpoints se utilizan:

- **Postman:** ejecución y prueba de solicitudes HTTP.
- **Swagger / OpenAPI:** documentación de los endpoints y prueba interactiva de la API.

## Ejecución local

### Requisitos previos

- Node.js.
- npm.
- MySQL.
- Base de datos del proyecto creada y configurada.

### Instalación de dependencias

Desde la carpeta `backend/`, ejecutar:

```bash
npm install
```

### Configuración de variables de entorno

Copiar `.env.example` como `.env` en la raíz de `backend/` y completar los parámetros de conexión a MySQL y la configuración de autenticación.

### Iniciar el servidor

Ejecutar:

```bash
npm run dev
```

Este comando inicia el servidor mediante `tsx watch`, permitiendo detectar cambios en los archivos y reiniciar automáticamente la aplicación durante el desarrollo.

### Documentación de la API

Con el servidor en funcionamiento, acceder a:

```text
http://localhost:3000/api-docs
```

Swagger permite consultar los endpoints documentados, sus parámetros, cuerpos de petición y respuestas, además de probar las operaciones disponibles.
