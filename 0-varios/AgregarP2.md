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

DATOS DUROS: 
- Cuando está vacío, permitir elegir más de 1 país

DATOS PERSONALIZADOS
- Si la película o serie de TV informa que el producto existe en castellano, llevar ese dato a DP

CONFIRMAR Vista:
    - Mismos datos que en Desambiguar, más Director y Actor
    - Leyendas:
        - Estamos listos para agregar el registro a nuestra Base de Datos
        - Una vez que confirmes la operación no hay "marcha atrás" (question symbol)
            El registro quedará para siempre en nuestra BD y tu usuario asociado a él.
            Sólo vos podrás ver el registro hasta que un administrador de nuestra BD lo apruebe.
        - Damos una puntuación por la calidad y responsabilidad de la información aportada (question symbol)
            Que la película/colección esté alineada con nuestro perfil (2 puntos).
            La precisión de la información manual aportada (2 puntos).
            Los links de trailer (1 punto) y de película/colección (2 puntos), y que respeten los derechos de autor.
            El puntaje nos permite evaluar al usuario como potencial Revisor de Altas de otros usuarios.

CONCLUSION
    - Nuestro equipo de Administradores revisará los datos ingresados. (question symbol)
        El resultado puede ser:
            Aprobado, con o sin edición a cargo del administrador.
            Desaprobado, en caso de que la película no esté alineada con nuestro perfil.
        Enviamos un único mail diario con el resultado de todos los registros revisados el día anterior.
        Si el registro queda aprobado, quedará accesible para todo el público.
    - Mientras tanto, podés ver los datos agregados y editarlos si corresponde.
    - Ícono: --> Lupa