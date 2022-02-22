window.addEventListener("load", () => {
	// Versión del producto y status
	let version = document.querySelector("#version").innerHTML;
	let existeEdicion = document.querySelector("#existeEdicion").innerHTML == "true";
	let status_creada = document.querySelector("#status_creada").innerHTML == "true";
	// Variables de íconos
	let edicion = document.querySelector("#cuerpo #comandos .fa-pencil");
	let original = document.querySelector("#cuerpo #comandos .fa-house");
	let guardar = document.querySelector("#cuerpo #comandos .fa-floppy-disk");
	let descartar = document.querySelector("#cuerpo #comandos .fa-rotate-right");
	let eliminar = document.querySelector("#cuerpo #comandos .fa-trash-can");
	// Pointer del producto
	let entidad = new URL(window.location.href).searchParams.get("entidad");
	let producto_id = new URL(window.location.href).searchParams.get("id");

	// Status inicial
	if (version == "edicion") {
		original.classList.remove("botonInactivo");
		if (!status_creada) eliminar.classList.remove("botonInactivo");
	} else if (version == "original" && existeEdicion) edicion.classList.remove("botonInactivo");

	// COMANDOS ---------------------------------------------
	// Acción si se elige 'edicion'
	edicion.addEventListener("click", () => {
		if (!edicion.classList.contains("botonInactivo")) {
			// Ir a la vista 'edicion'
			window.location.href =
				window.location.pathname + "?entidad=" + entidad + "&id=" + producto_id;
		}
	});
	// Acción si se elige 'original'
	original.addEventListener("click", () => {
		if (!original.classList.contains("botonInactivo")) {
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
		if (!guardar.classList.contains("botonInactivo")) {
			// Guardar los cambios mediante API
			console.log("guardar");
		}
	});
	// Acción si se elige 'descartar'
	descartar.addEventListener("click", () => {
		if (!descartar.classList.contains("botonInactivo")) {
			// Recargar la vista
			location.reload();
		}
	});
	// Acción si se elige 'eliminar'
});
