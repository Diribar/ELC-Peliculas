"use strict";
window.addEventListener("load", () => {
	// Variables
	let form = document.querySelector("form#subCuerpo");
	let texto = document.querySelector("form #texto");
	let botonSubmit = document.querySelector("form #submit");
	// Íconos
	let iconos = document.querySelectorAll("#datos .aprobRech");
	let cantCampos = iconos.length;
	let iconosOK = document.querySelectorAll("#datos .aprobRech .fa-circle-check");
	let iconosError = document.querySelectorAll("#datos .aprobRech .fa-circle-xmark");
	// Variables del documento
	let motivo_docum = document.querySelector("#datos select#motivo_docum");

	// Si se eligió un ícono para cada caso, se activa el botón submit
	let botonSubmitActivoInactivo = () => {
		let clases = [
			...Array.from(iconosOK).map((n) => n.className),
			...Array.from(iconosError).map((n) => n.className),
		];
		let sinDecision = clases.filter((n) => n.includes("sinDecision"));
		if (sinDecision.length == cantCampos || (motivo_docum.value && motivo_docum.value != "0"))
			botonSubmit.classList.remove("inactivo");
		else botonSubmit.classList.add("inactivo");
	};

	// Si se hace click sobre un ícono, se activa ese y se inactiva el otro
	for (let i = 0; i < cantCampos; i++) {
		iconosOK[i].addEventListener("click", () => {
			// Actualizar los íconos y el botón submit
			iconosOK[i].classList.remove("sinDecision");
			iconosError[i].classList.add("sinDecision");
			iconos[i].classList.remove("bordeRojo");
			botonSubmitActivoInactivo();
		});
		iconosError[i].addEventListener("click", () => {
			// Actualizar los íconos y el botón submit
			iconosOK[i].classList.add("sinDecision");
			iconosError[i].classList.remove("sinDecision");
			iconos[i].classList.remove("bordeRojo");
			botonSubmitActivoInactivo();
		});
	}

	// Si cambia el 'select', se activa el ícono de error en el Documento
	motivo_docum.addEventListener("change", () => {
		// Muestra u oculta las opciones de texto
		if (motivo_docum.value == "0") texto.classList.remove("invisible");
		else texto.classList.add("invisible");
		// Actualiza el botón submit
		botonSubmitActivoInactivo();
	});

	// Frenar el submit si el botonSubmit está inactivo
	form.addEventListener("submit", (e) => {
		if (botonSubmit.className.includes("inactivo")) {
			e.preventDefault();
			if (motivo_docum.value == "0")
				for (let i = 0; i < cantCampos; i++) {
					if (
						iconosOK[i].className.includes("sinDecision") &&
						iconosError[i].className.includes("sinDecision")
					)
						iconos[i].classList.add("bordeRojo");
				}
		}
	});
});
