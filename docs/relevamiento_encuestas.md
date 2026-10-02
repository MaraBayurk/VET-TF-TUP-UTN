
# Validación de la Viabilidad del Proyecto VET

## 1. Introducción

Con el objetivo de validar la problemática identificada y evaluar la viabilidad de la propuesta de VET, se realizaron dos encuestas digitales dirigidas a los principales usuarios del sistema: clientes de veterinarias y profesionales veterinarios.

El relevamiento busca conocer las dificultades que presentan los propietarios de mascotas en la gestión de turnos y el seguimiento sanitario, así como las necesidades de los profesionales en la administración de pacientes, turnos e información clínica.

La información recopilada permite contrastar ambas perspectivas, identificar necesidades comunes y evaluar si las funcionalidades propuestas para VET responden a las problemáticas detectadas.

## 2. Metodología

Para llevar adelante el relevamiento, se diseñaron dos encuestas digitales mediante Google Forms:

- **Encuesta a clientes de veterinarias:** orientada a conocer los métodos actuales de solicitud de turnos, las dificultades de comunicación, el seguimiento sanitario de las mascotas, el acceso a la información clínica y la aceptación de una plataforma digital.
- **Encuesta a profesionales veterinarios:** destinada a identificar las metodologías actuales de gestión del consultorio, la administración de pacientes y turnos, las dificultades operativas y las necesidades de digitalización.

Las respuestas fueron recopiladas mediante formularios digitales y procesadas utilizando herramientas de análisis de datos y visualización en Google Colab. Esto permite obtener estadísticas descriptivas, identificar tendencias y representar gráficamente los resultados.

En esta primera etapa se obtuvieron:

- **55 respuestas de clientes de veterinarias.**
- **9 respuestas de profesionales veterinarios.**

El relevamiento constituye una primera aproximación a las necesidades de los potenciales usuarios. Las encuestas podrán continuar recibiendo respuestas y sus análisis se actualizarán a medida que se incorpore nueva información.

## 3. Encuesta a clientes de veterinarias

### 3.1. Objetivo

Conocer las experiencias y necesidades de los propietarios de mascotas respecto de la gestión de turnos, la comunicación con las veterinarias y el seguimiento de la salud de sus animales, con el fin de evaluar la utilidad de las funcionalidades propuestas por VET.

### 3.2. Perfil de los encuestados

En esta primera etapa se recopilaron **55 respuestas** de clientes de veterinarias.

En relación con la cantidad de mascotas a cargo de los participantes, se obtuvieron los siguientes resultados:

| Cantidad de mascotas | Respuestas | Porcentaje |
|---|---:|---:|
| Una mascota | 22 | 40 % |
| Dos mascotas | 14 | 25,5 % |
| Tres o más mascotas | 19 | 34,5 % |
| **Total** | **55** | **100 %** |

El 60 % de los encuestados tiene dos o más mascotas. Este resultado permite identificar la importancia de contar con una herramienta que facilite la administración de varios animales desde una misma cuenta.

### 3.3. Gestión actual de los turnos

Se consultó a los participantes cómo solicitan actualmente los turnos para la atención veterinaria de sus mascotas.

| Medio utilizado | Respuestas | Porcentaje |
|---|---:|---:|
| WhatsApp | 30 | 54,5 % |
| Personalmente | 18 | 32,7 % |
| Teléfono | 5 | 9,1 % |
| Redes sociales | 1 | 1,8 % |
| Otros | 1 | 1,8 % |
| **Total** | **55** | **100 %** |

Se observa un predominio de los canales de comunicación directa, principalmente WhatsApp y la atención presencial. Esta modalidad puede dificultar la organización de las solicitudes, la consulta de turnos anteriores y el mantenimiento de un registro centralizado.

La utilización de medios no especializados para la gestión de turnos representa una oportunidad para incorporar herramientas que permitan organizar las solicitudes y facilitar el seguimiento de las atenciones.

### 3.4. Dificultades de comunicación con las veterinarias

La encuesta incluyó una pregunta abierta para identificar las principales dificultades que experimentan los clientes al comunicarse con las veterinarias.

Entre las respuestas se identificaron las siguientes situaciones:

