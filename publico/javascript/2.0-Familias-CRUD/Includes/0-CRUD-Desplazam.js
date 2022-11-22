"use strict";
window.addEventListener("load", async () => {
	let funcion = () => {
		console.log("3-Desplazam.");

		// Definir variables
		let izquierda = document.querySelector(".fa-caret-left");
		let derecha = document.querySelector(".fa-caret-right");
		let resultados = document.querySelector("#listado");
		let resultadosAnchoVisible = resultados.offsetWidth;
		let botones = document.querySelectorAll("#listado button");
		let botonesAncho = document.querySelector("#listado li").clientWidth;
		let cantBotonesVisibles = parseInt(resultadosAnchoVisible / botonesAncho);
		let indiceFocus = 0;
		let posicion = 0;

		// Fórmulas
		let ocultaIconosMovim = () => {
			posicion == 0 ? izquierda.classList.add("inactivo") : izquierda.classList.remove("inactivo");
			posicion >= (botones.length - cantBotonesVisibles) * botonesAncho
				? derecha.classList.add("inactivo")
				: derecha.classList.remove("inactivo");
		};
		let movimientos = () => {
			// Mantiene el foco dentro de valores aceptables
			indiceFocus = Math.max(0, indiceFocus);
			indiceFocus = Math.min(indiceFocus, botones.length - 1);

			// Mantiene la posicion dentro de valores aceptables
			posicion = Math.min(posicion, indiceFocus * botonesAncho);
			posicion = Math.max(0, posicion, (indiceFocus - 1) * botonesAncho);

			// Foco en el botón y mueve el 'ul'
			botones[indiceFocus].focus();
			resultados.scrollTo(posicion, 0);

			// Fin
			ocultaIconosMovim();
			return;
		};

		// Desplazamiento por teclado
		window.addEventListener("keydown", (e) => {
			// Anular desplazamientos naturales
			let teclasDesplazamiento = [
				"Home",
				"End",
				"PageUp",
				"PageDown",
				"ArrowUp",
				"ArrowDown",
				"ArrowLeft",
				"ArrowRight",
				"Tab",
			];
			if (teclasDesplazamiento.includes(e.key)) e.preventDefault();
			// Si fue otra tecla, termina el proceso
			else return;

			// Home y End
			if (e.key == "Home") indiceFocus = 0;
			else if (e.key == "End") indiceFocus = botones.length - 1;
			// Page Up / Down
			else if (e.key == "PageUp" || (e.key == "Tab" && e.shiftKey)) {
				indiceFocus = indiceFocus - cantBotonesVisibles;
				posicion = resultados.scrollLeft - resultadosAnchoVisible;
			} else if (e.key == "PageDown" || (e.key == "Tab" && !e.shiftKey)) {
				indiceFocus = indiceFocus + cantBotonesVisibles;
				posicion = resultados.scrollLeft + resultadosAnchoVisible;
			}
			// Arrows
			else if (e.key == "ArrowUp" || e.key == "ArrowLeft") indiceFocus = indiceFocus - 1;
			else if (e.key == "ArrowDown" || e.key == "ArrowRight") indiceFocus = indiceFocus + 1;

			// Fin
			movimientos();
		});
		// Desplazamiento por íconos
		izquierda.addEventListener("click", () => {
			if (!izquierda.className.includes("inactivo")) {
				indiceFocus = indiceFocus - cantBotonesVisibles;
				posicion = resultados.scrollLeft - resultadosAnchoVisible;
				// Fin
				movimientos(indiceFocus);
			} else botones[indiceFocus].focus();
		});
		derecha.addEventListener("click", () => {
			if (!derecha.className.includes("inactivo")) {
				indiceFocus = indiceFocus + cantBotonesVisibles;
				posicion = resultados.scrollLeft + resultadosAnchoVisible;
				// Fin
				movimientos(indiceFocus);
			} else botones[indiceFocus].focus();
		});

		// Statup
		ocultaIconosMovim();
	};
	
	setTimeout(funcion,5000)
});
