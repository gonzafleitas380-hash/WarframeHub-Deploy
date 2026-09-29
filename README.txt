Especificación de Aplicación
Warframe Hub
Plataforma web de referencia para la comunidad de Warframe

Versión	1.0.0
Estado	Borrador
Autor	Lara Bouder, Ezequiel Gaude, Gonzalo Fleitas
Stack	React · Node.js · MySQL
Repositorios	warframe-hub-frontend  /  warframe-hub-backend  /  warframe-hub-db
Fecha	24/4/2026

1. Objetivo
Warframe Hub es una aplicación web full stack de consulta y referencia orientada a jugadores de Warframe. Su propósito es centralizar toda la información relevante sobre los Warframes del juego en un solo lugar, eliminando la necesidad de navegar entre múltiples sitios externos para obtener datos como habilidades, estadísticas, crafting, adquisición, curiosidades y precios de mercado.

2. Alcance
Incluye
•	Página de inicio con acceso al catálogo de Warframes
•	Catálogo completo de los 64 Warframes disponibles en el juego
•	Ficha detallada de cada Warframe con las siguientes secciones:
–	Descripción general del personaje
–	Habilidades (pasiva + 4 activas)
–	Estadísticas base y escalado por rango
–	Crafting: componentes, receta y tiempos de construcción
–	Adquisición: donde y como obtener el Warframe o sus partes
–	Curiosidades e información de lore
–	Precio de mercado en tiempo real vía API de warframe.market
•	Sistema de autenticación: registro e inicio de sesión.
•	Perfil de usuario con datos propios.
•	Diseño responsive para PC y celular
No incluye (MVP)
•	Información de armas, mods, misiones u otras entidades del juego
•	Builds de mods personalizados
•	Historial de precios o gráficos de evolución del mercado
•	Chat, comentarios o interacciones sociales entre usuarios
•	Internacionalización (idiomas distintos al español)

3. Contexto funcional
La aplicación está dirigida a jugadores de Warframe de nivel intermedio o avanzado que buscan información específica sobre Warframes sin tener que alternar entre la wiki oficial, warframe.market, YouTube y otros sitios. Al unificar estas fuentes, Warframe Hub reduce la fricción de consulta y ofrece una experiencia cohesiva.
El acceso al catálogo es público: cualquier visitante puede explorar la ficha de cualquier Warframe sin necesidad de registrarse. El registro habilita funcionalidades de perfil y, en versiones futuras, guardado de favoritos o builds.
El precio de mercado se consume desde la API pública de warframe.market. Para evitar sobrecarga de solicitudes, cada precio tiene un tiempo mínimo de refresco de 1 minuto 30 segundos. El usuario puede solicitar una actualización manual pasado ese intervalo.

4. Requisitos funcionales
Página de inicio
•	RF-01: La página de inicio debe presentar un botón o acceso visible con el texto 'Explorar Warframes' que redirija al catálogo.
•	RF-02: Debe mostrar una breve descripción del sitio para usuarios nuevos.
•	RF-03: El estado de autenticación (usuario logueado o no) debe reflejarse en el header global.
Catálogo de Warframes
•	RF-04: El catalogo debe mostrar los 64 Warframes disponibles en formato de grilla de tarjetas.
•	RF-05: Cada tarjeta debe incluir imagen, nombre y progenitor del Warframe.
•	RF-06: El catalogo debe contar con un campo de búsqueda por nombre y filtros por tipo.
•	RF-07: Al hacer click en una tarjeta, el usuario es redirigido a la ficha detallada del Warframe.