- Demoras en las respuestas a través de WhatsApp o teléfono.
- Dificultades para coordinar los turnos según la disponibilidad del cliente y del profesional.
- Necesidad de trasladarse presencialmente para realizar consultas o solicitar atención.
- Horarios de atención limitados y falta de disponibilidad durante fines de semana o emergencias.
- Alta demanda de pacientes y falta de personal para responder las consultas.
- Dificultades para obtener respuestas rápidas ante situaciones que requieren atención.

También se registraron participantes que manifestaron no tener dificultades, especialmente cuando cuentan con una veterinaria de confianza o con atención a domicilio.

Las respuestas permiten identificar oportunidades para mejorar la organización de la comunicación y facilitar el acceso a la información mediante una plataforma digital. No obstante, las situaciones de emergencia requieren atención profesional y disponibilidad efectiva, por lo que el sistema debe entenderse como una herramienta de apoyo y no como un reemplazo de la atención veterinaria.

### 3.5. Seguimiento sanitario de las mascotas

Uno de los aspectos analizados fue la dificultad para recordar los turnos, las vacunas y los controles médicos de las mascotas.

Sobre 53 respuestas válidas, se obtuvieron los siguientes resultados:

| Respuesta | Cantidad | Porcentaje |
|---|---:|---:|
| Sí, me ha pasado varias veces | 19 | 35,8 % |
| Alguna vez puntual | 18 | 34 % |
| No, suelo recordarlo sin problema | 16 | 30,2 % |
| **Total** | **53** | **100 %** |

En conjunto, el **69,8 % de las respuestas válidas** manifestó haber tenido dificultades para recordar al menos alguna vez una fecha relacionada con la salud de sus mascotas.

Este resultado evidencia una necesidad vinculada con la organización del calendario sanitario y la disponibilidad de recordatorios que faciliten el seguimiento de los controles preventivos.

### 3.6. Acceso a la información clínica

En relación con el acceso al historial clínico y al registro de vacunas, se obtuvieron 53 respuestas válidas.

| Modalidad de acceso | Cantidad | Porcentaje |
|---|---:|---:|
| Conserva la libreta sanitaria física | 33 | 62,3 % |
| Le cuesta encontrar los papeles o el carnet físico | 18 | 34 % |
| Depende de lo que recuerde la veterinaria, sin acceso digital | 2 | 3,8 % |
| **Total** | **53** | **100 %** |

Los resultados muestran que la libreta sanitaria física continúa siendo el principal medio de consulta entre los participantes. Sin embargo, una parte importante manifestó dificultades para encontrar los documentos o acceder a la información cuando la necesita.

Esto respalda la propuesta de incorporar una historia clínica digital y un registro centralizado de vacunas, que permitan consultar los antecedentes sanitarios de las mascotas de manera organizada.

### 3.7. Interés en utilizar una plataforma digital

Para conocer la aceptación inicial de VET, se consultó a los participantes si utilizarían una plataforma web que permita gestionar turnos y recibir recordatorios de vacunas y controles.

| Respuesta | Cantidad | Porcentaje |
|---|---:|---:|
| Sí, me gustaría tener todo centralizado | 27 | 49,1 % |
| Tal vez, si es fácil de usar y gratuita | 21 | 38,2 % |
| No, prefiero los métodos tradicionales | 7 | 12,7 % |
| **Total** | **55** | **100 %** |

En conjunto, el **87,3 %** manifestó una disposición positiva o potencial hacia la utilización de la plataforma, ya sea de manera directa o condicionada a determinadas características.

Este resultado constituye un indicador inicial de aceptación de VET entre los clientes encuestados. La facilidad de uso, la accesibilidad y la gratuidad aparecen como aspectos relevantes para considerar durante el desarrollo.

### 3.8. Sugerencias de los clientes

Las respuestas abiertas permitieron identificar propuestas y necesidades adicionales que complementan los resultados de las preguntas cerradas.

Entre las sugerencias más relevantes se encuentran:

- Digitalizar el historial clínico y el registro de vacunas.
- Incorporar un calendario de vacunación con alertas.
- Enviar recordatorios repetidos para reducir los olvidos.
- Permitir consultar la información de las mascotas desde cualquier lugar.
- Facilitar la gestión de varias mascotas desde una misma cuenta.
- Disponer de información sobre veterinarias de guardia y atención en emergencias.
- Facilitar la comunicación de síntomas al profesional.

