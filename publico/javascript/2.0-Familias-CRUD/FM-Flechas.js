"use strict";
window.addEventListener("load", async () => {
	// Vista
	let vista = window.location.pathname;
	// Pointer del producto
	let entidad = new URL(window.location.href).searchParams.get("entidad");
	let entID = new URL(window.location.href).searchParams.get("id");

	// Acción si se elige 'detalle'
	if (vista != "/producto/detalle/") {
		let detalle = document.querySelector("#cuerpo .flechas .fa-circle-info");
		detalle.addEventListener("click", () => {
			if (!detalle.classList.contains("inactivo")) {
				// Va a la vista 'detalle'
				window.location.href =
					"/producto/detalle/?entidad=" + entidad + "&id=" + entID;
			}
		});
	}

	// Acción si se elige 'edicion'
	if (vista != "/producto/edicion/") {
		let edicion = document.querySelector("#cuerpo .flechas .fa-pen");
		edicion.addEventListener("click", () => {
			if (!edicion.classList.contains("inactivo")) {
				// Va a la vista 'edicion'
				window.location.href =
					"/producto/edicion/?entidad=" + entidad + "&id=" + entID;
			}
		});
	}

	// Acción si se elige 'links'
	if (vista != "/links/abm/") {
		let links = document.querySelector("#cuerpo .flechas .fa-link");
		links.addEventListener("click", () => {
			if (!links.classList.contains("inactivo")) {
				// Va a la vista 'links'
				window.location.href = "/links/abm/?entidad=" + entidad + "&id=" + entID;
			}
		});
	}

});
