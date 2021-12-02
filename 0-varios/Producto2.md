QUICK SEARCH
- Agregar en el filtro:
    - "No borradas"
    - "Sólo aprobadas o agregadas por el usuario"

PROTOCOLO DE CAPTURA
- Es una función
- Se dispara cuando se quiere editar o revisar un producto
- Al querer acceder al menú de edición/revisión, si el producto:
	- No está capturado, queda capturado y se accede
	- Está capturado desde hace más de una hora, lo "rescata" y se accede
	- Está capturado desde hace menos de 1 hora,
		- Averigua por quién (sobrenombre)
		- En qué proceso está
		- Cuándo se libera a más tardar
- No se puede editar si está capturada --> Mensaje de aviso


TIMER 
- Con el tiempo regresivo
- Ubicado en el extremo superior derecho
- Misma cuenta regresiva para DD y DP

EDICION
- Protocolo de captura
- Uso del timer
- DATOS DUROS
	- SIEMPRE se guardan en un archivo de edición, para poder luego comparar
	- Modalidad para países: 
		- Párrafo para el display
		- 'Select' con todos los países, y al lado los símbolos de 'Trash' y 'Save'
- DATOS PERS para cuando todavía no fue aprobado (sólo accesible para el mismo autor que lo creó)
	- Se actualizan automáticamente en el registro creado
	- La fecha de creación se cambia a cuando se termina de editar, con aviso al usuario

REVISIÓN
- Protocolo de captura
- Uso del timer
- DATOS DUROS
	- Campos a mostrar: sólo los que tienen diferencias con la fuente (ej: API)
	- Datos a mostrar:
		- Dato del usuario
		- Dato de la fuente
		- Eventual mensaje de error a la fuente
- DATOS PERS
	- Campos a mostrar
		- Blanco y negro, si el lanzamiento es posterior a 1960
		- Categoría y subcategoría
		- Público sugerido
		- RCLV, los campos que tengan datos
		- Links --> probar los links
	- Qué campos agregar:
		- IMDB_id
		- FA_id
	- Flecha de retroceso si DD tiene diferencias