Estas sugerencias presentan coincidencias con las funcionalidades planteadas para VET y permiten identificar aspectos que podrían evaluarse para futuras ampliaciones de la plataforma.

### 3.9. Conclusión de la encuesta a clientes

Los resultados iniciales permiten identificar necesidades vinculadas con la gestión de turnos, el seguimiento sanitario, el acceso al historial clínico y la administración de múltiples mascotas.

Asimismo, el interés manifestado por los participantes constituye un indicador favorable para continuar con el desarrollo de una plataforma que centralice la información y facilite las tareas cotidianas de los propietarios.

## 4. Encuesta a profesionales veterinarios

### 4.1. Objetivo

Identificar las principales dificultades operativas de las veterinarias y conocer las necesidades de los profesionales respecto de la administración de pacientes, la gestión de turnos, el seguimiento de historias clínicas y la organización del consultorio.

En esta primera etapa se obtuvieron **9 respuestas de profesionales veterinarios**.

### 4.2. Características de los consultorios

Se consultó a los profesionales cuántas personas atienden habitualmente en sus establecimientos.

| Cantidad de profesionales | Respuestas | Porcentaje |
|---|---:|---:|
| Un profesional independiente | 2 | 22,2 % |
| Dos profesionales | 5 | 55,6 % |
| Tres o más profesionales | 2 | 22,2 % |
| **Total** | **9** | **100 %** |

La mayoría de los participantes indicó que trabaja habitualmente con dos profesionales. También se encuentran representados consultorios independientes y establecimientos con tres o más profesionales.

Esta diversidad permite considerar diferentes contextos de trabajo, desde consultorios pequeños hasta equipos con varios profesionales, cuyas necesidades de organización pueden variar.

### 4.3. Gestión actual de los turnos

Se consultó cómo gestionan actualmente los turnos de atención en las veterinarias.

| Método de gestión | Respuestas | Porcentaje |
|---|---:|---:|
| WhatsApp o llamadas telefónicas | 5 | 55,6 % |
| Google Calendar o Excel | 2 | 22,2 % |
| Software específico para veterinarias | 1 | 11,1 % |
| Agenda de papel o cuaderno | 1 | 11,1 % |
| **Total** | **9** | **100 %** |

Los resultados muestran que WhatsApp y las llamadas telefónicas son los medios más utilizados para organizar los turnos, seguidos por herramientas generales como Google Calendar y Excel.

Solo uno de los participantes indicó utilizar un software específico para veterinarias. Esto permite observar que, dentro de la muestra relevada, predominan los canales de comunicación directa y las herramientas de administración general.

La utilización de distintos medios puede generar dificultades para mantener una agenda organizada y centralizar la información de las solicitudes.

### 4.4. Dificultades en la organización de turnos

Las respuestas abiertas permitieron identificar diferentes dificultades relacionadas con la gestión de los turnos.

Entre las situaciones mencionadas por los profesionales se encuentran:

- Superposición de varios pacientes en un mismo horario.
- Necesidad de realizar recordatorios manuales.
- Inasistencias y cancelaciones comunicadas sobre la hora.
- Solicitudes recibidas por WhatsApp que no siempre se registran en la agenda interna.
- Alto volumen de mensajes diarios.
- Dificultades para reprogramar los turnos.
- Pérdida o traspapelado de información.
- Complejidad para organizar los turnos mediante herramientas generales.

Uno de los participantes manifestó que, al recibir las solicitudes por WhatsApp, en ocasiones los turnos no se anotan en el archivo de Excel utilizado internamente. Otro señaló que la cantidad de mensajes recibidos dificulta la organización del trabajo.

Estas respuestas muestran que las dificultades no se limitan a la asignación de horarios, sino que también involucran el registro, la comunicación, la reprogramación y el seguimiento de las solicitudes.

### 4.5. Registro y consulta de historias clínicas

Se consultó a los profesionales cómo registran y consultan las historias clínicas de las mascotas.

| Método de registro | Respuestas | Porcentaje |
|---|---:|---:|
| Fichas físicas en papel | 3 | 33,3 % |
| Software veterinario especializado | 3 | 33,3 % |
| Archivos digitales (Word, Excel o PDF) | 3 | 33,3 % |
| **Total** | **9** | **100 %** |

