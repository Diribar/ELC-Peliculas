DESAMBIGUAR
- FE: detectar si una película pertenece a una colección y mostrar el resultado

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

