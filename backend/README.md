# Backend

## Descripción

El backend es el componente encargado de procesar las solicitudes del frontend, ejecutar la lógica de negocio, aplicar las reglas de seguridad y gestionar el acceso a la base de datos.

Está desarrollado con:

- **Node.js:** entorno de ejecución de JavaScript.
- **Express:** framework para la construcción de la API REST.
- **MySQL:** sistema de gestión de bases de datos relacionales.

## Arquitectura

El backend adopta una arquitectura modular, organizada por responsabilidades y funcionalidades del sistema. Esta estructura permite separar la configuración general, los mecanismos transversales y la lógica específica de cada módulo.

## Estructura de Carpetas

```text
backend/
├── src/
│   ├── config/
│   │   └── index.ts
│   ├── middlewares/
│   │   └── index.ts
│   └── modules/
│       ├── auth/
│       │   └── index.ts
│       ├── pets/
│       │   └── index.ts
│       ├── users/
│       │   └── index.ts
│       ├── catalogs/
│       │   └── index.ts
│       ├── agenda/
│       │   └── index.ts
│       └── clinical/
│           └── index.ts
├── app.ts
├── server.ts
└── README.md
```

## Organización del Backend

### Config

La carpeta `config/` centraliza la configuración general del backend, incluyendo los parámetros necesarios para el funcionamiento de la aplicación y la conexión con la base de datos.

### Middlewares

La carpeta `middlewares/` agrupa los mecanismos que intervienen en el procesamiento de las solicitudes HTTP, como:

- Autenticación.
- Autorización basada en roles.
- Validación de solicitudes.
- Manejo de errores.

Estos mecanismos permiten aplicar controles comunes antes de ejecutar la lógica de cada módulo.

### Modules

La carpeta `modules/` contiene la lógica organizada según las funcionalidades principales del sistema.

| Módulo | Responsabilidad |
|---|---|
| `auth/` | Registro, inicio de sesión, autenticación y control de acceso. |
| `pets/` | Alta, consulta, actualización y baja lógica de mascotas. |
| `users/` | Gestión de usuarios, perfiles, roles y datos personales. |
| `catalogs/` | Administración de especialidades y catálogos del sistema. |
| `agenda/` | Gestión de turnos, disponibilidad, horarios de atención y estados de las reservas. |
| `clinical/` | Registro, actualización y consulta de atenciones clínicas, vacunación y libreta sanitaria. |

Cada módulo concentra las operaciones correspondientes a su funcionalidad y permite mantener una separación lógica entre las distintas áreas del sistema.

### App.ts

Archivo responsable de configurar la aplicación Express, integrar los middlewares y registrar los módulos y sus rutas para exponer la API REST.

### Server.ts

Punto de entrada del servidor. Se encarga de iniciar la aplicación y poner en funcionamiento la API en el puerto configurado.

## Seguridad

El backend es responsable de aplicar las medidas de seguridad necesarias para proteger la información y garantizar que cada usuario acceda únicamente a las funcionalidades autorizadas.

Se contemplan los siguientes mecanismos:

- Almacenamiento seguro de contraseñas.
- Autorización basada en roles: Administrador, Veterinario y Cliente.
- Validación de datos recibidos desde el frontend.
- Protección de las operaciones mediante controles de permisos.
- Baja lógica de registros para preservar la trazabilidad histórica.

La validación de permisos se realiza en el servidor, independientemente de las restricciones de visualización implementadas en el frontend.

## Base de Datos

El backend utiliza MySQL como sistema de persistencia, gestionando las operaciones sobre las entidades definidas en el modelo de datos.

La estructura de la base de datos, sus relaciones y restricciones se encuentran documentadas en la carpeta `database/` del repositorio.

## Comunicación con el Frontend

El backend expone una API REST que permite al frontend realizar operaciones mediante solicitudes HTTP. Las respuestas se envían en formato JSON, utilizando los códigos de estado HTTP correspondientes para informar el resultado de cada operación.