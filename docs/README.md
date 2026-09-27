# Documentación del Proyecto

Esta carpeta contiene la documentación técnica y de diseño correspondiente al sistema de gestión de la clínica veterinaria.

## Contenido

### Diagrama UML

El diagrama UML representa las principales clases del sistema, sus atributos, métodos, relaciones y enumeraciones.

### Requerimientos y Reglas de Negocio

Se documentan los requerimientos funcionales, requerimientos no funcionales y reglas de negocio que definen el comportamiento esperado del sistema.

### Módulos a Desarrollar

El sistema se encuentra organizado en los siguientes módulos:

1. Autenticación y Seguridad
2. Gestión de Usuarios y Perfiles
3. Gestión de Mascotas (Pacientes)
4. Agenda y Turnos
5. Atención Clínica y Libreta Sanitaria
6. Catálogos y Configuración

### Matriz de Permisos

Se documentan los permisos correspondientes a cada uno de los roles del sistema:

- Cliente
- Veterinario
- Administrador

### Historias de Usuario

Se detallan las historias de usuario correspondientes a los distintos módulos del sistema, junto con sus respectivos criterios de aceptación.

## Arquitectura

La aplicación seguirá una arquitectura cliente-servidor compuesta por:

- **Frontend:** React + TypeScript + SCSS
- **Backend:** Node.js + Express
- **Base de datos:** MySQL

El frontend será responsable de la interfaz y la interacción con el usuario, mientras que el backend gestionará la lógica de negocio y el acceso a la base de datos.