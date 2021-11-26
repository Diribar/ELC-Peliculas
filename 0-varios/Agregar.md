CALIFICACIONES
- Agregar 'moderado' entre Mucho y Poco

DESAMBIGUAR
- Form: para las películas, buscar también en "capítulos" si ya están en BD
- Guardar: para una película, si la colección ya está creada pero su capítulo NO, actualizar los capítulos

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

DATOS DUROS: 
- Autofocus en la primera celda "no selected"
- En los errores, poner ayudas:
    - Campo vacío 		-> si no se sabe qué contestar, poné "Desconocido"
    - Letras castellano	-> buscá qué letra puede ser extraña al idioma castellano

DATOS PERSONALIZADOS
- Si la película o serie de TV informa que el producto existe en castellano, llevar ese dato a DP

CONFIRMAR:
- Vista: mismos datos que en Desambiguar, más Director

AGREGAR PRODUCTOS
- Bloquear las flechas de retroceso y avance del navegador
- Estandarización de títulos y formatos en Agregar

PERSONAJE HISTÓRICO
- En proceso de canonización en la Iglesia Católica (comenzado o terminado)
- Estado eclesial
    laico, laico casado, religioso consagrado, sacerdote

RCLV
- Simplificar: quitar el "verificar", y reemplazar por botonSinLink
- Agregar link a wikipedia en función del nombre
    https://es.wikipedia.org/wiki/Rosa de Lima