Los resultados muestran una distribución equitativa entre las tres modalidades relevadas.

Esta diversidad refleja que los profesionales utilizan diferentes herramientas para registrar y consultar la información clínica. En algunos casos, los datos se encuentran en documentos físicos, mientras que en otros se utilizan archivos digitales o sistemas especializados.

La coexistencia de distintos métodos permite identificar una oportunidad para centralizar la información y facilitar su consulta, organización y actualización.

### 4.6. Seguimiento de vacunas, tratamientos y controles

Se consultó a los profesionales cómo realizan el seguimiento de las vacunas, los tratamientos y los próximos controles de sus pacientes.

Las respuestas muestran diferentes modalidades de trabajo:

- Recordatorios mediante WhatsApp.
- Comunicación por WhatsApp y llamadas telefónicas.
- Recordatorios generados por sistemas de gestión.
- Consulta de fichas clínicas y registros.
- Utilización del carnet sanitario físico.
- Casos en los que no se registra o no se realiza un seguimiento sistemático.

Los resultados evidencian que no existe un único procedimiento compartido por todos los participantes. Mientras algunos profesionales utilizan herramientas digitales y recordatorios, otros dependen de medios de comunicación directa o de registros físicos.

También se identificaron respuestas que indican que no se lleva un registro o seguimiento específico de estas actividades.

Esta diversidad permite reconocer la necesidad de contar con herramientas que faciliten la planificación y el seguimiento de las vacunas, los tratamientos y los controles de los pacientes.

### 4.7. Interés en implementar una plataforma digital

Se consultó a los profesionales si considerarían útil implementar un sistema web que permita centralizar la gestión de turnos, historias clínicas y vacunas.

De las 9 respuestas, 7 contestaron esta pregunta:

| Respuesta | Cantidad | Porcentaje sobre respuestas válidas |
|---|---:|---:|
| Sí, muchísimo | 5 | 71,4 % |
| Tal vez, depende de los costos y la facilidad de uso | 2 | 28,6 % |
| Sin respuesta | 2 | No aplica |
| **Total de respuestas válidas** | **7** | **100 %** |

Entre quienes respondieron la pregunta, el **100 % manifestó interés o una posible disposición a implementar un sistema de este tipo**. Cinco profesionales expresaron una aceptación directa y dos condicionaron su decisión al costo y a la facilidad de uso.

Este resultado constituye un indicador inicial de aceptación entre los profesionales que respondieron, aunque debe interpretarse considerando el tamaño reducido de la muestra y las respuestas faltantes.

### 4.8. Sugerencias de los profesionales

Las sugerencias abiertas permitieron identificar aspectos que los profesionales consideran relevantes para una plataforma de gestión veterinaria.

Entre las respuestas se mencionaron:

- Poder consultar el historial clínico de los pacientes.
- Permitir que el veterinario registre toda la información de cada atención.
- Contar con un único portal para centralizar la información.
- Desarrollar un sistema que sea fácil de utilizar.

Estas sugerencias coinciden con las necesidades identificadas en las preguntas sobre gestión de turnos, historias clínicas y seguimiento sanitario.

### 4.9. Conclusión de la encuesta a profesionales

Los resultados de la encuesta permiten identificar dificultades operativas relacionadas con la organización de turnos, las solicitudes recibidas por distintos canales, las cancelaciones, los recordatorios manuales y la diversidad de métodos para registrar las historias clínicas.

Asimismo, los profesionales que respondieron la pregunta sobre la utilidad del sistema manifestaron interés en una plataforma que centralice estas tareas, aunque algunos señalaron que su adopción dependería del costo y de la facilidad de uso.

Estos resultados permiten orientar las funcionalidades de VET hacia las necesidades de administración y organización de los consultorios veterinarios.

## 5. Análisis conjunto de ambas encuestas

El análisis de las dos encuestas permite observar las necesidades desde las perspectivas de los clientes y de los profesionales veterinarios.

Mientras que los clientes se enfocan principalmente en la facilidad para solicitar turnos, recordar fechas importantes y consultar la información sanitaria, los profesionales destacan las dificultades para organizar las solicitudes, evitar superposiciones, registrar las atenciones y realizar el seguimiento de sus pacientes.