Ficha detallada
•	RF-08: La ficha debe organizar la información en secciones navegables: Descripción, Habilidades, Estadísticas, Crafting, Adquisición, Curiosidades y Precio de mercado.
•	RF-09: Las habilidades deben mostrar nombre, descripción e icono de cada una (pasiva + 4 activas).
•	RF-10: Las estadísticas deben presentarse en formato de tabla con valores base y máximos por rango.
•	RF-11: La sección de Crafting debe listar los componentes necesarios, cantidades y tiempo de construcción en la Fundición (Foundry).
•	RF-12: La sección de Adquisición debe indicar donde conseguir el blueprint y cada parte del Warframe.
•	RF-13: El precio de mercado debe consumirse de la API de warframe.market y mostrar el precio promedio de compra/venta.
•	RF-14: El precio debe actualizarse como máximo una vez cada 90 segundos. El usuario puede ver el tiempo restante para el próximo refresco disponible.
Sistema de usuarios
•	RF-15: El usuario puede registrarse con nombre de usuario, email y contraseña.
•	RF-16: El usuario puede iniciar y cerrar sesión.
•	RF-17: Cada usuario tiene una página de perfil pública con su nombre, avatar y fecha de registro.
•	RF-18: El usuario autenticado puede editar su información de perfil.

5. Requisitos no funcionales
•	RNF-01 Seguridad: Las contraseñas deben almacenarse hasheadas (bcrypt). Las rutas protegidas deben validar el JWT en cada solicitud.
•	RNF-02 Disponibilidad de datos: Si la API de warframe.market no responde, la sección de precio debe mostrar un mensaje de error no intrusivo sin romper el resto de la ficha.
•	RNF-03 Compatibilidad: La aplicación debe funcionar correctamente en las últimas versiones de Chrome, Firefox, Safari y Edge.

6. Diseño de interfaz
Estructura de vistas
•	/Landing page con CTA 'Explorar Warframes' y acceso al login
•	/warframes — Catalogo en grilla con búsqueda y filtros
•	/warframes/:id — Ficha detallada del Warframe
•	/login y /register — Formularios de autenticación
•	/profile/:username — Pagina de perfil de usuario
Estados visuales clave
•	Estado de carga (skeleton loader) en catalogo y ficha mientras llegan los datos
•	Estado vacío en catalogo si ningún Warframe coincide con la búsqueda
•	Estado de error en la sección de precio de mercado si la API de warframe.market no responde
•	Contador de cooldown visible en la sección de precio, indicando cuanto falta para poder refrescar
Componentes principales
•	Header global con logo, navegación y estado de sesión del usuario
•	WarframeCard: tarjeta del catálogo con imagen, nombre y tipo
•	WarframeDetail: contenedor de la ficha con tabs o scroll por secciones
•	AbilityCard: muestra icono, nombre y descripción de cada habilidad
•	StatsTable: tabla de estadísticas base y máximas
•	MarketPrice: precio de mercado con botón de refresco y cooldown
•	UserProfileCard: cabecera del perfil con avatar y datos del usuario


7. Entradas y salidas
Entradas
•	Usuario no autenticado: navegación libre por catálogo y fichas
•	Usuario autenticado: credenciales (email + contraseña) validadas contra la base de datos
•	Parámetro de búsqueda: texto libre para filtrar el catalogo por nombre
•	Filtro de tipo: Normal / Prime
•	Solicitud de refresco de precio: solo disponible si han pasado 90 segundos desde el ultimo
Salidas
•	Catalogo renderizado con los Warframes filtrados según búsqueda y tipo seleccionado
•	Ficha completa del Warframe con todos sus datos organizados por secciones
•	Precio de mercado actualizado consumido desde warframe.market
•	Token JWT retornado al usuario tras login exitoso, almacenado en el cliente para autorizar rutas protegidas
•	Página de perfil con datos públicos del usuario


8. Reglas de negocio
•	RN-01: El catalogo y las fichas son de acceso público. No se requiere autenticación para consultarlos.
•	RN-02: El registro de usuario requiere un email único y una contraseña de al menos 8 caracteres.
•	RN-03: El precio de mercado no puede refrescarse antes de que transcurran 90 segundos desde la última consulta exitosa a la API de warframe.market.
•	RN-04: Si warframe.market devuelve un error o no responde en 5 segundos, se muestra el último precio cacheado con su marca de tiempo, o un mensaje de no disponible si no existe cache.
•	RN-05: Los datos de los 64 Warframes (descripción, habilidades, estadísticas, crafting, adquisición, curiosidades) se almacenan en la base de datos propia del proyecto y son administrados por el desarrollador. No se consumen en tiempo real de ninguna API externa salvo el precio.
•	RN-06: El nombre de usuario en el perfil es único y no puede cambiarse una vez registrado (en el MVP).


