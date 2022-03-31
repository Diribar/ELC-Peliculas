"use strict";
window.addEventListener("load", () => {
	// Variables
	let prodEntidad = new URL(window.location.href).searchParams.get("entidad");
	let prodID = new URL(window.location.href).searchParams.get("id");

	// Flechas
	let liberarSalir = document.querySelector("#imagenes .fa-circle-left");

	// Liberar y salir
	liberarSalir.addEventListener("click", async () => {
		liberarSalir.style.transform = "scale(1)";
		liberarSalir.style.cursor = "wait";
		let ruta = "/revision/api/liberar-y-salir/?entidad=";
		await fetch(ruta + prodEntidad + "&id=" + prodID);
		window.location.href = "/revision/vision-general";
	});
});
