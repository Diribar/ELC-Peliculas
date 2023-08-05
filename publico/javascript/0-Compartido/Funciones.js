"use strict";
let keyPressed = (e) => {
	// Variables
	const localName = e.target.localName;
	const type = e.target.type;

	// Previene el uso del 'enter'
	if (e.key == "Enter" && localName == "textarea") e.preventDefault();

	// Limita el uso del teclado solamente a los caracteres que nos interesan
	if ((localName == "input" && type == "text") || localName == "textarea") {
		const formato = /^[a-záéíóúüñ ,.'&$:;…"°¿?¡!+/()\d\-]+$/i;
		if (!formato.test(e.key)) e.preventDefault();
	}

	// Fin
	return;
};
let amplio = {
	restringeCaracteres: (e, respetarMinusc) => {
		if (e.target.value) {
			// Variables
			const localName = e.target.localName;
			const type = e.target.type;
			let valor = e.target.value;
			let posicCursor = e.target.selectionStart;

			// Validaciones
			if (valor.length && ((localName == "input" && type == "text") || localName == "textarea")) {
				// Limita el uso del teclado solamente a los caracteres que nos interesan
				valor = valor
					.replace(/[^a-záéíóúüñ ,.'&$:;…"°¿?¡!+/()\d\-]+$/gi, "")
					.replace(/\t/g, " ") // previene el uso de 'tab'
					.replace(/\n/g, " ") // previene el uso de 'return'
					.replace(/ +/g, " "); // previene repetición de espacios

				// El primer caracter no puede ser un espacio
				if (valor.slice(0, 1) == " ") {
					valor = valor.slice(1);
					posicCursor--;
				}

				// Primera letra en mayúscula
				if (!respetarMinusc) valor = valor.slice(0, 1).toUpperCase() + valor.slice(1);

				// Reemplaza el valor del DOM
				e.target.value = valor;
				e.target.selectionEnd = posicCursor;
			}
		}

		// Fin
		return;
	},
	validaCaracteres: (dato) => {
		let formato = /^[a-záéíóúüñ ,.'&$:;…"°¿?¡!+/()\d\-]+$/i;
		return !formato.test(dato) ? "Sólo se admiten letras del abecedario castellano" : "";
	},
};

let basico = {
	restringeCaracteres: (e, respetarMinusc) => {
		// Primeras tareas
		amplio.restringeCaracteres(e, respetarMinusc)

		// Reemplaza en la variable
		let valor = e.target.value;
		valor = valor.replace(/[^a-záéíóúüñ0-9. \-]+$/gi, "");

		// Reemplaza el valor del DOM
		e.target.value = valor;

		// Fin
		return;
	},
	validaCaracteres: (dato) => {
		let formato = /^[a-záéíóúüñ0-9. \-]+$/i;
		return !formato.test(dato) ? "Sólo se admiten letras del abecedario castellano" : "";
	},
};

let desplazamHoriz = () => {
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

let espera = (ms) => {
	return new Promise((resolve) => setTimeout(resolve, ms));
};
