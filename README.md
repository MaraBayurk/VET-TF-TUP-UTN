# VET-TF-TUP-UTN

## Información académica

- **Carrera:** Tecnicatura Universitaria en Programación
- **Institución:** Universidad Tecnológica Nacional
- **Trabajo:** Trabajo Final
- **Comisión:** 10
- **Grupo:** 216
- **Docente titular:** Sofía Raia
- **Fecha:** 29 de septiembre de 2026

### Integrantes

- Mara Valentina Bayurk
- Lina Lucía Berrone Lanza
- Erica Bustamante

## Descripción del proyecto

VET es un sistema de gestión veterinaria desarrollado como Trabajo Final
de la Tecnicatura Universitaria en Programación. Su propósito es centralizar
y facilitar la gestión de turnos, mascotas y su información sanitaria,
permitiendo una mejor organización de las tareas administrativas y clínicas.

## Tecnologías utilizadas

- **Frontend:** React, TypeScript y SCSS.
- **Backend:** Node.js y Express.
- **Base de datos:** MySQL.

## Índice de documentación

- [Propuesta del proyecto](./docs/propuesta_del_proyecto.md)
- [Diseño y módulos](./docs/diseño_y_modulos.md)
- [Diseño del UML](./docs/UML.png)
- [Diagrama del DER](./database/DER.png)
- [Documentación Database](./database/README.md)
- [Documentación Frontend](./frontend/README.md)
- [Documentación Backend](./backend/README.md)
- [Relevamiento de encuestas](./docs/relevamiento_encuestas.md)


## Funcionalidades previstas

- Gestión de usuarios del equipo y roles.
- Gestión de clientes, datos de contacto, mascotas asociadas y bajas lógicas.
- Registro y administración de mascotas.
- Solicitud, aprobación y cancelación de turnos.
- Gestión de la agenda veterinaria.
- Registro y consulta de atenciones clínicas.
- Administración de vacunas aplicadas.
- Consulta de la libreta sanitaria de las mascotas.

Este listado resume el alcance del proyecto. En la entrega actual están implementados los módulos de autenticación, usuarios del equipo, clientes, mascotas, especialidades, agenda y turnos. El módulo de Clientes permite listar, consultar, crear, editar y dar de baja lógicamente cuentas de clientes, y presenta sus mascotas y turnos asociados. La atención clínica y la vacunación están modeladas y documentadas, pero su módulo backend aún no está desarrollado; `catalogs/` también es una estructura inicial, mientras que las consultas de catálogos se realizan desde los repositorios de cada funcionalidad.

## Estructura del repositorio

- `docs/`: propuesta, diseño y documentación del proyecto.
- `database/`: diagrama entidad-relación y documentación de la base de datos.
- `frontend/`: código y documentación de la interfaz de usuario.
- `backend/`: código y documentación del servidor.

## Instalación y ejecución

### Requisitos previos

- Node.js y npm.
- MySQL en ejecución o una instancia MySQL accesible.

### Base de datos

Crear la base ejecutando el script [`database/script.sql`](./database/script.sql) en MySQL. Por ejemplo, desde la raíz del repositorio:

```bash
mysql -u root -p < database/script.sql
```

Si se utiliza otro servidor o credenciales, adaptar este comando a la configuración local.

### Backend

En una terminal, preparar la configuración y arrancar la API:

```bash
cd backend
npm install
cp .env.example .env
```

Completar `backend/.env` con los datos de conexión a MySQL y reemplazar `JWT_SECRET` por una clave segura. Luego ejecutar:

```bash
npm run dev
```

La API queda disponible en `http://localhost:3000` y la documentación Swagger en `http://localhost:3000/api-docs`.

### Frontend

En otra terminal:

```bash
cd frontend
npm install
```

Crear `frontend/.env` con la URL de la API:

```env
VITE_API_URL=http://localhost:3000/api
```

En el proyecto de Vercel del frontend, configurar `VITE_API_URL` con la URL pública del backend y el prefijo `/api` (si `vet-tf-tup-utn-cfm8.vercel.app` es el dominio del backend, usar `https://vet-tf-tup-utn-cfm8.vercel.app/api`) y volver a desplegar.

Iniciar la aplicación web:

```bash
npm run dev
```

Vite mostrará en la terminal la dirección local del frontend, normalmente `http://localhost:5173`.

