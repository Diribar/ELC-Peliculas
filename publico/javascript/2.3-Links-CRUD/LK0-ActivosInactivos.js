"use strict";
window.addEventListener("load", () => {
	// Variables
	let botonActivo = document.querySelector("#datos #filtros #activo");
	let botonInactivo = document.querySelector("#datos #filtros #inactivo");
	let filasConStatusActivo = document.querySelectorAll("#datos .inactivo_false");
	let filasConStatusInActivo = document.querySelectorAll("#datos .inactivo_true");
	let pasivos = new URL(window.location.href).searchParams.get("pasivos");

	// Fórmulas
	let mostrarPasivos = () => {
		filasConStatusInActivo.forEach((fila) => {
			fila.classList.remove("ocultaInactivo");
		});
		filasConStatusActivo.forEach((fila) => {
			fila.classList.add("ocultaInactivo");
		});
		botonInactivo.classList.remove("traslucido");
		botonActivo.classList.add("traslucido");
		return;
	};

	// AddEventListeners
	// Activos
	botonActivo.addEventListener("click", () => {
		if (botonActivo.innerHTML.startsWith("*")) {
			let ruta = window.location.href;
			ruta = ruta.slice(0, ruta.indexOf("&pasivos"));			
			window.location.href = ruta;
			return
		}
		filasConStatusActivo.forEach((fila) => {
			fila.classList.remove("ocultaInactivo");
		});
		filasConStatusInActivo.forEach((fila) => {
			fila.classList.add("ocultaInactivo");
		});
		botonActivo.classList.remove("traslucido");
		botonInactivo.classList.add("traslucido");
	});
	// Inactivos
	botonInactivo.addEventListener("click", () => {
		if (botonInactivo.innerHTML.startsWith("*")) {
			window.location.href = window.location.href + (pasivos === null ? "&pasivos" : "");
			return
		}
		mostrarPasivos();
	});
	// Startup
	if (pasivos !== null) mostrarPasivos();

});
