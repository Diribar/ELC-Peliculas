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
	// Rutas
	let rutaAprobRech = "/revision/api/producto-edicion/?entidad=";
	rutaAprobRech += entidad + "&id=" + prodID + "&edicion_id=" + edicID + "&campo=avatar";
	let rutaReload = "/revision/producto/detalle/?entidad=";
	rutaReload += entidad + "&id=" + prodID + "&edicion_id=" + edicID;

	// Aprobar el nuevo avatar
	aprobar.addEventListener("click", async () => {
		aprobar.style.transform = "scale(1)";
		aprobar.style.cursor = "wait";
		let ruta = "/revision/api/producto-edicion/?aprob=true&entidad=";
		await fetch(rutaAprobRech + "&aprob=true");
		window.location.href = rutaReload;
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
			await fetch(rutaAprobRech + "&aprob=false&motivo_id=" + motivo);
			window.location.href = rutaReload;
		}
	});
});
