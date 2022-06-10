"use strict";
window.addEventListener("load", async () => {
	// Variables
	let form = document.querySelector("#datos form");
	let filasDatos = document.querySelectorAll("tbody .yaExistentes");
	let filasEditar = document.querySelectorAll("tbody .edicion");
	let botonesEditar = document.querySelectorAll("tbody .yaExistentes .editar");
	let botonesGuardar = document.querySelectorAll("tbody .fa-floppy-disk");
	let numeroFila = document.querySelector("form input[name='numeroFila']");

	// Acciones si se elije botonEditar
	botonesEditar.forEach((botonEditar, i) => {
		botonEditar.addEventListener("click", () => {
			// Ocultar la fila de Datos
			filasDatos[i].classList.add("ocultar");
			// Mostrar la fila de Edición
			filasEditar[i].classList.remove("ocultar");
		});
	});

	// Acciones si se elije botonEditar
	botonesGuardar.forEach((botonGuardar, i) => {
		botonGuardar.addEventListener("click", () => {
			// Averiguar si está inactivo --> return
			if (botonGuardar.classList.contains("inactivo")) return;
			// Submit
			
		});
	});
});
