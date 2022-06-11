"use strict";
window.addEventListener("load", async () => {
	// Variables
	let filasDatos = document.querySelectorAll("tbody .yaExistentes");
	let filasEditar = document.querySelectorAll("tbody .edicion");
	let botonesEditar = document.querySelectorAll("tbody .yaExistentes .editar");
	let botonesRecuperar = document.querySelectorAll("tbody .yaExistentes .in");
	let botonesDeshacer = document.querySelectorAll("tbody .yaExistentes .deshacer");
	let botonesGuardar = document.querySelectorAll("tbody .fa-floppy-disk");


	botonesEditar.forEach((botonEditar, i) => {
		botonEditar.addEventListener("click", () => {
			// Ocultar la fila de Datos y mostrar la fila de Edición
			filasDatos[i].classList.add("ocultar");
			filasEditar[i].classList.remove("ocultar");
		});
	});
	botonesGuardar.forEach((botonGuardar, i) => {
		botonGuardar.addEventListener("click", () => {
			// Averiguar si está inactivo --> return
			if (botonGuardar.classList.contains("inactivo")) return;
			// Submit
			console.log(i);
		});
	});
	botonesRecuperar.forEach((botonRecuperar, i) => {
		botonRecuperar.addEventListener("click", () => {
			// Averiguar si está inactivo --> return
			if (botonRecuperar.classList.contains("inactivo")) return;
			// Submit
			console.log(i);
		});
	});
	botonesDeshacer.forEach((botonDeshacer, i) => {
		botonDeshacer.addEventListener("click", () => {
			// Averiguar si está inactivo --> return
			if (botonDeshacer.classList.contains("inactivo")) return;
			// Submit
			console.log(i);
		});
	});
});
