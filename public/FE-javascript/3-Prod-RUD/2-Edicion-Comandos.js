window.addEventListener("load", async () => {
	// Versión del producto y status
	// let version = new URL(window.location.href).searchParams.get("version");
	// let existeEdicion = document.querySelector("#existeEdicion").innerHTML == "true";
	// let status_creada = document.querySelector("#status_creada").innerHTML == "true";

	// Variables de íconos
	let edicSession = document.querySelector("#cuerpo #comandos .fa-pencil");
	let edicGuardada = document.querySelector("#cuerpo #comandos .fa-rotate-right");
	let original = document.querySelector("#cuerpo #comandos .fa-house");
	let guardar = document.querySelector("#cuerpo #comandos .fa-floppy-disk");
	let eliminar = document.querySelector("#cuerpo #comandos .fa-trash-can");

	// Pointer del producto
	let entidad = new URL(window.location.href).searchParams.get("entidad");
	let prodID = new URL(window.location.href).searchParams.get("id");

	// Versiones existentes
	let ruta = "/producto/edicion/api/obtener-versiones/";
	let [verOriginal, verEdicG, VerEdicS] = await fetch(
		ruta +
		"?entidad=" +
		entidad+
		+
		prodID
	).then((n) => n.json());

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
				window.location.pathname + "?entidad=" + entidad + "&id=" + prodID;
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
				prodID +
				"&version=original";
		}
	});
	// Acción si se elige 'guardar'
	guardar.addEventListener("click", (e) => {
		if (guardar.classList.contains("botonInactivo")) {
			e.preventDefault();
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
	// eliminar.addEventListener("click", (e) => {
	// 	if (eliminar.classList.contains("botonInactivo")) {
	// 		e.preventDefault();
	// 	}
	// });
});
