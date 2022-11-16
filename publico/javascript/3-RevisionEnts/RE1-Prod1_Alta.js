"use strict";
window.addEventListener("load", () => {
	// Flechas
	let mostrarMenuMotivos = document.querySelector("#flechas .fa-circle-xmark");

	// Motivos para borrar
	let taparElFondo = document.querySelector("#tapar-el-fondo");
	let menuMotivosBorrar = document.querySelector("#cartelMotivosRechazo");
	let motivoRechazo = document.querySelector("#cartelMotivosRechazo select");
	let cancelar = document.querySelector("#comandosRechazar .fa-circle-left");
	let inactivar = document.querySelector("#comandosRechazar button");

	// Muestra el menú "motivos para borrar"
	mostrarMenuMotivos.addEventListener("click", () => {
		menuMotivosBorrar.classList.remove("ocultar");
		taparElFondo.classList.remove("ocultar");
	});

	// Oculta el menú "motivos para borrar"
	cancelar.addEventListener("click", () => {
		menuMotivosBorrar.classList.add("ocultar");
		taparElFondo.classList.add("ocultar");
	});

	// Elegi motivo rechazo
	motivoRechazo.addEventListener("change", () => {
		if (motivoRechazo.value) inactivar.classList.remove("inactivo")
		else inactivar.classList.add("inactivo")
	});

	// Inactivar
	inactivar.addEventListener("click", (e) => {
		if (!motivoRechazo.value) e.preventDefault();
	});
});
