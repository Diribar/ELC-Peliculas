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

	// Listener de 'edición'
	botonesOut.forEach((botonOut, i) => {
		botonOut.addEventListener("click", async () => {
			if (botonOut.classList.contains("fa-trash-can")) {
				let respuesta = await fetch(
					"/producto_rud/api/links/eliminar/?link_id=" +
						links_id[i].innerHTML +
						"&motivo_id=" +
						motivosSelect[i].value
				).then((n) => n.json());
				console.log(respuesta);
				if (respuesta.resultado == true) filas_yaExistentes[i].classList.add("ocultar");
			} else if (botonOut.classList.contains("fa-circle-xmark")) {
				// Reemplazar por el tacho
				botonOut.classList.remove("fa-circle-xmark");
				botonOut.classList.add("fa-trash-can");
				// Ocultar el botón de editar
				botonesEditar[i].classList.add("ocultar");
				// Ocultar los 6 campos
				for (let j = 0; j < 6; j++) taparMotivo[i * 6 + j].classList.add("ocultar");
				// Mostrar el select
				motivosFila[i].classList.remove("ocultar");
			}
		});
	});
});
