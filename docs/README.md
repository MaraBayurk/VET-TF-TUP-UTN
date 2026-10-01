# Documentación del Proyecto VET

Esta carpeta contiene la documentación funcional y técnica del sistema de gestión veterinaria VET, desarrollado como Trabajo Final de la Tecnicatura Universitaria en Programación de la Universidad Tecnológica Nacional (UTN).

## Contenido

| Archivo | Descripción |
|---|---|
| `propuesta_del_proyecto.md` | Presenta la problemática, los objetivos, el alcance, los requerimientos y las reglas de negocio del sistema. |
| `diseño_y_modulos.md` | Describe el diseño funcional, las historias de usuario, los módulos y la matriz de permisos. |
| `UML.png` | Representa el diagrama de clases UML, con sus atributos, métodos y relaciones. |

## Arquitectura del Sistema

El sistema sigue una arquitectura cliente-servidor, organizada en tres componentes principales:

- **Frontend:** desarrollado con React, TypeScript y SCSS. Gestiona la interfaz de usuario, la navegación y la interacción con el sistema.
- **Backend:** desarrollado con Node.js y Express. Centraliza la lógica de negocio, la validación de datos, la autenticación y la comunicación con la base de datos.
- **Base de datos:** MySQL. Almacena la información de usuarios, mascotas, turnos, atenciones clínicas y demás entidades del sistema.

## Organización Funcional

El sistema se divide en seis módulos principales:

1. **Autenticación y Seguridad:** inicio de sesión, registro de usuarios y control de acceso según roles.
2. **Gestión de Usuarios y Perfiles:** administración de usuarios, perfiles, roles y especialidades.
3. **Gestión de Mascotas:** registro, consulta, actualización y baja lógica de pacientes.
4. **Agenda y Turnos:** solicitud, aprobación, cancelación y consulta de turnos, junto con la configuración de horarios de atención.
5. **Atención Clínica y Libreta Sanitaria:** registro y consulta de atenciones, diagnósticos, tratamientos, vacunas y controles.

## Roles del Sistema

El sistema contempla tres perfiles de acceso:

- **Administrador:** gestiona usuarios, mascotas, agenda, turnos, atenciones y catálogos, de acuerdo con la matriz de permisos.
- **Veterinario:** consulta su agenda, administra la información clínica y realiza el seguimiento sanitario de los pacientes.
- **Cliente:** administra sus datos personales, registra y consulta sus mascotas, solicita y cancela turnos y accede a la libreta sanitaria.

## Reglas de Negocio

El comportamiento del sistema está definido por las reglas de negocio y los criterios de aceptación documentados en la propuesta. Entre sus principales consideraciones se encuentran:

- Control de acceso basado en roles.
- Validación de disponibilidad de horarios para la solicitud de turnos.
- Baja lógica de registros para preservar la trazabilidad histórica.
- Asociación de las mascotas con sus respectivos clientes.
- Actualización automática del estado de los turnos al registrar una atención clínica.
- Conservación del historial clínico y auditoría de sus modificaciones.

## Documentación Complementaria

La documentación de la base de datos se encuentra en la carpeta `database/`, donde se incluyen el diagrama entidad-relación (DER), el script SQL y su descripción.

La documentación específica de cada componente se encuentra en:

- [Frontend](../frontend/README.md)
- [Backend](../backend/README.md)
- [Base de datos](../database/README.md)