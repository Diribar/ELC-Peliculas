window.addEventListener("load", () => {
	// Versión del producto y status
	let version = document.querySelector("#version").innerHTML;
	let existeEdicion = document.querySelector("#existeEdicion").innerHTML == "true";
	let status_creada = document.querySelector("#status_creada").innerHTML == "true";
	// Variables de íconos
	let detalle = document.querySelector("#cuerpo #flechas .fa-circle-info");
	let links = document.querySelector("#cuerpo #flechas .fa-film");
	let original = document.querySelector("#cuerpo #comandos .fa-home");
	let edicion = document.querySelector("#cuerpo #comandos .fa-pencil-alt");
	let guardar = document.querySelector("#cuerpo #comandos .fa-save");
	let descartar = document.querySelector("#cuerpo #comandos .fa-rotate-right");
	let eliminar = document.querySelector("#cuerpo #comandos .fa-trash-alt");
	// Pointer del producto
	let entidad = new URL(window.location.href).searchParams.get("entidad");
	let producto_id = new URL(window.location.href).searchParams.get("id");

	// Status inicial
	if (version == "edicion") {
		original.classList.remove("botonInactivado");
		if (!status_creada) eliminar.classList.remove("botonInactivado");
	} else if (version == "original" && existeEdicion) edicion.classList.remove("botonInactivado");

	// COMANDOS ---------------------------------------------
	// Acción si se elige 'edicion'
	edicion.addEventListener("click", () => {
		if (!edicion.classList.contains("botonInactivado")) {
			// Ir a la vista 'edicion'
			window.location.href =
				window.location.pathname + "?entidad=" + entidad + "&id=" + producto_id;
		}
	});
	// Acción si se elige 'original'
	original.addEventListener("click", () => {
		if (!original.classList.contains("botonInactivado")) {
			// Ir a la vista 'original'
			window.location.href =
				window.location.pathname +
				"?entidad=" +
				entidad +
				"&id=" +
				producto_id +
				"&verOriginal=true";
		}
	});
	// Acción si se elige 'guardar'
	guardar.addEventListener("click", () => {
		if (!guardar.classList.contains("botonInactivado")) {
			// Guardar los cambios mediante API
			console.log("guardar");
		}
	});
	// Acción si se elige 'descartar'
	descartar.addEventListener("click", () => {
		if (!descartar.classList.contains("botonInactivado")) {
			// Recargar la vista
			location.reload();
		}
	});

	// FLECHAS ---------------------------------------------
	// Acción si se elige 'detalle'
	detalle.addEventListener("click", () => {
		if (!detalle.classList.contains("botonInactivado")) {
			// Ir a la vista 'detalle'
			window.location.href =
				"/producto/detalle/?entidad=" +
				entidad +
				"&id=" +
				producto_id;
		}
	});
	// Acción si se elige 'links'
	links.addEventListener("click", () => {
		if (!links.classList.contains("botonInactivado")) {
			// Ir a la vista 'links'
			window.location.href =
				"/producto/links/?entidad=" +
				entidad +
				"&id=" +
				producto_id;
		}
	});

});
