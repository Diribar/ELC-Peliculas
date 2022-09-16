"use strict";
window.addEventListener("load", () => {
	// Variables
	let botonSubmit = document.querySelector("#submit");
	let iconos = document.querySelectorAll("#datos .iconos");
	let cantCampos = iconos.length;
	let iconosOK = document.querySelectorAll("#datos .iconos .fa-circle-check");
	let iconosError = document.querySelectorAll("#datos .iconos .fa-circle-xmark");
	// Variables del documento
	let iconosErrorDocum = document.querySelector("#datos #documento .fa-circle-xmark");
	let motivo_docum = document.querySelector("#datos #documento select#motivo_docum");

	// Si se eligió un ícono para cada caso, se activa el botón submit
	let botonSubmitActivoInactivo = () => {
		let clases = [
			...Array.from(iconosOK).map((n) => n.className),
			...Array.from(iconosError).map((n) => n.className),
		];
		let sinDecision = clases.filter((n) => n.includes("sinDecision"));
		if (sinDecision.length == cantCampos) botonSubmit.classList.remove("inactivo");
		else botonSubmit.classList.add("inactivo");
	};

	// Si se hace click sobre un ícono, se activa ese y se inactiva el otro
	for (let i = 0; i < cantCampos; i++) {
		iconosOK[i].addEventListener("click", () => {
			// Actualizar los íconos y el botón submit
			iconosOK[i].classList.remove("sinDecision");
			iconosError[i].classList.add("sinDecision");
			// Oculta los motivos de rechazo del documento
			if (i == cantCampos - 1) motivo_docum.classList.add("ocultar");
			// Actualiza el botón submit
			botonSubmitActivoInactivo();
		});
		iconosError[i].addEventListener("click", () => {
			// Actualizar los íconos OK
			iconosOK[i].classList.add("sinDecision");
			// Actualizar los íconos Error
			if (i < cantCampos - 1) iconosError[i].classList.remove("sinDecision");
			// Muestra los motivos de rechazo del documento
			else {
				motivo_docum.classList.remove("ocultar");
				if (motivo_docum.value) iconosErrorDocum.classList.remove("sinDecision");
			}
			// Actualiza el botón submit
			botonSubmitActivoInactivo();
		});
	}

	// Si cambia el 'select', se activa el ícono de error en el Documento
	motivo_docum.addEventListener("change", () => {
		// Actualizar el ícono Error de 'documento'
		iconosErrorDocum.classList.remove("sinDecision");
		// Actualiza el botón submit
		botonSubmitActivoInactivo();
	});
});
