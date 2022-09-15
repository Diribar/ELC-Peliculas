"use strict";
window.addEventListener("load", () => {
	// Variables
	let botonSubmit = document.querySelector("#submit");
	let iconos = document.querySelectorAll("#datos .iconos");
	let cantCampos = iconos.length;
	let iconosOK = document.querySelectorAll("#datos .iconos .fa-circle-check");
	let iconosError = document.querySelectorAll("#datos .iconos .fa-circle-xmark");

	// Si se eligió un ícono para cada caso, se activa el botón submit
	let botonSubmitActivoInactivo = () => {
		let clases = [
			...Array.from(iconosOK).map((n) => n.className),
			...Array.from(iconosError).map((n) => n.className),
		];
		let sinDecision = clases.filter((n) => n.includes("sinDecision"));
		if (sinDecision.length == cantCampos) botonSubmit.classList.remove("inactivo")
		else botonSubmit.classList.add("inactivo")
	};

	// Si se hace click sobre un ícono, se activa ese y se inactiva el otro
	for (let i = 0; i < cantCampos; i++) {
		iconosOK[i].addEventListener("click", () => {
			// Actualizar los íconos y el botón submit
			iconosOK[i].classList.remove("sinDecision");
			iconosError[i].classList.add("sinDecision");
			botonSubmitActivoInactivo();
		});
		iconosError[i].addEventListener("click", () => {
			// Actualizar los íconos OK
			iconosOK[i].classList.add("sinDecision");
			
			// Actualizar los íconos Error			
			if (i < cantCampos - 1) iconosError[i].classList.remove("sinDecision");
			
			// Mostrar los motivos de rechazo del documento
			else {

			} 

			// Actualizar el botón submit
			botonSubmitActivoInactivo();
		});
	}
});
