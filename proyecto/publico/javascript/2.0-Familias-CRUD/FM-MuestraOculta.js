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
				// Datos Largos
				if (calificar || rclvDetalle) {
					DOM.datosLargos.classList.remove("toggle"); // muestra datosLargos
					DOM.iconoDL.classList.add("toggle"); // oculta iconoDL
				} else {
					DOM.datosLargos.classList.add("toggle"); // oculta datosLargos
					DOM.iconoDL.classList.remove("toggle"); // muestra iconoDL
				}

				// Datos Breves
				DOM.datosBreves.classList.add("toggle"); // oculta datosBreves
				calificar || rclvDetalle
					? DOM.iconoDB.classList.remove("toggle") // muestra iconoDB
					: DOM.iconoDB.classList.add("toggle"); // oculta iconoDB

				// Links
				if (DOM.links) DOM.links.classList.toggle("toggle");
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
				console.log(!DOM.datosLargos.className.includes("toggle"));
				// Datos Largos - si alguno está visible, oculta datos largos
				!DOM.datosLargos.className.includes("toggle") || !DOM.datosBreves.className.includes("toggle")
					? DOM.datosLargos.classList.add("toggle") // oculta datosLargos
					: DOM.datosLargos.classList.remove("toggle");

				// Botón Datos Largos
				DOM.iconoDL.classList.add("toggle"); // oculta los íconos

				// Datos Breves - lo oculta siempre
				DOM.datosBreves.classList.add("toggle");

				// Botón Datos Breves - si DL está oculto, lo oculta
				DOM.datosLargos.className.includes("toggle")
					? DOM.iconoDB.classList.add("toggle") // oculta iconoDB
					: DOM.iconoDB.classList.remove("toggle"); // muestra iconoDB

				// Sector Íconos - si DL está oculto, lo oculta
				DOM.datosLargos.className.includes("toggle")
					? DOM.sectorIconos.classList.add("ocultar") // oculta iconoDB
					: DOM.sectorIconos.classList.remove("ocultar"); // muestra iconoDB

				// Links
				if (DOM.links) DOM.links.classList.toggle("toggle");
			} else muestraOculta.startUp();
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
		// Fin
		return;
	});
	DOM.sectorIconos.addEventListener("click", () => {
		muestraOculta.imagen();
		// Fin
		return;
	});

	// Event listeners - Recarga la vista si se gira
	screen.orientation.addEventListener("change", () => {
		parado = window.matchMedia("(orientation: portrait)").matches;
		muestraOculta.startUp();
	});

	// Start-up
	// return;
	muestraOculta.startUp();
	DOM.mobile.classList.remove("invisible");
});

// Variables
const tarea = location.pathname;
const calificar = tarea.includes("producto/calificar");
const rclvDetalle = tarea.includes("rclv/detalle");
