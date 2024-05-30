"use strict";
window.addEventListener("load", () => {
	// Variables
	let DOM = {
		datos: document.querySelector("#cuerpo #datos"),
		imgDerecha: document.querySelector("#imgDerecha"),
	};
	DOM = {
		...DOM,
		// Sector Cuerpo
		datosLargos: DOM.datos.querySelector("#datosLargos"),
		datosBreves: DOM.datos.querySelector("#datosBreves"),
		// Sector Imagen Derecha
		imagen: DOM.imgDerecha.querySelector("img"),
		links: DOM.imgDerecha.querySelector("#links"),
		sectorIconos: DOM.imgDerecha.querySelector("#sectorIconos"),
	};

	// Más variables
	DOM.mobile = DOM.sectorIconos.querySelector("#mobile");
	DOM.iconoDL = DOM.mobile.querySelector("#iconoDL");
	DOM.iconoDB = DOM.mobile.querySelector("#iconoDB");
	let parado = window.matchMedia("(orientation: portrait)").matches;

	// Funciones
	let muestraOculta = {
		startUp: () => {
			if (parado) {
				DOM.datosBreves.classList.add("toggle"); // oculta datosBreves

				// Si existe links, los muestra y muestra iconoDL
				if (DOM.links) {
					DOM.links.classList.remove("toggle");
					DOM.datosLargos.classList.add("toggle"); // oculta datosLargos
					DOM.iconoDL.classList.remove("toggle"); // muestra iconoDL
					DOM.iconoDB.classList.add("toggle"); // oculta iconoDB
				}
				// Si no existe links, muestra DL e ícono DB
				else {
					DOM.datosLargos.classList.remove("toggle"); // muestra datosLargos
					DOM.iconoDL.classList.add("toggle"); // oculta iconoDL
					DOM.iconoDB.classList.remove("toggle"); // muestra iconoDB
				}
			} else {
				// Datos Largos
				DOM.datosLargos.classList.remove("toggle"); // muestra datosLargos
				DOM.iconoDL.classList.add("toggle"); // oculta iconoDL

				// Datos Breves
				DOM.datosBreves.classList.add("toggle"); // oculta datosBreves
				DOM.iconoDB.classList.remove("toggle"); // muestra iconoDB

				// Links
				if (DOM.links) DOM.links.classList.remove("toggle");
			}

			// Fin
			return;
		},
		imagen: () => {
			if (parado) {
				// si se ve algo, oculta todo
				if (
					!DOM.datosLargos.className.includes("toggle") || // se ven los datos largos
					!DOM.datosBreves.className.includes("toggle") || // se ven los datos breves
					(DOM.links && !DOM.links.className.includes("toggle")) // los links existen y se ven
				) {
					if (DOM.links) DOM.links.classList.add("toggle");
					DOM.datosLargos.classList.add("toggle"); // oculta datosLargos
					DOM.sectorIconos.classList.add("toggle");
				}
				// Acciones si está todo oculto
				else {
					// Muestra el sector íconos
					DOM.sectorIconos.classList.remove("toggle");

					// Si existe links, los muestra y muestra iconoDL
					if (DOM.links) {
						DOM.links.classList.remove("toggle");
						DOM.datosLargos.classList.add("toggle"); // oculta datosLargos
						DOM.iconoDL.classList.remove("toggle");
						DOM.iconoDB.classList.add("toggle"); // oculta iconoDB
					}
					// Si no existe links, muestra DL e ícono DB, y oculta ícono DL
					else {
						DOM.datosLargos.classList.remove("toggle");
						DOM.iconoDL.classList.add("toggle");
						DOM.iconoDB.classList.remove("toggle");
					}
				}
			} else muestraOculta.startUp();

			// Oculta los datos breves
			DOM.datosBreves.classList.add("toggle");
		},
	};

	// Event listeners - Muestra datosLargos
	DOM.iconoDL.addEventListener("click", () => {
		// Datos Largos
		DOM.datosLargos.classList.remove("toggle"); // muestra datosLargos
		DOM.iconoDL.classList.add("toggle"); // oculta iconoDL

		// Datos Breves
		DOM.datosBreves.classList.add("toggle"); // oculta datosBreves
		DOM.iconoDB.classList.remove("toggle"); // muestra iconoDB

		// Links
		if (parado && DOM.links) DOM.links.classList.add("toggle");
	});

	// Event listeners - Muestra datosBreves
	DOM.iconoDB.addEventListener("click", () => {
		// Datos Largos
		DOM.datosLargos.classList.add("toggle"); // muestra datosLargos
		DOM.iconoDL.classList.remove("toggle"); // oculta iconoDL

		// Datos Breves
		DOM.datosBreves.classList.remove("toggle"); // oculta datosBreves
		DOM.iconoDB.classList.add("toggle"); // muestra iconoDB

		// Links
		if (parado && DOM.links) DOM.links.classList.add("toggle");
	});

	// Event listeners - Start-up / 'click' en la imagen
	DOM.imagen.addEventListener("click", () => {
		muestraOculta.imagen();
		return;
	});
	DOM.sectorIconos.addEventListener("click", (e) => {
		if (e.target.id == "sectorIconos") muestraOculta.imagen();
		return;
	});

	// Event listeners - Recarga la vista si se gira
	screen.orientation.addEventListener("change", () => {
		parado = window.matchMedia("(orientation: portrait)").matches;
		muestraOculta.startUp();
	});

	// Start-up
	muestraOculta.startUp();
	DOM.mobile.classList.remove("invisible");
});

// Variables
const tarea = location.pathname;
const calificar = tarea.includes("producto/calificar");
const rclvDetalle = tarea.includes("rclv/detalle");
