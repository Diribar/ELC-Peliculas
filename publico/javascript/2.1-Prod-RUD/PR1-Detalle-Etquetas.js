"use strict";
window.addEventListener("load", () => {
	// Variables
	let etiquetas = document.querySelectorAll("#etiquetas p");
	let datosParcial = document.querySelectorAll("#datosDetalle .datosParcial");

	// Eventos
	datosParcial.forEach((datoParcial, datoClick) => {
		etiquetas[datoClick].addEventListener("click", () => {
			for (let datoBarrido = 0; datoBarrido < datosParcial.length; datoBarrido++)
				if (datoClick != datoBarrido) datosParcial[datoBarrido].style.display = "none";
				else datosParcial[datoBarrido].style.display = "flex";
		});
	});
});
