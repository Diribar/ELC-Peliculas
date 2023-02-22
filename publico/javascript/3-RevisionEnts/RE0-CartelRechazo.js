"use strict";
window.addEventListener("load", () => {
	// Flechas
	let mostrarMenuMotivos = document.querySelector(".flechas .fa-circle-xmark");

	// Motivos para borrar
	let taparElFondo = document.querySelector("#tapar-el-fondo");
	let menuMotivosBorrar = document.querySelector("#cartelRechazo");
	let motivoRechazo = document.querySelector("#cartelRechazo select");
	let cancelar = document.querySelector("#cartelRechazo .flechas .fa-circle-left");
	let rechazar = document.querySelector("#cartelRechazo .flechas button");

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
		if (motivoRechazo.value) rechazar.classList.remove("inactivo")
		else rechazar.classList.add("inactivo")
	});

	// Rechazar
	rechazar.addEventListener("click", (e) => {
		if (!motivoRechazo.value) e.preventDefault();
	});
});
