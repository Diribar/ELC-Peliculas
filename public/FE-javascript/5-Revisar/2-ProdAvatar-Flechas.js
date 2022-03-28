"use strict";
window.addEventListener("load", () => {
	// Variables
	let prodEntidad = new URL(window.location.href).searchParams.get("entidad");
	let prodID = new URL(window.location.href).searchParams.get("id");

	// Flechas
	let liberarSalir = document.querySelector("#imagenes .fa-circle-left");
	let aceptar = document.querySelector("#imagenes #editada");
	let rechazar = document.querySelector("#imagenes .fa-circle-xmark");

	// Liberar y salir
	liberarSalir.addEventListener("click", async () => {
		let ruta = "/revision/api/liberar-y-salir/?entidad=";
		await fetch(ruta + prodEntidad + "&id=" + prodID);
		window.location.href = "/revision/vision-general";
	});

});
