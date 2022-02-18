OTROS
- Resolver 'avanzar' de Datos Pers

PENDIENTES
- Para colecciones, sólo links de Trailer
	- BD en MySQL y Modelos:
		- Tabla 'links_prod': quitar campo y vínculo de 'coleccion_id'
		- Tabla 'colecciones': quitar vínculo a 'links_prod'
- BD, tabla links_prov:
	- Un link 'post para películas'
	- Un link 'post para trailers'
- Vista:
	- Cuadro para 'ya existentes': 
		- Alto mínimo: libre
		- Alto máximo: 4 filas
		- Una clase para Trailer y otra para Películas
		- Si no hay links --> cartel informándolo
	- Cuadro para 'nuevo'
		- Form + 'links a otros portales'
		- YouTube: un botón para películas y otro para trailer
	- Sección para botones:
		- Pack1: Detalle, Editar
		- Sólo para colecciones:
			- Pack2: Temporada anterior, Temporada siguiente		
			- Pack3: Capítulo anterior, Capítulo siguiente
- Programación FE:
	- Cuadro para 'ya existentes'
		- Mostrar sólo Trailer o Películas, con botón para elegir
	- Links a Detalle, Editar
	- Eliminar
	- Submit

CRITERIOS
- Puede haber más de un link por proveedor (ej: YT)
- 