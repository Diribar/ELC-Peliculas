"use strict";
window.addEventListener("load", () => {
	// Variables
	let filas_yaExistentes = document.querySelectorAll(".yaExistentes");
	let botonesOut = document.querySelectorAll(".yaExistentes .out");
	let botonesEditar = document.querySelectorAll(".yaExistentes .editar");
	let links_id = document.querySelectorAll(".yaExistentes .link_id");
	let taparMotivo = document.querySelectorAll(".yaExistentes .taparMotivo");
	let motivosFila = document.querySelectorAll(".yaExistentes .motivo");
	let motivosSelect = document.querySelectorAll(".yaExistentes .motivo select");
	let camposInput = Array.from(document.querySelectorAll("tbody .alta .input")).map((n) => n.name);
	let columnas = taparMotivo.length / filas_yaExistentes.length;

	// Listener de 'edición'
	botonesOut.forEach((botonOut, fila) => {
		botonOut.addEventListener("click", async () => {
			if (botonOut.classList.contains("fa-trash-can")) {
				let respuesta = await fetch(
					"/links/api/eliminar/?link_id=" +
						links_id[fila].innerHTML +
						"&motivo_id=" +
						motivosSelect[fila].value
				).then((n) => n.json());
				console.log(respuesta);
				if (respuesta.resultado == true) filas_yaExistentes[fila].classList.add("ocultar");
			} else if (botonOut.classList.contains("fa-circle-xmark")) {
				// Reemplazar por el tacho
				botonOut.classList.remove("fa-circle-xmark");
				botonOut.classList.add("fa-trash-can");
				// Ocultar el botón de editar
				console.log(botonesEditar[fila]);
				botonesEditar[fila].classList.add("ocultar");
				// Ocultar los 6 campos
				console.log(fila);
				for (let columna = 0; columna < columnas; columna++)
					taparMotivo[fila * columnas + columna].classList.add("ocultar");
				// Mostrar el select
				motivosFila[fila].classList.remove("ocultar");
			}
		});
	});
});