Ambas perspectivas presentan necesidades relacionadas, que pueden abordarse mediante funcionalidades compartidas de la plataforma.

| Problemática identificada | Clientes | Profesionales | Funcionalidad propuesta en VET |
|---|---|---|---|
| Gestión de turnos mediante canales manuales | Solicitan turnos principalmente por WhatsApp y presencialmente. | Predominan WhatsApp y llamadas telefónicas. | Gestión digital de turnos y agenda veterinaria. |
| Dificultades de organización de turnos | Problemas para coordinar horarios y obtener respuestas. | Superposición, pérdida de solicitudes y dificultades de reprogramación. | Agenda centralizada y administración de estados de los turnos. |
| Olvido de vacunas y controles | El 69,8 % de las respuestas válidas indicó haber tenido dificultades alguna vez. | Se utilizan métodos diversos, desde recordatorios manuales hasta sistemas especializados. | Calendario sanitario y recordatorios. |
| Acceso al historial clínico | Dificultades para encontrar o consultar documentos físicos. | Se utilizan fichas físicas, archivos digitales y software especializado. | Historia clínica digital. |
| Información distribuida | Registros físicos y dependencia de la información disponible en la veterinaria. | Uso de múltiples herramientas y métodos de registro. | Centralización de la información. |
| Seguimiento de las mascotas | Necesidad de consultar vacunas, estudios y próximos controles. | Necesidad de registrar las atenciones y realizar seguimientos. | Registro de pacientes, historial de atenciones y vacunas. |
| Facilidad de uso | Algunos condicionan la utilización a que la plataforma sea sencilla y gratuita. | Algunos condicionan la implementación al costo y la facilidad de uso. | Interfaz intuitiva y accesible. |

El análisis conjunto muestra que las necesidades de ambos grupos se complementan. La gestión digital de turnos, por ejemplo, puede facilitar la solicitud para los clientes y, al mismo tiempo, mejorar la organización de la agenda para los profesionales.

De la misma manera, la historia clínica digital puede facilitar el acceso a los antecedentes sanitarios de las mascotas y permitir que los profesionales mantengan la información de sus pacientes organizada.

## 6. Análisis dinámico de los resultados

Con el objetivo de mantener actualizado el relevamiento y facilitar la consulta de los datos, se utiliza notebook en Google Colab destinado al procesamiento, análisis y visualización de las respuestas de las encuestas.

En este espacio se presentan los resultados detallados mediante tablas, gráficos y estadísticas descriptivas. A medida que se incorporen nuevas respuestas, se podrán actualizar los análisis para observar la evolución de las necesidades identificadas.

El siguiente notebook contiene el análisis de las respuestas:

