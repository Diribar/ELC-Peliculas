"use strict";
window.addEventListener("load", () => {
	// Variables
	let entidad = new URL(window.location.href).searchParams.get("entidad");
	let prodID = new URL(window.location.href).searchParams.get("id");
	let edicID = new URL(window.location.href).searchParams.get("edicion_id");

	// Opciones
	let aprobar = document.querySelector("#centro .fa-circle-check");
	let mostrarMenuMotivos = document.querySelector("#centro .fa-circle-xmark");
	let cancelar = document.querySelector("#comandosRechazar .fa-circle-left");
	let rechazar = document.querySelector("#comandosRechazar .fa-circle-right");

	// Motivos para borrar
	let taparElFondo = document.querySelector("#tapar-el-fondo");
	let motivosRechazo = document.querySelector("#motivosRechazo");
	let motivoRechazo = document.querySelector("#motivosRechazo select");
	// Rutas
	let rutaEvaluar = "/revision/api/producto-edicion/?entidad=";
	rutaEvaluar += entidad + "&id=" + prodID + "&edicion_id=" + edicID + "&campo=avatar";

	// Aprobar el nuevo avatar
	aprobar.addEventListener("click", async () => {
		if (aprobar.className.includes("inactivo")) return;
		aprobar.style.transform = "scale(1)";
		aprobar.style.cursor = "wait";
		aprobar.classList.add("inactivo");
		await fetch(rutaEvaluar + "&aprob=true").then((n) => n.json());
		window.location.reload()
	});

	// Menú mostrarMenuMotivos para inactivar
	mostrarMenuMotivos.addEventListener("click", () => {
		taparElFondo.classList.remove("ocultar");
		motivosRechazo.classList.remove("ocultar");
	});

	// Cancelar menú motivos para borrar
	cancelar.addEventListener("click", () => {
		motivosRechazo.classList.add("ocultar");
		taparElFondo.classList.add("ocultar");
	});

	// Rechazar el nuevo avatar
	rechazar.addEventListener("click", async () => {
		let motivo = motivoRechazo.value;
		if (motivo && !rechazar.className.includes("inactivo")) {
			rechazar.style.transform = "scale(1)";
			rechazar.classList.add("inactivo");
			motivosRechazo.style.cursor = "wait";
			await fetch(rutaEvaluar + "&aprob=false&motivo_id=" + motivo);
			window.location.reload()
		}
	});
});