9. Arquitectura técnica

Frontend — warframe-hub-frontend
Aplicación de página única (SPA) construida con React. Utiliza React Router para la navegación entre vistas. El estado global de autenticación se maneja con Context API. Las llamadas al backend se realizan mediante fetch o axios desde una capa de servicios centralizada.


Backend — warframe-hub-backend
API REST construida con Node.js y Express. Expone los endpoints para obtener datos de Warframes, gestionar usuarios y autenticación, y actuar como proxy hacia la API de warframe.market (aplicando el control de cooldown de 90 segundos del lado del servidor). La autenticación se implementa con JWT.
Base de datos — warframe-hub-db
Base de datos relacional, MySQL como opción principal. Tablas principales: warframes, abilities, stats, crafting_components, acquisition_sources, users. El repositorio incluye el esquema DDL, migraciones y datos seed para los 64 Warframes.
Integración externa
La API de warframe.market se consume únicamente desde el backend, nunca desde el frontend. Esto centraliza el control del cooldown, protege la clave de origen y evita problemas de CORS. El backend cachea la última respuesta exitosa por Warframe junto a su timestamp para aplicar la regla de los 90 segundos.

10. Dependencias
Frontend
•	react y react-dom — Libreria de UI
•	react-router-dom — Navegación entre vistas
•	axios — Cliente HTTP para llamadas al backend
•	Context API — Estado global de sesión
Backend
•	express — Framework HTTP
•	jsonwebtoken — Generación y validación de JWT
•	bcrypt — Hasheo de contraseñas
•	mysql2 — Driver de base de datos
•	node-fetch o axios — Llamadas a la API de warframe.market

Externas
•	API de warframe.market — Precio de mercado en tiempo real (publica, sin autenticación requerida para consultas básicas)

11. Contratos / API interna
Endpoints principales
•	GET /api/warframes — Lista todos los Warframes (id, nombre, tipo, imagen)
•	GET /api/warframes/:id — Devuelve la ficha completa de un Warframe
•	GET /api/warframes/:id/price — Devuelve el precio de mercado (con cache de 90s)
•	POST /api/auth/register — Registro de nuevo usuario
•	POST /api/auth/login — Login, retorna JWT
•	GET /api/users/:username — Perfil público del usuario
•	PUT /api/users/me — Edicion de perfil (requiere JWT)
Modelos de datos clave
•	Warframe: { id, nombre, tipo, descripcion, imagen_url, habilidades[], stats{}, crafting{}, adquisicion[], curiosidades[], fecha_creacion }
•	Usuario: { id, username, email, password_hash, avatar_url, fecha_registro }
•	PrecioMercado: { warframe_id, precio_compra, precio_venta, ultima_actualizacion }


12. Casos de uso
•	CU-01 Explorar catalogo: El usuario llega a la landing page, hace click en 'Explorar Warframes', ve la grilla con los 64 Warframes y puede filtrar por nombre o tipo.
•	CU-02 Consultar ficha: El usuario hace click en Wisp, ve su descripción, habilidades con iconos, estadísticas en tabla, donde farmearlo y el precio actual en warframe.market.
•	CU-03 Refrescar precio: El usuario abre la ficha de un Warframe, ve el precio con timestamp, espera 90 segundos y hace click en 'Actualizar precio'. El sistema consulta warframe.market y muestra el nuevo valor.
•	CU-04 Registro: El usuario completa el formulario con email, username y contraseña. El sistema valida unicidad y crea la cuenta. El usuario queda autenticado automáticamente.
•	CU-05 Login: El usuario ingresa email y contraseña. El sistema valida, retorna un JWT y redirige al catálogo con el header mostrando su nombre de usuario.
•	CU-06 Ver perfil: Un visitante accede a /profile/nombreUsuario y ve el avatar, nombre y fecha de registro del usuario.
•	CU-07 Editar perfil: El usuario autenticado accede a su perfil, hace click en 'Editar', modifica su avatar o descripción y guarda los cambios.



