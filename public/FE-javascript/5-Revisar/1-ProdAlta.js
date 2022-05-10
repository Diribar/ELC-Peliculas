"use strict";
window.addEventListener("load", () => {
	// Variables
	let prodEntidad = new URL(window.location.href).searchParams.get("entidad");
	let prodID = new URL(window.location.href).searchParams.get("id");

	// Flechas
	let aprobar = document.querySelector("#flechas .fa-circle-check");
	let mostrarMenuMotivos = document.querySelector("#flechas .fa-circle-xmark");

	// Motivos para borrar
	let taparElFondo = document.querySelector("#tapar-el-fondo");
	let menuMotivosBorrar = document.querySelector("#motivosRechazo");
	let motivosRechazo = document.querySelector("#motivosRechazo select");
	let cancelar = document.querySelector("#comandosRechazar .fa-circle-left");
	let inactivar = document.querySelector("#comandosRechazar .fa-circle-right");

	// Aprobar el alta
	aprobar.addEventListener("click", async () => {
		aprobar.style.transform = "scale(1)";
		aprobar.style.cursor = "wait";
		let ruta = "/revision/api/producto-alta/aprobar/?entidad=";
		await fetch(ruta + prodEntidad + "&id=" + prodID);
		window.location.href = "/revision/redireccionar/?entidad=" + prodEntidad + "&id=" + prodID;
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

	// Inactivar
	inactivar.addEventListener("click", async () => {
		let motivo = motivosRechazo.value;
		if (motivo) {
			// rechazar.style.transform = "scale(1)";
			// rechazar.style.cursor = "wait";
			let ruta = "/revision/api/producto-alta/rechazar/?entidad=";
			await fetch(ruta + prodEntidad + "&id=" + prodID + "&motivo_id=" + motivo);
			window.location.href = "/revision/tablero-de-control";
		}
	});
});
