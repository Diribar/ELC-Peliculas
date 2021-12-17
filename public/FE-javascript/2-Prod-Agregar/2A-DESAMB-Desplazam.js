window.addEventListener("load", async () => {
	// Definir variables
	let resultado = document.querySelector("#resultadoDesamb"); // Todo el 'ul'
	let ventana = resultado.offsetWidth; // El ancho de la ventana de lo que se ve (700)
	let anchoForm = document.querySelector("#resultadoDesamb form").clientWidth; // El ancho del formulario (330)
	let cantFormsVisibles = parseInt(ventana / anchoForm); // Cant. de forms visibles en simultáneo
	let boton = document.querySelectorAll("#resultadoDesamb button");
	let indiceFocus = 0;

	// Desplazamiento por teclado
	window.addEventListener("keydown", (e) => {
		// Comandos iniciales
		posicion = resultado.scrollLeft;
		if (e.key == "ArrowLeft" || e.key == "ArrowRight") e.preventDefault();

		// Home y End
		if (e.key == "Home") indiceFocus = 0;
		if (e.key == "End") indiceFocus = boton.length - 1;

		// Page Up / Down
		if (e.key == "PageUp") indiceFocus = indiceFocus - cantFormsVisibles;
		if (e.key == "PageDown") indiceFocus = indiceFocus + cantFormsVisibles;

		// Arrows
		if (e.key == "ArrowUp" || e.key == "ArrowLeft") indiceFocus = indiceFocus - 1;
		if (e.key == "ArrowDown" || e.key == "ArrowRight") indiceFocus = indiceFocus + 1;

		// Asignar el nuevo 'focus'
		indiceFocus =
			indiceFocus < 0 ? 0 : indiceFocus > boton.length - 1 ? boton.length - 1 : indiceFocus;

		// si el indice x anchoForm < posición => posición=indice x anchoForm
		if (indiceFocus * anchoForm < posicion) posicion = indiceFocus * anchoForm;

		// si el (indice+1) x anchoForm > (posición+ventana) => posición=posicion - anchoForm
		if ((indiceFocus + 1) * anchoForm > posicion + ventana) posicion = indiceFocus * anchoForm - anchoForm;

		boton[indiceFocus].focus();
		resultado.scrollTo(posicion, 0);
		// console.log(indiceFocus * anchoForm);
	});
});
