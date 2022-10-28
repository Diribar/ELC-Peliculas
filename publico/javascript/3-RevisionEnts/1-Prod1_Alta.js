"use strict";
window.addEventListener("load", () => {
	// Flechas
	let mostrarMenuMotivos = document.querySelector("#flechas .fa-circle-xmark");

	// Motivos para borrar
	let taparElFondo = document.querySelector("#tapar-el-fondo");
	let menuMotivosBorrar = document.querySelector("#motivosRechazo");
	let motivosRechazo = document.querySelector("#motivosRechazo select");
	let cancelar = document.querySelector("#comandosRechazar .fa-circle-left");
	let inactivar = document.querySelector("#comandosRechazar button");

	// Menú motivos para borrar
	mostrarMenuMotivos.addEventListener("click", () => {
		menuMotivosBorrar.classList.remove("ocultar");
		taparElFondo.classList.remove("ocultar");
	});

	// Cancelar menú motivos para borrar
	cancelar.addEventListener("click", () => {
		menuMotivosBorrar.classList.add("ocultar");
		taparElFondo.classList.add("ocultar");
	});

	// Elegir motivo rechazo
	motivosRechazo.addEventListener("click", () => {
		if (motivosRechazo.value) inactivar.classList.remove("inactivo")
		else inactivar.classList.add("inactivo")
	});

	// Inactivar
	inactivar.addEventListener("click", (e) => {
		let motivo = motivosRechazo.value;
		if (!motivo) e.preventDefault();
	});
});
