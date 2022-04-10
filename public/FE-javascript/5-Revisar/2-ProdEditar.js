"use strict";
window.addEventListener("load", () => {
	// Variables
	let entidad = new URL(window.location.href).searchParams.get("entidad");
	let prodID = new URL(window.location.href).searchParams.get("id");
	let edicID = new URL(window.location.href).searchParams.get("edicion_id");

	// Detectar los 'Aprobar'y 'Rechazar'
	let filas = document.querySelectorAll("#contenido .fila");
	let aprobar = document.querySelectorAll("#contenido .fa-circle-check");
	let rechazar = document.querySelectorAll("#contenido .fa-circle-xmark");
	let campoNombres = Array.from(document.querySelectorAll("#contenido .campoNombre")).map(
		(n) => n.innerHTML
	);
	// Bloques
	let bloqueIngrs = document.querySelector("#contenido #ingrs");
	let bloqueReemps = document.querySelector("#contenido #reemps");
	// Otras variables
	let filasIngrs = document.querySelectorAll("#contenido #ingrs .fila");
	let filasReemps = document.querySelectorAll("#contenido #reemps .fila");

	// LISTENERS --------------------------------------------------------------------
	// 'Listeners' de 'Aprobar'
	for (let i = 0; i < aprobar.length; i++) {
		aprobar[i].addEventListener("click", async () => {
			// Ocultar la fila
			filas[i].classList.add("ocultar");
			// Actualizar el campo del producto
			let ruta = "/revision/producto/edicion/api/aprobar-campo/?entidad=";
			let campoNombre = campoNombres[i];
			fetch(ruta + entidad + "&id=" + prodID + "&edicion_id=" + edicID + "&campo=" + campoNombre);
			// Verificar si no había ya un registro de ese usuario para ese campo en ese producto

			// Si no lo había, agregar un registro en 'edic_aprob'

			// Si está todo oculto, cartel de fin
			if (todoOculto()) console.log("fin");
		});
	}

	// 'Listeners' de 'Rechazar'

	// FUNCIONES ----------------------------------------------------------------
	let todoOculto = () => {
		// Verificar si ocultar algún bloque
		let ingrsOculto = filasIngrs.length ? verificarBloques(filasIngrs, bloqueIngrs) : true;
		let reempsOculto = filasReemps.length ? verificarBloques(filasReemps, bloqueReemps) : true;
		// Verificar si está todo oculto
		let todoOculto = ingrsOculto && reempsOculto;
		return todoOculto;
	};
	let verificarBloques = (filas, bloque) => {
		// Averiguar el status
		let ocultarBloque = Array.from(filas)
			.map((n) => n.classList)
			.map((n) => n.value)
			.every((n) => n.includes("ocultar"));
		// Ocultar el bloque si corresponde
		if (ocultarBloque) bloque.classList.add("ocultar");
		// Fin
		return ocultarBloque;
	};
});
