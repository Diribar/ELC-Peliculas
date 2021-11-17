GENERAL
- Todos los controles del BE se hacen también en el FE

COLECCIONES
- Para las películas que pertenecen a una colección:
	- Se ingresa siempre primero la colección, luego la película
	- Se elije la colección en el primer paso posible:
		- TMDB: en Desambiguar, se muestra el error si la colección no está creada
		- FA: en copiarFA
		- IM: en Datos Duros
- Colección a partir de películas ya creadas:
	- Sólo es posible si las películas fueron creadas como "NO enColeccion"
	- Se debe editar la película, cambiando el campo "¿Pertenece a una colección?"
	- Luego, se debe elegir la colección. Opciones:
		- Primero: colecciones del usuario, ordenadas por las más recientes
		- Segundo: demás colecciones, ordenadas alfabéticamente
- Nueva película TMDB, en colección en BD, pero cuya parte no figura en BD
	- Se detecta en Desambiguar
	- Primero se actualizan las partes mediante API, luego se sigue con la película

PALABRAS CLAVE
- OK: Sin discriminar entre Colecciones, TV y Películas
- OK: Consulta de API, sólo con botón verificar

DESAMBIGUAR
- Avisa en el momento si se eligió una película cuya colección no está en la BD

COPIAR FA
- Sólo para usuarios elegidos (apto FA)
- Si la película pertenece a una colección, se elije en el momento

DATOS DUROS:
- Bloquear datos de API, completar saldo a mano
- Fuente IM: si la película pertenece a una colección, se elije en el momento

DATOS PERSONALIZADOS
- Orden de opciones en campos: de más interesante a menos interesante
- Calificación Promedio: 50% Fe/Valores, 30% Entretiene, 20% Calidad filmica

CONFIRMAR
- Mismos datos que en Desambiguar, más Director
