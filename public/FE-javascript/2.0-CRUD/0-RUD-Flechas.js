"use strict";
window.addEventListener("load", async () => {
	// Vista
	let vista = window.location.pathname;
	// Pointer del producto
	let entidad = new URL(window.location.href).searchParams.get("entidad");
	let producto_id = new URL(window.location.href).searchParams.get("id");

	// Acción si se elige 'detalle'
	if (vista != "/producto_rud/detalle/") {
		let detalle = document.querySelector("#cuerpo #flechas .fa-circle-info");
		detalle.addEventListener("click", () => {
			if (!detalle.classList.contains("inactivo")) {
				// Ir a la vista 'detalle'
				window.location.href =
					"/producto_rud/detalle/?entidad=" + entidad + "&id=" + producto_id;
			}
		});
	}

	// Acción si se elige 'edicion'
	if (vista != "/producto_rud/edicion/") {
		let edicion = document.querySelector("#cuerpo #flechas .fa-pen");
		edicion.addEventListener("click", () => {
			if (!edicion.classList.contains("inactivo")) {
				// Ir a la vista 'edicion'
				window.location.href =
					"/producto_rud/edicion/?entidad=" + entidad + "&id=" + producto_id;
			}
		});
	}

	// Acción si se elige 'links'
	if (vista != "/producto_rud/links/") {
		let links = document.querySelector("#cuerpo #flechas .fa-link");
		links.addEventListener("click", () => {
			if (!links.classList.contains("inactivo")) {
				// Ir a la vista 'links'
				window.location.href = "/producto_rud/links/?entidad=" + entidad + "&id=" + producto_id;
			}
		});
	}

});
