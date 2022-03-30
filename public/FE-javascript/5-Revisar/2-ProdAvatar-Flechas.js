"use strict";
window.addEventListener("load", () => {
	// Variables
	let prodEntidad = new URL(window.location.href).searchParams.get("entidad");
	let prodID = new URL(window.location.href).searchParams.get("id");
	let edicion_id = new URL(window.location.href).searchParams.get("edicion_id");

	// Flechas
	let liberarSalir = document.querySelector("#imagenes .fa-circle-left");
	let aceptar = document.querySelector("#imagenes #editada img");
	let rechazar = document.querySelector("#imagenes #original img");

	// Liberar y salir
	liberarSalir.addEventListener("click", async () => {
		liberarSalir.style.transform = "scale(1)";
		liberarSalir.style.cursor = "wait";
		let ruta = "/revision/api/liberar-y-salir/?entidad=";
		await fetch(ruta + prodEntidad + "&id=" + prodID);
		window.location.href = "/revision/vision-general";
	});

	// Aceptar el nuevo avatar
	aceptar.addEventListener("click", async () => {
		aceptar.style.transform = "scale(1)";
		aceptar.style.cursor = "wait";
		let ruta = "/revision/producto/edicion/api/aprobarAvatar/?entidad=";
		await fetch(ruta + prodEntidad + "&id=" + prodID + "&edicion_id=" + edicion_id);
		window.location.href =
			"/revision/redireccionar/?entidad=" + prodEntidad + "&id=" + prodID + "&edicion_id=" + edicion_id;
	});

	// Rechazar el nuevo avatar
	rechazar.addEventListener("click", async () => {
		rechazar.style.transform = "scale(1)";
		rechazar.style.cursor = "wait";
		// let ruta = "/revision/producto/edicion/api/aprobarAvatar/?entidad=";
		// await fetch(ruta + prodEntidad + "&id=" + prodID);
		// window.location.href = "/revision/vision-general";
	});
});
