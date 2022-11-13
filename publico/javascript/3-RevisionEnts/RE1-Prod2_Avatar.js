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
	let rutaConvertirEnArchivo = "/revision/api/producto-guarda-avatar/?entidad=";
	rutaConvertirEnArchivo += entidad + "&id=" + prodID + "&url=";

	// Otros
	let urlConvertirEnArchivo = document.querySelector("#derecha .agregados");
	let urlAvatar = document.querySelector("#derecha img").src;

	// Aprobar el nuevo avatar
	aprobar.addEventListener("click", async () => {
		if (aprobar.className.includes("inactivo")) return;
		aprobar.classList.add("inactivo");
		await fetch(rutaEvaluar + "&aprob=true").then((n) => n.json());
		window.location.reload();
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
			rechazar.classList.add("inactivo");
			await fetch(rutaEvaluar + "&aprob=false&motivo_id=" + motivo);
			window.location.reload();
		}
	});

	// Convertir el avatar de 'url' a 'archivo'
	urlConvertirEnArchivo.addEventListener("click", async () => {
		// Detiene el proceso si el botón está inactivo, de lo contrario inactiva el botón
		console.log(urlConvertirEnArchivo.className.includes("inactivo"));
		if (urlConvertirEnArchivo.className.includes("inactivo")) return;
		else urlConvertirEnArchivo.classList.add("inactivo");

		// Convierte el url en archivo
		let url = encodeURIComponent(urlAvatar);
		let resultado = await fetch(rutaConvertirEnArchivo + url).then((n) => n.json());
		console.log(resultado);

		// Oculta el botón si se concretó la descarga, de lo contrario activa el botón
		if (resultado == "OK") urlConvertirEnArchivo.classList.add("ocultar");
		else urlConvertirEnArchivo.classList.remove("inactivo");
	});
});
