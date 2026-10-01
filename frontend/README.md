# Frontend

## Descripción

El frontend de VET corresponde a la interfaz web del sistema de gestión veterinaria. Su objetivo es permitir que administradores, veterinarios y clientes interactúen con las funcionalidades de la aplicación de acuerdo con sus respectivos permisos.

Está desarrollado utilizando las siguientes tecnologías:

- **React:** construcción de interfaces mediante componentes reutilizables.
- **TypeScript:** tipado estático para mejorar la organización y el mantenimiento del código.
- **SCSS:** gestión de estilos y diseño visual de la aplicación.

## Arquitectura

El frontend adopta una organización modular por funcionalidades (*Feature-Based Architecture*). El código se divide en módulos independientes, agrupando los elementos según las responsabilidades de cada funcionalidad.

## Estructura de Carpetas

```text
frontend/
├── src/
│   ├── core/
│   │   └── index.ts
│   ├── features/
│   │   ├── landing/
│   │   │   └── index.ts
│   │   ├── auth/
│   │   │   └── index.ts
│   │   ├── pets/
│   │   │   └── index.ts
│   │   ├── users/
│   │   │   └── index.ts
│   │   ├── catalogs/
│   │   │   └── index.ts
│   │   └── agenda/
│   │       └── index.ts
│   ├── components/
│   │   └── index.ts
│   └── assets/
│       └── index.ts
├── App.ts
├── main.ts
└── README.md
```

## Organización de los Módulos

### Core

La carpeta `core/` contiene los elementos centrales y compartidos de la aplicación, como la configuración general y la lógica común que utilizan distintas funcionalidades.

### Features

La carpeta `features/` agrupa las funcionalidades principales del sistema:

| Módulo | Responsabilidad |
|---|---|
| `landing/` | Página de inicio y presentación de los servicios de la veterinaria. |
| `auth/` | Inicio de sesión, registro y funcionalidades relacionadas con la autenticación. |
| `pets/` | Registro, consulta y actualización de los perfiles de las mascotas. |
| `users/` | Gestión de usuarios, perfiles y datos personales. |
| `catalogs/` | Administración y consulta de especialidades y catálogos del sistema. |
| `agenda/` | Solicitud, consulta, cancelación y gestión de turnos y horarios. |

Cada funcionalidad se organiza de forma independiente para facilitar su mantenimiento, evolución y reutilización.

### Components

La carpeta `components/` contiene los componentes visuales compartidos que pueden utilizarse en diferentes módulos, evitando la duplicación de código y manteniendo la consistencia de la interfaz.

### Assets

La carpeta `assets/` almacena los recursos estáticos de la aplicación, como imágenes, íconos y otros elementos visuales.

### App.ts

Archivo encargado de definir la composición principal de la aplicación y la integración de sus distintas funcionalidades.

### main.ts

Punto de entrada de la aplicación, responsable de iniciar el frontend y montar la aplicación.

## Roles y Funcionalidades

La interfaz contempla tres perfiles de usuario:

- **Administrador:** acceso a las herramientas de gestión de la clínica.
- **Veterinario:** acceso a su agenda y a las funcionalidades de atención clínica.
- **Cliente:** acceso a sus mascotas, turnos y libretas sanitarias.

La visualización y el acceso a las funcionalidades deben respetar los permisos definidos para cada rol, con las validaciones correspondientes en el backend.

## Comunicación con el Backend

El frontend se comunica con el backend mediante solicitudes HTTP a la API REST. El servidor es responsable de procesar las solicitudes, aplicar las reglas de negocio y acceder a la base de datos.

## Tecnologías

- React
- TypeScript
- SCSS
