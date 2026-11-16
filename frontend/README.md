# Frontend

## Descripción

El frontend de VET corresponde a la interfaz web del sistema de gestión veterinaria. Su objetivo es permitir que administradores, veterinarios y clientes interactúen con las funcionalidades de la aplicación de acuerdo con sus respectivos permisos.

Está desarrollado utilizando las siguientes tecnologías:

- **React:** construcción de interfaces mediante componentes reutilizables.
- **TypeScript:** tipado estático para mejorar la organización y el mantenimiento del código.
- **SCSS:** gestión de estilos y diseño visual de la aplicación.
- **Vite:** herramienta de desarrollo y compilación del proyecto.

## Arquitectura

El frontend adopta una organización modular por funcionalidades (*Feature-Based Architecture*). El código se divide en módulos independientes, agrupando los elementos según las responsabilidades de cada funcionalidad.

## Estructura de Carpetas

```text
frontend/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── commons/
│   │   ├── layouts/
│   │   └── Navbar/
│   ├── core/
│   │   └── api/
│   ├── features/
│   │   ├── agenda/
│   │   ├── auth/
│   │   ├── catalogs/
│   │   ├── clinical/
│   │   ├── dashboard/
│   │   ├── landing/
│   │   ├── pets/
│   │   └── users/
│   ├── routes/
│   ├── styles/
│   ├── types/
│   └── utils/
├── App.tsx
├── main.tsx
└── README.md
```

## Organización de los Módulos

### Core

La carpeta `core/` contiene configuraciones y elementos centrales compartidos por la aplicación, como la configuración para la comunicación con el backend.

### Features

La carpeta `features/` agrupa las funcionalidades principales del sistema:

| Módulo | Responsabilidad |
|---|---|
| `landing/` | Página de inicio y presentación de los servicios de la veterinaria. |
| `auth/` | Inicio de sesión, registro y funcionalidades relacionadas con la autenticación. |
| `dashboard/` | Pantalla principal del sistema. |
| `pets/` | Registro, consulta y actualización de los perfiles de las mascotas. |
| `users/` | Gestión de usuarios, perfiles y datos personales. |
| `agenda/` | Funcionalidades relacionadas con turnos y horarios. |
| `catalogs/` | Estructura prevista para catálogos del sistema. |
| `clinic/` | Estructura prevista para funcionalidades clínicas. |

Cada funcionalidad se organiza de forma independiente para facilitar su mantenimiento y evolución.

### Components

La carpeta `components/` contiene los componentes visuales compartidos que pueden utilizarse en diferentes módulos, evitando la duplicación de código y manteniendo la consistencia de la interfaz.

### Routes

La carpeta `routes/` centraliza la configuración de navegación entre las diferentes páginas de la aplicación mediante React Router.

### Styles

La carpeta `styles/` contiene los estilos globales, variables y configuraciones visuales compartidas.

### Types

La carpeta `types/` agrupa las definiciones de tipos utilizadas en distintas funcionalidades.

### Utils

La carpeta `utils/` contiene funciones auxiliares reutilizables.

### Assets

La carpeta `assets/` almacena los recursos estáticos de la aplicación, como imágenes, íconos y otros elementos visuales.

### App.tsx

Archivo encargado de definir la composición principal de la aplicación.

### main.tsx

Punto de entrada de la aplicación, responsable de iniciar el frontend y montar la aplicación React.

## Roles y Funcionalidades

La interfaz contempla tres perfiles de usuario:

- **Administrador:** acceso a las herramientas de gestión del sistema.
- **Veterinario:** acceso a las funcionalidades relacionadas con la atención veterinaria.
- **Cliente:** acceso a sus mascotas y a los servicios de la veterinaria.

La visualización y el acceso a las funcionalidades deben respetar los permisos definidos para cada rol, con las validaciones correspondientes en el backend.

## Comunicación con el Backend

El frontend se comunica con el backend mediante solicitudes HTTP a la API REST, utilizando Axios. La URL del servidor se configura mediante variables de entorno.

## Tecnologías

- React
- TypeScript
- Vite
- React Router
- Axios
- SCSS
