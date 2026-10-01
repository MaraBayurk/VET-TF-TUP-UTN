# Propuesta del proyecto 31-08-26

## 1. Definición del problema

Las preguntas disparadoras fueron:
* ¿La fragmentación de los sistemas de gestión impacta exclusivamente en la carga operativa de las clínicas, o también degrada la experiencia y autonomía de los clientes/dueños de mascotas?
* Frente a la pérdida del registro físico, ¿qué mecanismos aseguran la trazabilidad del historial médico de una mascota?
* Ante fallos de hardware o almacenamiento local, ¿los establecimientos cuentan con políticas de respaldo en la nube que garanticen la alta disponibilidad y la integridad de las historias clínicas?
* ¿Qué plataformas o metodologías implementan actualmente los profesionales para digitalizar y centralizar el seguimiento de tratamientos y planes de vacunación?
* ¿Resulta viable implementar una libreta sanitaria digital alojada en la nube que habilite un acceso concurrente y bidireccional entre el equipo médico y el responsable del paciente?
* ¿Es posible diseñar un repositorio centralizado de estudios clínicos que garantice la portabilidad de los datos, facilitando la continuidad de la atención si el paciente cambia de profesional o se muda de provincia?
* ¿Las soluciones de software disponibles en el mercado integran nativamente módulos para la autogestión y reserva de turnos online?
* ¿Sería factible incorporar un sistema automatizado de alertas tempranas que notifique a los usuarios sobre controles próximos y refuerzos de vacunas, aportando un valor agregado medible a la atención?

Las veterinarias gestionan diariamente información relacionada con clientes, mascotas, turnos, consultas, tratamientos y vacunaciones. En aquellos establecimientos donde estos procesos se realizan mediante agendas físicas, planillas u otras herramientas no integradas, la información puede encontrarse dispersa, dificultando su consulta y actualización. Esta situación puede generar problemas en la organización de los turnos, dificultades para acceder rápidamente al historial de una mascota, pérdida o duplicación de información y falta de seguimiento de vacunas y controles.
Los principales actores afectados por esta problemática son el personal administrativo de la veterinaria, los profesionales veterinarios y los clientes o responsables de las mascotas. Cada uno necesita acceder a información diferente para llevar adelante sus actividades de manera eficiente.
Frente a esta problemática, se propone desarrollar una aplicación web que permita centralizar la información y digitalizar los principales procesos de gestión de una veterinaria. El objetivo no es solamente reemplazar registros en papel por registros digitales, sino facilitar el acceso a la información y permitir nuevas funcionalidades, como la solicitud de turnos online, el seguimiento de vacunas y la consulta del historial de atención de las mascotas.


## Validación de la problemática

Con el objetivo de validar la problemática identificada y conocer las necesidades reales de los potenciales usuarios del sistema, se realizará un relevamiento mediante encuestas digitales utilizando Google Forms, dirigidas a veterinarios y clientes de clínicas veterinarias.

Las encuestas permitirán recopilar información sobre la gestión actual de turnos, el seguimiento de la historia clínica de las mascotas, el control de vacunación y las principales dificultades que se presentan en estos procesos. De esta manera, se busca contrastar las necesidades identificadas por el equipo con las experiencias de las personas involucradas.

El relevamiento se desarrollará en las siguientes etapas:

1. **Diseño de las encuestas:** elaboración de formularios con preguntas específicas para veterinarios y clientes, relacionadas con los procesos que busca mejorar el sistema.
2. **Distribución:** difusión de los formularios digitales entre veterinarias, profesionales del área y personas que tengan mascotas y utilicen servicios veterinarios.
3. **Recopilación de respuestas:** almacenamiento de las respuestas obtenidas mediante Google Forms.
4. **Análisis de resultados:** organización e interpretación de las respuestas, identificando necesidades frecuentes, dificultades y oportunidades de mejora.
5. **Documentación:** incorporación de los resultados al presente trabajo, como evidencia del relevamiento realizado.

Los formularios y la información recopilada se conservarán en la siguiente carpeta de Google Drive, cuyo enlace se incluirá como material complementario del proyecto:

