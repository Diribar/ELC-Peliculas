"use strict";
window.addEventListener("load", () => {
	// Variables
	let filas_yaExistentes = document.querySelectorAll(".yaExistentes");
	let botonesOut = document.querySelectorAll(".yaExistentes .out");
	let prodEntidad = new URL(window.location.href).searchParams.get("entidad");
	let prodID = new URL(window.location.href).searchParams.get("id");
	let links_url = document.querySelectorAll(".yaExistentes input[name='url'");

	// Listener de 'edición'
	botonesOut.forEach((botonOut, fila) => {
		botonOut.addEventListener("click", async () => {
			let objeto = "?prodEntidad=" + prodEntidad + "&prodID=" + prodID;
			objeto += "&url=" + links_url[fila].value;
			if (botonOut.classList.contains("fa-trash-can")) {
				let respuesta = await fetch("/revision/api/eliminar/" + objeto).then((n) => n.json());
				if (respuesta.ocultar) filas_yaExistentes[fila].classList.add("ocultar");
				if (respuesta.reload) window.location.reload();
			}
		});
	});
});
