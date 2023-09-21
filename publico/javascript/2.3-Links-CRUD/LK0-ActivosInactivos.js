"use strict";
window.addEventListener("load", () => {
	// Variables
	const grupo = new URL(location.href).searchParams.get("grupo");
	const inactivos = document.querySelector("#datos #filtros #activoInactivo #inactivos");
	const filasConStatusActivo = document.querySelectorAll("#datos .inactivo_false");
	const filasConStatusInActivo = document.querySelectorAll("#datos .inactivo_true");

	// Fórmulas
	if (grupo) {
		inactivos.selected = true
		for (let fila of filasConStatusInActivo) fila.classList.remove("ocultaInactivo");
		for (let fila of filasConStatusActivo) fila.classList.add("ocultaInactivo");
	}
});
