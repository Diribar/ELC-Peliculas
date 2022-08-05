"use strict";
window.addEventListener("load", async () => {
	// Definir variables
	let resultado = document.querySelector("#resultadoDesamb"); // Todo el 'ul'
	let ventana = resultado.offsetWidth; // El ancho de la ventana de lo que se ve (700)
	let anchoForm = document.querySelector("#resultadoDesamb li").clientWidth; // El ancho del formulario (330)
	let cantFormsVisibles = parseInt(ventana / anchoForm); // Cant. de forms visibles en simultáneo
	let boton = document.querySelectorAll("#resultadoDesamb button");
	let indiceFocus = 0;

	// Desplazamiento por teclado
	window.addEventListener("keydown", (e) => {
		// Comandos iniciales
		let posicion = resultado.scrollLeft;
		let mover = true;
		e.preventDefault();

		// Home y End
		if (e.key == "Home") indiceFocus = 0;
		else if (e.key == "End") indiceFocus = boton.length - 1;
		// Page Up / Down
		else if (e.key == "PageUp") indiceFocus = indiceFocus - cantFormsVisibles;
		else if (e.key == "PageDown") indiceFocus = indiceFocus + cantFormsVisibles;
		// Arrows
		else if (e.key == "ArrowUp" || e.key == "ArrowLeft") indiceFocus = indiceFocus - 1;
		else if (e.key == "ArrowDown" || e.key == "ArrowRight") indiceFocus = indiceFocus + 1;
		// No hacer nada
		else mover = false;

		// Asignar el nuevo 'focus'
		if (mover) {
			indiceFocus =
				indiceFocus < 0 ? 0 : indiceFocus > boton.length - 1 ? boton.length - 1 : indiceFocus;

			// si el indice x anchoForm < posición => posición=indice x anchoForm
			if (indiceFocus * anchoForm < posicion) posicion = indiceFocus * anchoForm;

			// si el (indice+1) x anchoForm > (posición+ventana) => posición=posicion - anchoForm
			if ((indiceFocus + 1) * anchoForm > posicion + ventana)
				posicion = indiceFocus * anchoForm - anchoForm;

			boton[indiceFocus].focus();
			resultado.scrollTo(posicion, 0);
		}
	});
});
