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
	let infoMostrar = document.querySelectorAll("#contenido .infoMostrar");
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
		aprobar[i].addEventListener("click", async () => {
			// Ocultar la fila
			filas[i].classList.add("ocultar");
			// Actualizar el campo del producto
			let ruta = "/revision/producto/edicion/api/editar-campo/?aprob=true&entidad=";
			let quedanCampos = await fetch(
				ruta + entidad + "&id=" + prodID + "&edicion_id=" + edicID + "&campo=" + campoNombres[i]
			).then((n) => n.json());
			// Revisar el status
			revisarStatus(quedanCampos);
		});

		// Menú inactivar
		mostrarMotivos[i].addEventListener("click", () => {
			infoMostrar[i].classList.add("ocultar");
			menuMotivos[i].classList.remove("ocultar");
		});

		// Rechazar el nuevo valor
		rechazar[i].addEventListener("click", async () => {
			let motivo = motivoRechazos[i].value;
			if (motivo) {
				// Ocultar la fila
				filas[i].classList.add("ocultar");
				// Actualizar el campo del producto
				let ruta = "/revision/producto/edicion/api/editar-campo/?aprob=false&entidad=";
				let quedanCampos = await fetch(
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
				).then((n) => n.json());
				// Revisar el status
				revisarStatus(quedanCampos);
			}
		});
	}

	// FUNCIONES ----------------------------------------------------------------
	let revisarStatus = (quedanCampos) => {
		// Verificar si ocultar algún bloque
		let ingrsOculto = filasIngrs.length ? verificarBloques(filasIngrs, bloqueIngrs) : true;
		let reempsOculto = filasReemps.length ? verificarBloques(filasReemps, bloqueReemps) : true;
		// Averiguar si está todo oculto
		let todoOculto = ingrsOculto && reempsOculto;
		// Si hay inconsistencias, recargar la página
		if (todoOculto == quedanCampos) window.location.reload();
		// Si no se procesar todas las ediciones, terminar la rutina
		if (!todoOculto) return
		console.log("fin");
		// Averiguar si hay errores en el original
		let ruta = "/revision/producto/edicion/api/terminar/?entidad=";
		await fetch(ruta + entidad + "&id=" + prodID).then((n) => n.json());

		// Si no hay errores en el original y el status es 'alta_aprobada', cambiarle el status a 'aprobada'

		// Redirigir al 'Tablero de Control'

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
