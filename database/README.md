# Base de Datos

## Descripción

El sistema utilizará una base de datos relacional **MySQL** para almacenar y gestionar la información correspondiente a la clínica veterinaria.

La base de datos permitirá mantener la integridad y consistencia de la información mediante relaciones entre las distintas entidades del sistema.

## Modelo de Datos

El modelo contempla las principales entidades necesarias para la gestión de la clínica veterinaria:

- Usuarios
- Clientes
- Veterinarios
- Mascotas
- Turnos
- Atenciones Clínicas
- Especialidades

## Persistencia

La información será almacenada en **MySQL**, utilizando relaciones entre las entidades mediante claves primarias y claves foráneas.

Se contemplará la integridad referencial y la normalización de los datos.

## Scripts

En esta carpeta se incorporarán posteriormente:

- Scripts de creación de la base de datos.
- Scripts DDL para la creación de tablas.
- Scripts DML para datos iniciales, si fueran necesarios.
- Migraciones de la base de datos, en caso de implementarse.