13. Casos borde y errores
•	Búsqueda sin resultados: El catalogo muestra un estado vacío con el mensaje 'No se encontraron Warframes para [termino]'.
•	Warframe no encontrado: Si el ID en la URL no existe, mostrar pagina 404 con link de regreso al catálogo.
•	API warframe.market sin respuesta: Mostrar el último precio cacheado con su timestamp, o el mensaje 'Precio no disponible' si no hay cache.
•	Intento de refresco antes de 90 segundos: El botón de refresco esta deshabilitado y muestra el tiempo restante. No se realiza ninguna llamada a la API.
•	Email ya registrado: El formulario de registro muestra el error 'Este email ya está en uso' sin exponer información adicional.
•	JWT expirado: El backend retorna 401. El frontend redirige al login y limpia el token del cliente.
•	Contraseña incorrecta en login: Mensaje genérico 'Credenciales inválidas' para no revelar si el email existe.
•	Nombre de usuario con caracteres especiales: El campo debe validar y rechazar caracteres no permitidos con un mensaje claro antes de enviar el formulario.
•	Imagen de Warframe no disponible: Mostrar imagen placeholder genérica para que el layout no se rompa.

14. Criterios de aceptación
•	CA-01: Dado que el usuario llega a la landing, debe ver el boton 'Explorar Warframes' visible sin necesidad de hacer scroll en desktop.
•	CA-02: Dado que el usuario accede al catálogo, los 64 Warframes deben renderizarse correctamente con imagen, nombre y tipo.
•	CA-03: Dado que el usuario busca 'volt', el catalogo debe mostrar únicamente los Warframes cuyo nombre contenga ese término (Volt, Volt Prime).
•	CA-04: Dado que el usuario abre la ficha de un Warframe, todas las secciones (Descripción, Habilidades, Estadísticas, Crafting, Adquisición, Curiosidades, Precio) deben estar presentes y con contenido.
•	CA-05: Dado que el usuario intenta refrescar el precio antes de 90 segundos, el botón debe estar deshabilitado y mostrar el countdown.
•	CA-06: Dado que el usuario se registra con un email ya existente, el sistema debe retornar un mensaje de error sin crear la cuenta.
•	CA-07: Dado que el usuario inicia sesión correctamente, el header debe mostrar su nombre de usuario en todas las vistas posteriores.
•	CA-08: Dado que warframe.market no responde, la ficha del Warframe debe seguir siendo accesible y la sección de precio debe mostrar el error de forma no intrusiva.

16. Riesgos y consideraciones
•	Riesgo: La API de warframe.market puede cambiar su estructura o quedar offline. Mitigación: abstraer la llamada en un servicio propio del backend, facilitando cambiar la fuente sin tocar el frontend.
•	Riesgo: Los datos de los Warframes (habilidades, estadísticas) pueden quedar desactualizados con cada nuevo parche del juego. Mitigación: diseñar el schema de la DB de forma que actualizar un Warframe sea una operación simple de UPDATE, y documentar el proceso.
•	Riesgo: El tiempo de desarrollo puede extenderse. Mitigación: el MVP está acotado a los Warframes únicamente, reduciendo el scope al mínimo funcional entregable.
•	Riesgo: MySQL Workbench no está confirmado como base de datos. Si cambia a otra base de datos, el backend deberá adaptarse. Mitigación: encapsular toda la lógica de acceso a datos en un repositorio separado para facilitar el cambio.
•	Riesgo: Inconsistencias visuales entre la versión desktop y mobile. Mitigación: desarrollar con enfoque mobile-first desde el inicio.

18. Anexos⚠(Información NO correcta)
•	API externa utilizada: https://api.warframe.market/v1 (documentación publica)
•	Repositorios del proyecto: warframe-hub-frontend / warframe-hub-backend / warframe-hub-db
•	Referencia de Warframes: https://warframe.fandom.com/wiki/Warframe_Wiki (fuente de datos para seed)
•	Herramienta de diseño: por definir (Figma)
•	Total de Warframes en scope del MVP: 64
