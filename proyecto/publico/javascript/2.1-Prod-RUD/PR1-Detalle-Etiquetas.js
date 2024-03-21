"use strict";
window.addEventListener("load", () => {
	// Variables
	let etiquetas = document.querySelectorAll("#etiquetas p");
	let datosParcial = document.querySelectorAll("#datosInfo .datosParcial");

	// Eventos
	for (let datoClick = 0; datoClick < datosParcial.length; datoClick++) {
		// Evento por solapa
		etiquetas[datoClick].addEventListener("click", () => {
			for (let datoBarrido = 0; datoBarrido < datosParcial.length; datoBarrido++){
				// Muestra u
				if (datoClick != datoBarrido) {
					// Oculta información
					datosParcial[datoBarrido].style.display = "none";
					// Devuelva la etiqueta a su status original
					etiquetas[datoBarrido].classList.remove("resaltar")
				} else {
					// Muestra información
					datosParcial[datoBarrido].style.display = "flex";
					// Destaca la etiqueta
					etiquetas[datoBarrido].classList.add("resaltar")
				}
			}

		});
	}
});
