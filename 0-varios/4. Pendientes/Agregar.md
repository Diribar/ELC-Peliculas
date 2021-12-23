TIPO PRODUCTO
- Hacerlo
var min = 12,
    max = 100,
    select = document.getElementById('selectElementId');

for (var i = min; i<=max; i++){
    var opt = document.createElement('option');
    opt.value = i;
    opt.innerHTML = i;
    select.appendChild(opt);
}

RCLV
- Errores: revisar masc/fem en el ID de opciones_proc y opciones_rol

DESAMBIGUAR
- Si se agregó un capítulo a una colección ya existente, avisarlo en DesambForm con la opción de 'check'

*******************************************************************************

COPIAR FA: 
- Para las películas, buscar también en "capítulos" si ya están en BD
