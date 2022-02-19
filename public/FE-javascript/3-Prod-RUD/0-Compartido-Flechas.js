window.addEventListener("load", async () => {
	// Variables de íconos
	let detalle = document.querySelector("#cuerpo #flechas .fa-circle-info");
	let edicion = document.querySelector("#cuerpo #flechas .fa-pen");
	let links = document.querySelector("#cuerpo #flechas .fa-globe");
	// Pointer del producto
	let entidad = new URL(window.location.href).searchParams.get("entidad");
	let producto_id = new URL(window.location.href).searchParams.get("id");

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

	// Acción si se elige 'edicion'
	edicion.addEventListener("click", () => {
		if (!edicion.classList.contains("botonInactivado")) {
			// Ir a la vista 'edicion'
			window.location.href =
				"/producto/edicion/?entidad=" +
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

})