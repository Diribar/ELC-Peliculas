"use strict";
window.addEventListener("load", () => {
	// Variables
	let entidad = new URL(window.location.href).searchParams.get("entidad");
	let prodID = new URL(window.location.href).searchParams.get("id");
	let edicID = new URL(window.location.href).searchParams.get("edicion_id");

	// Opciones
	let aprobar = document.querySelector("#imagenes #editada img");
	let mostrarMenuMotivos = document.querySelector("#imagenes #original img");
	
	// Motivos para borrar
	let taparElFondo = document.querySelector("#tapar-el-fondo");
	let menuMotivosBorrar = document.querySelector("#motivosRechazo");
	let motivosRechazo = document.querySelector("#motivosRechazo select");
	let cancelar = document.querySelector("#comandosRechazar .fa-circle-left");
	let rechazar = document.querySelector("#comandosRechazar .fa-circle-right");

	// Aprobar el nuevo avatar
	aprobar.addEventListener("click", async () => {
		aprobar.style.transform = "scale(1)";
		aprobar.style.cursor = "wait";
		let ruta = "/revision/producto/edicion/api/aprobar-campo/?entidad=";
		await fetch(ruta + entidad + "&id=" + prodID + "&edicion_id=" + edicID + "&campo=" + campoNombre);
		window.location.href =
			"/revision/redireccionar/?entidad=" + entidad + "&id=" + prodID + "&edicion_id=" + edicID;
	});

	// Menú inactivar
	mostrarMenuMotivos.addEventListener("click", () => {
		menuMotivosBorrar.classList.remove("ocultar");
		taparElFondo.classList.remove("ocultar");
	});

	// Cancelar menú motivos para borrar
	cancelar.addEventListener("click", () => {
		menuMotivosBorrar.classList.add("ocultar");
		taparElFondo.classList.add("ocultar");
	});

	// Rechazar el nuevo avatar
	rechazar.addEventListener("click", async () => {
		let motivo = motivosRechazo.value;
		if (motivo) {
			rechazar.style.transform = "scale(1)";
			menuMotivosBorrar.style.cursor = "wait";
			let ruta = "/revision/producto/edicion/api/rechazar-campo/?entidad=";
			await fetch(
				ruta + entidad + "&id=" + prodID + "&edicion_id=" + edicID + "&motivo_id=" + motivo
			);
			window.location.href =
				"/revision/redireccionar/?entidad=" +
				entidad +
				"&id=" +
				prodID +
				"&edicion_id=" +
				edicID;
		}
	});
});
