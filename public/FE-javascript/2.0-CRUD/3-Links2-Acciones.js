"use strict";
window.addEventListener("load", async () => {
	// Variables
	let filasDatos = document.querySelectorAll("tbody .yaExistentes");
	let filasEditar = document.querySelectorAll("tbody .edicion");
	let inputs = document.querySelectorAll("tbody .input");
	let columnas = inputs.length / (filasEditar.length + 1);
	let prodEntidad = new URL(window.location.href).searchParams.get("entidad");
	let prodID = new URL(window.location.href).searchParams.get("id");
	// Botones
	let botonesEditar = document.querySelectorAll("tbody .yaExistentes .editar");
	let botonesRecuperar = document.querySelectorAll("tbody .yaExistentes .in");
	let botonesDeshacer = document.querySelectorAll("tbody .yaExistentes .deshacer");
	let botonesGuardar = document.querySelectorAll("tbody .fa-floppy-disk");

	// Editar - Hecho
	botonesEditar.forEach((botonEditar, fila) => {
		botonEditar.addEventListener("click", () => {
			// Ocultar la fila de Datos y mostrar la fila de Edición
			filasDatos[fila].classList.add("ocultar");
			filasEditar[fila].classList.remove("ocultar");
		});
	});
	// Guardar - Hecho
	botonesGuardar.forEach((botonGuardar, fila) => {
		botonGuardar.addEventListener("click", async () => {
			let obtenerDataEntry = (fila) => {
				let objeto = "?prodEntidad=" + prodEntidad + "&prodID=" + prodID;
				for (let columna = 0; columna < columnas; columna++) {
					let indice = fila * columnas + columna;
					objeto += "&" + inputs[indice].name + "=" + encodeURIComponent(inputs[indice].value);
				}
				return objeto;
			};
			// Averiguar si está inactivo --> return
			if (botonGuardar.classList.contains("inactivo")) return;
			else botonGuardar.classList.add("inactivo")
			// Submit
			let url = obtenerDataEntry(fila);
			let respuesta = await fetch("/links/api/guardar/" + url).then((n) => n.json());
			window.location.reload();
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