**[Acceder al análisis de clientes y veterinarias en Google Colab](https://colab.research.google.com/drive/17YuomhglDUliRWpRgDYFf0osiJpF6egS?usp=sharing)**

> **Nota:** Los resultados presentados en este documento corresponden a una primera versión del relevamiento: 55 respuestas de clientes y 9 de profesionales veterinarios. Los análisis detallados y las futuras actualizaciones se realizarán en los notebooks correspondientes.

## 7. Evaluación de la viabilidad del proyecto

A partir de los resultados obtenidos en ambas encuestas, es posible realizar una primera evaluación de VET desde diferentes perspectivas.

### 7.1. Viabilidad funcional

La encuesta a clientes permitió identificar necesidades relacionadas con la gestión de turnos, el seguimiento sanitario, el acceso a la historia clínica y la administración de múltiples mascotas.

Por su parte, la encuesta a profesionales permitió reconocer dificultades relacionadas con la organización de las agendas, el registro de solicitudes, las cancelaciones, los recordatorios y la administración de la información clínica.

Estas necesidades coinciden con las funcionalidades principales previstas para VET, lo que respalda la pertinencia funcional de la propuesta y permite establecer prioridades para su desarrollo.

### 7.2. Viabilidad de uso y aceptación

En la encuesta a clientes, el 87,3 % manifestó que utilizaría la plataforma o que podría hacerlo si fuera fácil de usar y gratuita.

En la encuesta a profesionales, los 7 participantes que respondieron la pregunta sobre la utilidad del sistema expresaron interés o una posible disposición a implementarlo.

Estos resultados constituyen indicadores iniciales de aceptación en ambos grupos. La facilidad de uso y las condiciones de acceso aparecen como aspectos importantes para considerar durante el diseño y la implementación.

Sin embargo, la intención declarada no garantiza la utilización efectiva del sistema. Por ello, será necesario complementar el relevamiento con pruebas de usabilidad y evaluaciones con usuarios reales.

### 7.3. Viabilidad técnica

Las necesidades detectadas pueden abordarse mediante una aplicación web que centralice la información de los usuarios, las mascotas, los turnos, las historias clínicas y las vacunas.

La encuesta contribuye a identificar y priorizar los requerimientos funcionales. La viabilidad técnica deberá complementarse con el diseño de la arquitectura, la implementación, las pruebas de funcionamiento y las evaluaciones de seguridad correspondientes.

### 7.4. Viabilidad operativa

Desde la perspectiva de los clientes, VET busca facilitar la solicitud y consulta de turnos, el acceso a la información sanitaria y el seguimiento de las mascotas.

Desde la perspectiva de los profesionales, el sistema busca facilitar la organización de las agendas, centralizar los registros y mejorar la administración de los pacientes.

La coincidencia entre las necesidades de ambos grupos permite identificar oportunidades para integrar los procesos de atención y gestión dentro de una misma plataforma.

La viabilidad operativa deberá evaluarse también mediante pruebas que permitan verificar que las funcionalidades se adapten a las rutinas reales de los consultorios y no generen tareas adicionales innecesarias.

### 7.5. Viabilidad de implementación

El interés expresado por los participantes y las necesidades detectadas constituyen información relevante para evaluar la implementación de VET.

La facilidad de uso y la gratuidad mencionadas por algunos encuestados deberán considerarse al analizar las alternativas de implementación y mantenimiento.

Para profundizar esta evaluación será necesario analizar los recursos técnicos y económicos, los costos de mantenimiento, las necesidades de capacitación y las alternativas de sostenibilidad del sistema.

## 8. Limitaciones del relevamiento

Los resultados obtenidos corresponden a las personas que participaron voluntariamente en las encuestas y no necesariamente representan a la totalidad de los clientes o profesionales veterinarios.

La encuesta a clientes cuenta con 55 respuestas, mientras que la encuesta a profesionales veterinarios cuenta con 9. En particular, la cantidad de respuestas de profesionales es reducida, por lo que sus resultados deben interpretarse como una primera aproximación a las necesidades del sector.

Además, algunas preguntas presentan respuestas faltantes y las opiniones expresadas en las preguntas abiertas representan experiencias individuales.

Por este motivo, los resultados no permiten generalizar las conclusiones a todas las veterinarias ni a todos los propietarios de mascotas. La incorporación de nuevas respuestas y las pruebas con usuarios reales permitirán ampliar y profundizar la validación.

## 9. Conclusión general

El relevamiento realizado a clientes y profesionales veterinarios permitió identificar problemáticas relacionadas con la gestión de turnos, el seguimiento sanitario, el acceso a la información clínica y la organización operativa de los consultorios.

Desde la perspectiva de los clientes, se identificaron dificultades para recordar fechas importantes, acceder a los antecedentes sanitarios y coordinar turnos mediante los canales tradicionales. Además, el 87,3 % manifestó que utilizaría la plataforma o que podría hacerlo si fuera fácil de usar y gratuita.

Desde la perspectiva de los profesionales, se identificaron dificultades para organizar los turnos, gestionar las solicitudes recibidas por distintos medios, realizar recordatorios y mantener centralizada la información clínica. Entre quienes respondieron la pregunta sobre la utilidad del sistema, todos manifestaron interés o una posible disposición a implementarlo, aunque algunos condicionaron su decisión al costo y a la facilidad de uso.

El análisis conjunto permite observar que las necesidades de ambos grupos se complementan y que las funcionalidades propuestas para VET responden a problemáticas identificadas en las dos encuestas.

Por lo tanto, los resultados de esta primera etapa respaldan la **pertinencia funcional y la aceptación inicial de la propuesta** desde las perspectivas de los clientes y de los profesionales encuestados. La viabilidad integral del proyecto deberá complementarse con nuevas respuestas, pruebas técnicas, evaluaciones de usabilidad y un análisis de los recursos necesarios para su implementación y mantenimiento.
