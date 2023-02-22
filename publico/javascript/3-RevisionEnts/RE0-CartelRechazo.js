"use strict";
window.addEventListener("load", () => {
	// Flechas
	let accesoAlCartelRechazo = document.querySelector(".flechas .fa-circle-xmark");

	// Motivos para borrar
	let tapaElFondo = document.querySelector("#tapar-el-fondo");
	let cartelRechazo = document.querySelector("#cartelRechazo");
	let motivoRechazo = document.querySelector("#cartelRechazo select");
	let cancelar = document.querySelector("#cartelRechazo .flechas .fa-circle-left");
	let rechazar = document.querySelector("#cartelRechazo .flechas button");

	// Muestra el menú "motivos para borrar"
	accesoAlCartelRechazo.addEventListener("click", () => {
		tapaElFondo.classList.remove("ocultar");
		cartelRechazo.classList.remove("ocultar");
	});

	// Oculta el menú "motivos para borrar"
	cancelar.addEventListener("click", () => {
		cartelRechazo.classList.add("ocultar");
		tapaElFondo.classList.add("ocultar");
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
