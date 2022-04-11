"use strict";
window.addEventListener("load", () => {
	// Variables
	let entidad = new URL(window.location.href).searchParams.get("entidad");
	let prodID = new URL(window.location.href).searchParams.get("id");
	let edicID = new URL(window.location.href).searchParams.get("edicion_id");

	// Opciones
	let aprobar = document.querySelectorAll("#contenido .fa-circle-check");
	let mostrarMotivos = document.querySelectorAll("#contenido .fa-circle-xmark");

	// Motivos para borrar
	let infoMostrar= document.querySelectorAll("#contenido .infoMostrar");
	let menuMotivos = document.querySelectorAll("#contenido .motivos");
	let motivoRechazos = document.querySelectorAll("#contenido .motivos select");
	let rechazar = document.querySelectorAll("#contenido .motivos .fa-trash-can");

	// Bloque Ingresos
	let bloqueIngrs = document.querySelector("#contenido #ingrs");
	let filasIngrs = document.querySelectorAll("#contenido #ingrs .fila");
	// Bloque Reemplazos
	let bloqueReemps = document.querySelector("#contenido #reemps");
	let filasReemps = document.querySelectorAll("#contenido #reemps .fila");

	// Otras variables
	let filas = document.querySelectorAll("#contenido .fila");
	let campoNombres = Array.from(document.querySelectorAll("#contenido .campoNombre")).map(
		(n) => n.innerHTML
	);

	// LISTENERS --------------------------------------------------------------------
	// 'Listeners' de 'Aprobar'
	for (let i = 0; i < rechazar.length; i++) {
		// Aprobar el nuevo valor
		aprobar[i].addEventListener("click", () => {
			// Ocultar la fila
			filas[i].classList.add("ocultar");
			// Actualizar el campo del producto
			let ruta = "/revision/producto/edicion/api/aprobar-campo/?entidad=";
			fetch(ruta + entidad + "&id=" + prodID + "&edicion_id=" + edicID + "&campo=" + campoNombres[i]);
			// Si está todo oculto, cartel de fin
			if (todoOculto()) console.log("fin");
		});

		// Menú inactivar
		mostrarMotivos[i].addEventListener("click", () => {
			infoMostrar[i].classList.add("ocultar");
			menuMotivos[i].classList.remove("ocultar");
		});

		// Rechazar el nuevo valor
		rechazar[i].addEventListener("click", () => {
			let motivo = motivoRechazos[i].value;
			console.log(motivo);
			if (motivo) {
				// Ocultar la fila
				filas[i].classList.add("ocultar");
				// Actualizar el campo del producto
				let ruta = "/revision/producto/edicion/api/rechazar-campo/?entidad=";
				fetch(
					ruta +
						entidad +
						"&id=" +
						prodID +
						"&edicion_id=" +
						edicID +
						"&campo=" +
						campoNombres[i] +
						"&motivo_id=" +
						motivo
				);
			}
		});
	}

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
