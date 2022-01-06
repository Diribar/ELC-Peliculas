PROTOCOLO DE CAPTURA
- Accesibilidad
	< 1 hora --> sólo para el usuario que lo creó
			 --> punto de partida: el horario en que lo creó
	> 1 hora --> sólo para revisores
			 --> punto de partida: el horario en que lo empezó a revisar
	Si está reservado desde hace más de 1 hora
		- Está disponible
		- Siempre que la consulta la haga otra persona, actualizar quién lo reserva y desde qué momento
		- En usuario, 
			- Agregar los campos del producto que tiene reservado
				- Entidad
				- ID del producto
				- Desde qué momento
			- Una persona no puede cambiar su "desde", pero sí el producto
			- Esos datos se borran únicamente, con alguna de estas opciones:
				- Cuando el usuario graba una revisión
				- Cuando transcurre una hora
	Desde:
		- Alta: ídem producto "creado_en"
		- Revisor: desde que se solicita el acceso
- Guardar cambios: sólo si pasó menos de 1 hora

DETALLE, MENÚ PRODUCTO, opción Editar:
- Si está "capturado" --> menú pop-up avisándolo
	- Capturado por quién (sobrenombre)
	- Cuándo se libera a más tardar
- Else --> link a la vista editar
