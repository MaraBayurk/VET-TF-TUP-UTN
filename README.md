# VET-TF-TUP-UTN
**Alumnos**
* Mara Valentina Bayurk, 
* Berrone Lanza Lina Lucia, 
* Erica Bustamante,

**Comisión 10**
**Grupo 216**

**Tecnicatura Universitaria en Programación - Universidad Tecnológica Nacional.**
**Trabajo Final**

**Docente Titular**
Sofía Raia

29 de Agosto de 2026

## Índice

* Definición del problema                                3
* Análisis de Competencia en el Mercado                  4
* Propuesta de solución                                  4
* Alcance                                                4             
* Funcionalidades incluidas                              5                   
* Fuera del alcance inicial                              6
* Stack Tecnológico                                      6
* Repositorio                                            7


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
La problemática planteada deberá ser validada posteriormente mediante el relevamiento de las necesidades de usuarios reales del ámbito veterinario, ya que resulta necesario confirmar cómo se realizan actualmente estos procesos, qué dificultades se presentan y cuáles son las funcionalidades que mayor valor aportarían.

## 2. Análisis de Competencia en el Mercado

En el análisis de competencias nos encontramos dos escenarios:
* Competidores indirectos: Son los mas comunes ya que la gran mayoría de las veterinarias de barrio usan Microsoft Excel, Google Calendar para los turnos, y libretas de papel. Estas son alternativas manuales que compiten por la atención del usuario, están instaladas en el mercado y  no le son ajenas al personal.
* Competidores directos: Existen sistemas de gestión veterinaria (como QVET, WinVet, Provet Cloud y Myvet) especializados. Sin embargo, muchos de estos sistemas son de escritorio (instalables, no en la nube), costosos, o están pensados 100% para la administración de la clínica, sin un portal para el cliente.

## 3. Propuesta de solución

Se propone desarrollar una plataforma web integral para la gestión de una veterinaria, destinada a centralizar la información administrativa y clínica de sus pacientes y facilitar la interacción con sus clientes. El sistema contará con diferentes roles de usuario y permitirá gestionar clientes, mascotas, profesionales, turnos, atenciones y vacunas.
Nuestra propuesta de valor y mayor fortaleza es la comunicación bidireccional. Que la plataforma sea web responsive y que el dueño tenga su propio portal para ver la información. Es decir, los clientes de la veterinaria al loguearse en la página pueden realizar diferentes acciones relacionadas con la gestión de la salud de su mascota. 
También fueron contempladas funcionalidades complementarias que podrían agregar valor al proyecto como la incorporación de un chatbot que pueda responder consultas frecuentes y asistir a los usuarios en determinadas operaciones, como la búsqueda o solicitud de turnos. También podría ser un módulo de Pet Shop para la consulta de productos, gestión de stock y generación de pedidos.

La propuesta busca aportar valor mediante:
* Centralización de la información.
* Reducción de tareas manuales.
* Mayor facilidad para consultar el historial de las mascotas.
* Mejor organización de los turnos.
* Seguimiento de vacunas y controles.
* Acceso de los clientes a la información de sus mascotas.
* Posibilidad de realizar determinadas gestiones de manera online.

La estructuras la  planteamos como una pantalla

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

**ACTUALIZACIONES POSIBLES - MVP VERSIÓN 2.0:** 
El chatbot será considerado una funcionalidad complementaria y su implementación quedará condicionada al tiempo disponible y a la viabilidad técnica.
* Chatbot
* Respuestas a preguntas frecuentes.
* Orientación sobre el uso de la plataforma.
* Asistencia básica para la solicitud de turnos.

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
React permitirá desarrollar la interfaz web de manera modular, mientras que TypeScrip permitirá trabajar con tipado estático. SCSS será utilizado para organizar y mantener los estilo de la aplicación. Y se utilizarán elementos aleatorios de Material-UI. 

**Backend** 
* Node.js
* Express
Node.js será utilizado como entorno de ejecución para el desarrollo del backend, mientras que Express permitirá implementar la API y gestionar las solicitudes realizadas por el frontend. El backend será responsable de la lógica de negocio, la validación de datos, la gestión de las operaciones sobre la base de datos y la comunicación con el frontend mediante una API REST.

**Base de datos**
* MySQL
* MySQL Workbench

Se utilizará MySQL como sistema de gestión de base de datos relacional. La elección de una base de datos relacional resulta adecuada para el dominio del proyecto, debido a la existencia de múltiples entidades y relaciones entre ellas, como usuarios, mascotas, veterinarios, turnos y productos.

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
