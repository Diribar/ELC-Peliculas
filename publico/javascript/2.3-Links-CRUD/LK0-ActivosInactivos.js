"use strict";
window.addEventListener("load", () => {
	// Variables
	let grupo = new URL(location.href).searchParams.get("grupo");
	let inactivos = document.querySelector("#datos #filtros #activoInactivo #inactivos");
	let filasConStatusActivo = document.querySelectorAll("#datos .inactivo_false");
	let filasConStatusInActivo = document.querySelectorAll("#datos .inactivo_true");

	// Fórmulas
	if (grupo) {
		inactivos.selected = true
		for (let fila of filasConStatusInActivo) fila.classList.remove("ocultaInactivo");
		for (let fila of filasConStatusActivo) fila.classList.add("ocultaInactivo");
	}
});
