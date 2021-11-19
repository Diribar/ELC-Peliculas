DESAMBIGUAR
- Para las películas, buscar también en "capítulos" si ya están en BD
- Si la colección está creada, pero su capítulo NO, actualizar los capítulos

TIPO PRODUCTO
var min = 12,
    max = 100,
    select = document.getElementById('selectElementId');

for (var i = min; i<=max; i++){
    var opt = document.createElement('option');
    opt.value = i;
    opt.innerHTML = i;
    select.appendChild(opt);
}

COPIAR FA: 
- Para las películas, buscar también en "capítulos" si ya están en BD

DATOS DUROS: campos adicionales para películas: enColeccion, coleccion
- TMDB/FA: "congelados"
- IM: si la película pertenece a una colección, se elije en el momento
- Autofocus en la primera celda "no selected"

CONFIRMAR:
- Vista: mismos datos que en Desambiguar, más Director
- BE: Nueva película TMDB, en colección en BD, pero cuya parte no figura en BD:
	- Primero se actualizan las partes mediante API
	- Luego se sigue con la película

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

calificaciones e interés_en_peli
- Agregar capitulo_id