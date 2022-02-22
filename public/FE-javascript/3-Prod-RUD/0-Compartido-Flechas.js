window.addEventListener("load", () => {
	// Pointer del producto
	let entidad = new URL(window.location.href).searchParams.get("entidad");
	let producto_id = new URL(window.location.href).searchParams.get("id");
	// Vista
	let vista = window.location.pathname;

	// Acción si se elige 'detalle'
	if (vista != "/producto/detalle/") {
		let detalle = document.querySelector("#cuerpo #flechas .fa-circle-info");
		detalle.addEventListener("click", () => {
			if (!detalle.classList.contains("botonInactivado")) {
				// Ir a la vista 'detalle'
				window.location.href =
					"/producto/detalle/?entidad=" + entidad + "&id=" + producto_id;
			}
		});
	}

	// Acción si se elige 'edicion'
	if (vista != "/producto/edicion/") {
		let edicion = document.querySelector("#cuerpo #flechas .fa-pen");
		edicion.addEventListener("click", () => {
			if (!edicion.classList.contains("botonInactivado")) {
				// Ir a la vista 'edicion'
				window.location.href =
					"/producto/edicion/?entidad=" + entidad + "&id=" + producto_id;
			}
		});
	}

	// Acción si se elige 'links'
	if (vista != "/producto/links/") {
		let links = document.querySelector("#cuerpo #flechas .fa-globe");
		links.addEventListener("click", () => {
			if (!links.classList.contains("botonInactivado")) {
				// Ir a la vista 'links'
				window.location.href = "/producto/links/?entidad=" + entidad + "&id=" + producto_id;
			}
		});
	}

	// Acción si se elige 'colección/capítulo'
	if (entidad != "peliculas") {
		// Obtener el DOM
		let colCapDOM = document.querySelector("#cuerpo #flechas .fa-layer-group");
		// Obtener la colección o el capítulo
		let ruta = "/producto/api/obtener-col-cap/?entidad=";
		colCapDOM.addEventListener("click", async () => {
			// Obtener el 'colCapID'
			let colCapID = await fetch(ruta + entidad + "&id=" + producto_id).then((n) => n.json());
			// Alternar entre colección y capítulo
			window.location.href =
				vista +
				"?entidad=" +
				(entidad == "colecciones" ? "capitulos" : "colecciones") +
				"&id=" +
				colCapID;
		});
	}
});
