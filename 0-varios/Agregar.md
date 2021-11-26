DESAMBIGUAR
- FE: detectar si una película pertenece a una colección

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
    - Campo vacío
        - si no se sabe qué contestar, poné "Desconocido"
        - "Documental" para actores
    - Letras castellano	-> buscá qué letra puede ser extraña al idioma castellano

DATOS PERSONALIZADOS
- Si la película o serie de TV informa que el producto existe en castellano, llevar ese dato a DP

CONFIRMAR:
- Vista: mismos datos que en Desambiguar, más Director

AGREGAR PRODUCTOS
- Bloquear las flechas de retroceso y avance del navegador
- Estandarización de títulos y formatos en Agregar

PERSONAJE HISTÓRICO
- Miembro de la Iglesia Católica al fallecer
    SI/NO
- En proceso de canonización (comenzado o terminado)
    SI/NO
- Estado eclesial en la Iglesia Católica
    laico, laico casado, religioso consagrado

RCLV
- Simplificar: quitar el "verificar", y reemplazar por botonSinLink
- Agregar link a wikipedia en función del nombre
    https://es.wikipedia.org/wiki/Rosa de Lima