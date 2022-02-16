OTROS
- Resolver 'avanzar' de Datos Pers

PENDIENTES
- Vista
	- Cuerpo:
		- Cartel:
			- Por favor intentá incluir por lo menos un link gratuito
			- Sé muy cuidadoso de incluir un link que respete los derechos de autor
		- Tabla Títulos: Proveedor, Link, Tipo, Fecha Prov, Gratuito + Confirmar
		- Tabla Contenido: Registros en BD + Input con links nuevos
		- Links a: Detalle, Editar
	- Ayudas:
		- Para cada título de la tabla
	- Programación:
		- Proveedor: (select)
			- ¿Proveedor en la lista 'negra'? --> cartel de aviso. Mensaje:
					"No nos consta que el proveedor xxx respete los derechos de autor.
					Por esa razón, no aceptamos links de ese proveedor.
					Si querés hacernos un comentario, podés hacer click 'aquí'".
			- En función del link se intenta detectar el proveedor --> selected
			- Si no se detecta --> sin selected

CRITERIOS
- Puede haber más de un link por proveedor (ej: YT)
- 