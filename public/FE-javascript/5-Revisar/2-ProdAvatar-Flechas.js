"use strict";
window.addEventListener("load", () => {
	// Variables
	let prodEntidad = new URL(window.location.href).searchParams.get("entidad");
	let prodID = new URL(window.location.href).searchParams.get("id");
	let edicion_id = new URL(window.location.href).searchParams.get("edicion_id");

	// Flechas
	let aprobar = document.querySelector("#imagenes #editada img");
	let mostrarMenuMotivos = document.querySelector("#imagenes #original img");

	// Motivos para borrar
	let taparElFondo = document.querySelector("#tapar-el-fondo");
	let menuMotivosBorrar = document.querySelector("#motivosRechazar");
	let motivosRechazar = document.querySelector("#motivosRechazar select");
	let cancelar = document.querySelector("#comandosRechazar .fa-circle-left");
	let rechazar = document.querySelector("#comandosRechazar .fa-circle-right");

	// Aprobar el nuevo avatar
	aprobar.addEventListener("click", async () => {
		aprobar.style.transform = "scale(1)";
		aprobar.style.cursor = "wait";
		let ruta = "/revision/producto/edicion/api/aprobarAvatar/?entidad=";
		await fetch(ruta + prodEntidad + "&id=" + prodID + "&edicion_id=" + edicion_id);
		window.location.href =
			"/revision/redireccionar/?entidad=" + prodEntidad + "&id=" + prodID + "&edicion_id=" + edicion_id;
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
		rechazar.style.transform = "scale(1)";
		menuMotivosBorrar.style.cursor = "wait";
		let motivo = motivosRechazar.value;
		if (motivo) {
			let ruta = "/revision/producto/edicion/api/rechazarAvatar/?entidad=";
			await fetch(ruta + prodEntidad + "&id=" + prodID + "&edicion_id=" + edicion_id + "&motivo_id=" + motivo);
			window.location.href =
				"/revision/redireccionar/?entidad=" + prodEntidad + "&id=" + prodID + "&edicion_id=" + edicion_id;
		}

	});
});
