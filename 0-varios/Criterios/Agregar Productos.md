GENERAL
- Todos los controles del BE se hacen también en el FE
- "Recorrido on top"
	- Palabra Clave
	- Desambiguar/TipoProducto
	- CopiarFA
	- Datos Duros
	- Datos Pers
	- Confirmar

******************** PROGRAMACIÓN ORIENTADA A OBJETOS ***********************
TIPOS DE PRODUCTOS
- Tres opciones:
	- Películas sin colección
	- Colecciones
	- Capítulos
- Capítulos que fueron creados como películas o viceversa: se debe dar de baja la entidad mal creada y de alta la correcta
- Se ingresa siempre primero la colección
- Se elije la colección en el primer paso posible:
	- TMDB: en Desambiguar, se avisa que se va a ingresar la colección
	- FA/IM: en TipoProducto
	- En Desambiguar: un sólo botón para IM

PELÍCULAS SIN COLECCION
OK	- TMDB:	PalClave(TMDB), Desambiguar, 					DD, DP, Confirmar, Conclusión, Detalle
	- FA:	PalClave(IM), TipoProducto(Pelic+FA), copiarFA, DD, DP, Confirmar, Conclusión, Detalle
	- IM:	PalClave(TMDB), Desamb.(IM), TipoProd.(Pel+IM),
			PalClave(IM), TipoProducto(Pelic+IM),
												 			DD, DP, Confirmar, Conclusión, Detalle

COLECCIONES
	- TMDB:	PalClave(TMDB), Desambiguar, 					DD, DP, Confirmar, Conclusión, Detalle
	- FA:	PalClave(IM), TipoProducto(Colec+FA), copiarFA, DD, DP, Confirmar, Conclusión, Detalle
	- IM:	PalClave(TMDB), Desamb.(IM), TipoProd.(Col+IM),
			PalClave(IM), TipoProducto(Colec+IM),
												 			DD, DP, Confirmar, Conclusión, Detalle

CAPÍTULOS
	- TMDB:
		- Se crean automáticamente cuando se crea la colección
		- Para agregar capítulos, opciones:
			- Desde Edición, mediante "agregar capítulos"
			- Desde Desambiguar, mediante API + DD onwards
	- FA/IM:
		- PalClave(IM), TipoProducto(Capít+FA), copiarFA,	DD, DP, Confirmar, Conclusión, Detalle
		- PalClave(IM), TipoProducto(Capít+IM),				DD, DP, Confirmar, Conclusión, Detalle
	- IM, otra opción:
		- PalClave(TMDB), Desamb.(IM), TipoProd.(Cap+IM),	DD, DP, Confirmar, Conclusión, Detalle
	- En TipoProducto se ingresa:
		- La colección mediante ELC_id (se obtiene de "Detalle de Producto")
		- N° de Temporada
		- N° de Capítulo


******************** PROGRAMACIÓN ORIENTADA A PROCESOS ***********************
PALABRAS CLAVE
- Sin discriminar entre Colecciones, TV y Películas
- Consulta de API, sólo con botón verificar

DESAMBIGUAR
- Si se eligió un Capítulo cuya Colección no está en la BD, se avisa que se ingresará la Colección

TIPO DE PRODUCTO
- Para los IM/FA, es el paso donde se define la entidad

COPIAR FA
- Sólo para usuarios elegidos (apto FA)

DATOS DUROS:
- Bloquear datos de API, completar saldo a mano

DATOS PERSONALIZADOS
- Orden de opciones en campos: de más interesante a menos interesante
- Calificación Promedio: 50% Fe/Valores, 33% Entretiene, 17% Calidad filmica

CONFIRMAR
- Mismos datos que en Desambiguar, más Director
