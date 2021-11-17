DESAMBIGUAR: 
- FE: 
	- No puede informar en la primera vista que la película pertenece a una colección, porque con SEARCH no se consigue ese dato
	- No permite elegir una pelicula cuya colección no está en la BD
	- Informa en la vista el nombre de la colección
- BE: 
	- Informa el error si se eligió una película cuya colección no está en la BD
	- Nueva película TMDB, en colección en BD, pero cuya parte no figura en BD:
		- Primero se actualizan las partes mediante API
		- Luego se sigue con la película

COPIAR FA: si la película pertenece a una colección, se elije en el momento

DATOS DUROS: campos adicionales para películas: enColeccion, coleccion
- TMDB/FA: "congelados"
- IM: si la película pertenece a una colección, se elije en el momento

CONFIRMAR: mismos datos que en Desambiguar, más Director

AGREGAR PRODUCTOS
- Estandarización de títulos y formatos en Agregar
- Tablas a agregar:
	- Productora
	- Relación Productora-Producto
- Bloquear las flechas de retroceso y avance del navegador

GENERAL
- Usuario: mover el archivo avatar a la carpeta definitiva (línea 231)
	./public/imagenes/1-Usuarios
	./public/imagenes/9-Provisorio
