"use strict";
window.addEventListener("load", () => {
	// Variables
	let botonSubmit=document.querySelector("#submit")
	let iconos = document.querySelectorAll(".iconos input");
	let campos = [...new Set(Array.from(iconos).map((n) => n.name))];
	let iconosOK = document.querySelectorAll(".iconos .fa-circle-check");
	let iconosError = document.querySelectorAll(".iconos .fa-circle-xmark");
	// console.log(campos, iconosOK.length, iconosError.length);

	// Si se eligió un ícono para cada caso, se activa el botón submit
	let botonSubmitActivoInactivo = () => {
		let clases = [
			...Array.from(iconosOK).map((n) => n.className),
			...Array.from(iconosError).map((n) => n.className),
		];
		let opacity = clases.filter((n) => n.includes("opacity"));
		if (opacity.length == campos.length) botonSubmit.classList.remove("inactivo")
	};

	// Si se hace click sobre un ícono, se activa ese y se inactiva el otro
	campos.forEach((campo, i) => {
		iconosOK[i].addEventListener("click", () => {
			iconosOK[i].classList.remove("opacity");
			iconosError[i].classList.add("opacity");
			botonSubmitActivoInactivo();
		});
		iconosError[i].addEventListener("click", () => {
			iconosError[i].classList.remove("opacity");
			iconosOK[i].classList.add("opacity");
			botonSubmitActivoInactivo();
		});
	});

	// Si se hace click sobre el ícono 'negativo' del avatar, se muestran los motivos
	
});
