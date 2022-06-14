"use strict";
window.addEventListener("load", () => {
	// Variables
	let filas_yaExistentes = document.querySelectorAll(".yaExistentes");
	let botonesOut = document.querySelectorAll(".yaExistentes .out");
	let botonesEditar = document.querySelectorAll(".yaExistentes .editar");
	let taparMotivo = document.querySelectorAll(".yaExistentes .taparMotivo");
	let motivosFila = document.querySelectorAll(".yaExistentes .motivo");
	let motivosSelect = document.querySelectorAll(".yaExistentes .motivo select");
	let columnas = taparMotivo.length / filas_yaExistentes.length;
	// Campo extraño: el name es 'url', pero el valor es 'link_id'
	let links_url = document.querySelectorAll(".edicion .inputError input[name='url'");

	// Listener de 'edición'
	botonesOut.forEach((botonOut, fila) => {
		botonOut.addEventListener("click", async () => {
			if (botonOut.classList.contains("fa-trash-can")) {
				let objeto = "?prodEntidad=" + prodEntidad + "&prodID=" + prodID;
				objeto += "&url=" + links_url[fila].value + "&motivo_id=" + motivosSelect[fila].value;
				let respuesta = await fetch("/links/api/eliminar/" + objeto).then((n) => n.json());
				console.log(respuesta);
				if (respuesta.resultado == true) filas_yaExistentes[fila].classList.add("ocultar");
			} else if (botonOut.classList.contains("fa-circle-xmark")) {
				// Reemplazar por el tacho
				botonOut.classList.remove("fa-circle-xmark");
				botonOut.classList.add("fa-trash-can");
				// Ocultar el botón de editar
				botonesEditar[fila].classList.add("ocultar");
				// Ocultar los 6 campos
				for (let columna = 0; columna < columnas; columna++)
					taparMotivo[fila * columnas + columna].classList.add("ocultar");
				// Mostrar el select
				motivosFila[fila].classList.remove("ocultar");
			}
		});
	});
});