[Carpeta de Google Drive](https://drive.google.com/drive/folders/1EzJE4IEZu5_a9iD_fMCQCw2Y5hCOeT6N?usp=sharing)

### Enlaces a las encuestas de Google Forms

- **Para veterinarias:** [Acceder al formulario](https://docs.google.com/forms/d/e/1FAIpQLSed7VHk3DoS-2VisnXzeYDOOE9wneMdLkNykQ6_nyZznPXX0g/viewform)
- **Para clientes:** [Acceder al formulario](https://docs.google.com/forms/d/e/1FAIpQLSf4EVYX1Nkr_rRJaaU-9_1hE2JmpAr8P-a9g07lL7Csh-cvgg/viewform)

## 2. Análisis de Competencia en el Mercado

En el análisis de competencias nos encontramos dos escenarios:
* Competidores indirectos: Son los mas comunes ya que la gran mayoría de las veterinarias de barrio usan Microsoft Excel, Google Calendar para los turnos, y libretas de papel. Estas son alternativas manuales que compiten por la atención del usuario, están instaladas en el mercado y  no le son ajenas al personal.
* Competidores directos: Existen sistemas de gestión veterinaria (como QVET, WinVet, Provet Cloud y Myvet) especializados. Sin embargo, muchos de estos sistemas son de escritorio (instalables, no en la nube), costosos, o están pensados 100% para la administración de la clínica, sin un portal para el cliente.

## 3. Propuesta de solución

Se propone desarrollar una plataforma web integral para la gestión de una veterinaria, destinada a centralizar la información administrativa y clínica de sus pacientes y facilitar la interacción con sus clientes. El sistema contará con diferentes roles de usuario y permitirá gestionar clientes, mascotas, profesionales, turnos, atenciones y vacunas.
Nuestra propuesta de valor y mayor fortaleza es la comunicación bidireccional. Que la plataforma sea web responsive y que el dueño tenga su propio portal para ver la información. Es decir, los clientes de la veterinaria al loguearse en la página pueden realizar diferentes acciones relacionadas con la gestión de la salud de su mascota. 

La propuesta busca aportar valor mediante:
* Centralización de la información.
* Reducción de tareas manuales.
* Mayor facilidad para consultar el historial de las mascotas.
* Mejor organización de los turnos.
* Seguimiento de vacunas y controles.
* Acceso de los clientes a la información de sus mascotas.
* Posibilidad de realizar determinadas gestiones de manera online.


## 4. Alcance

Para garantizar la viabilidad técnica y operativa del desarrollo, la arquitectura del sistema y la base de datos se modelarán específicamente para operar bajo una única institución veterinaria. En este modelo, el cliente "pertenece" a la veterinaria que lo registró. Si un dueño lleva a su mascota a la Clínica A y luego a la Clínica B (y ambas usan el sistema), para el sistema son dos clientes distintos. Como ventaja, es muy seguro, evita que una clínica vea los datos de otra por error y como desventaja si un cliente asiste a dos clínicas diferentes tendrá dos usuarios diferentes.
La implementación de una arquitectura multi-tenant (soporte nativo para múltiples clínicas independientes en una misma base de datos) queda excluida de esta primera versión, reservándose para futuras iteraciones.
El objetivo principal de este MVP es validar que la solución centraliza eficientemente la información clínica y aporta valor real mediante la habilitación del portal bidireccional para los clientes. Las funcionalidades se han delimitado cuidadosamente para priorizar los procesos críticos del flujo de trabajo veterinario, dejando explícitamente fuera aquellas características que representan un alto riesgo temporal o de complejidad de infraestructura.

### Proyección y Escalabilidad (Roadmap a Multi-tenant) 

Aunque la implementación de una arquitectura multi-tenant (soporte nativo para múltiples clínicas independientes en una misma base de datos) queda excluida del MVP, fue contemplada su evolución hacia un modelo B2B (Business-to-Business) donde múltiples veterinarias utilicen la plataforma simultáneamente. Se planifican las siguientes adaptaciones arquitectónicas:
* Evolución del Modelo de Datos: Se debe agregar un identificador de inquilino (veterinaria_id) como clave foránea en todas las tablas principales de la base de datos relacional (Usuario, Mascota, Turno, Atencion_Clinica).
* Aislamiento Lógico en el Backend: Se debe implementar un middleware en Node.js/Express que intercepte todas las peticiones a la API, inyectando automáticamente el veterinaria_id del usuario autenticado en las consultas SQL a la base de datos. Esto garantizará que cada clínica solo pueda consultar y modificar sus propios registros.
* Roles Globales: Se debe incorporar el rol de "Super Administrador" del sistema, encargado de gestionar el alta, suspensión y configuración de las distintas veterinarias suscriptas a la plataforma.

## 5. Funcionalidades incluidas

El MVP del sistema contempla las siguientes funcionalidades:

**Gestión de usuarios y roles**
* Registro e inicio de sesión.
* Gestión de usuarios.
* Diferenciación de permisos según el rol.
* Roles principales: administrador, veterinario y cliente.

**Gestión de clientes y mascotas**
* Alta y modificación de clientes.
* Registro de mascotas asociadas a cada cliente.
* Información básica de cada mascota.
* Consulta del historial de la mascota.

**Gestión de turnos**
* Consulta de disponibilidad.
* Solicitud de turnos online.
* Visualización de próximos turnos.
* Gestión de turnos por parte del personal de la veterinaria.
* Estados de los turnos.

**Gestión veterinaria**
* Registro de atenciones.
* Registro de diagnósticos, tratamientos y observaciones.
* Consulta del historial clínico.
* Registro y seguimiento de vacunas.
* Identificación de vacunas o controles próximos.

**Portal del cliente**
* Consulta de sus mascotas.
* Consulta del historial de atenciones.
* Consulta del estado de vacunación.
* Consulta y solicitud de turnos.

**Sitio público**
* Landing page de la veterinaria.
* Información sobre servicios.
* Información de contacto y ubicación.
* Acceso al sistema.


### 5.a. Fuera del alcance inicial

Estas funcionalidades podrían considerarse como futuras ampliaciones, pero no forman parte del MVP. Para mantener un alcance viable para el equipo y los plazos del proyecto, inicialmente no se contemplan:
* Catálogo de productos de pet shop. 
* Categorías de pet shop. 
* Consulta de precios y stock de pet shop.
* Carrito de compras de pet shop.
* Generación y consulta de pedidos.
* Gestión de productos y stock por parte del administrador.
* Pagos online reales.
* Integración con Mercado Pago u otras plataformas de pago.
* Gestión logística de envíos del Pet Shop.
* Facturación electrónica.
* Seguimiento de envíos.
* Aplicación móvil nativa.
* Integración con sistemas externos de historias clínicas.
* Diagnóstico veterinario automatizado mediante inteligencia artificial.

## 6. Stack Tecnológico

La propuesta tecnológica estará conformada por React, TypeScript, Node.js, Express y MySQL, complementada con herramientas para el control de versiones y el despliegue de la aplicación.

**Frontend**
* React
* TypeScript
* SCSS
* Material-UI
React permitirá desarrollar la interfaz web de manera modular, mientras que TypeScript permitirá trabajar con tipado estático. SCSS será utilizado para organizar y mantener los estilo de la aplicación. Adicionalmente, se integrará la librería Material-UI (MUI) para la implementación ágil de un componente de interfaz estandarizado (selector de fecha). 

**Backend** 
* Node.js
* Express
Node.js será utilizado como entorno de ejecución para el desarrollo del backend, mientras que Express permitirá implementar la API y gestionar las solicitudes realizadas por el frontend. El backend será responsable de la lógica de negocio, la validación de datos, la gestión de las operaciones sobre la base de datos y la comunicación con el frontend mediante una API REST.

**Base de datos**
* MySQL
* MySQL Workbench

Se utilizará MySQL como sistema de gestión de base de datos relacional. La elección de una base de datos relacional resulta adecuada para el dominio del proyecto, debido a la existencia de múltiples entidades y relaciones entre ellas, como usuarios, mascotas, veterinarios y turnos.

El modelo relacional permitirá establecer relaciones entre las distintas entidades mediante claves primarias y foráneas, favoreciendo la integridad, consistencia y organización de los datos. MySQL Workbench será utilizado como herramienta para el diseño, administración y gestión de la base de datos durante el desarrollo.

**Control de versiones**
* Git
* GitHub
El proyecto será desarrollado por las tres integrantes mediante un único repositorio de GitHub.

**Despliegue**
* Vercel para el despliegue del frontend.
* El backend será desplegado en un servicio compatible con Node.js, a definir durante la etapa de implementación.
* MySQL será alojado en un servicio de base de datos compatible con el proyecto, cuya elección será definida teniendo en cuenta las restricciones técnicas y económicas del mismo.

## 7. Repositorio

El proyecto será desarrollado y gestionado mediante un único repositorio de GitHub correspondiente al equipo de trabajo.

URL del repositorio:
https://github.com/MaraBayurk/VET-TF-TUP-UTN
