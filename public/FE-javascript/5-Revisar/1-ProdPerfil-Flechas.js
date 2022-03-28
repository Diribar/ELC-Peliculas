"use strict";
window.addEventListener("load", () => {
	// Variables
	let prodEntidad = new URL(window.location.href).searchParams.get("entidad");
	let prodID = new URL(window.location.href).searchParams.get("id");

	// Motivos para borrar
	let taparElFondo = document.querySelector("#tapar-el-fondo");
	let menuMotivosBorrar = document.querySelector("#motivosParaBorrar");
	let motivosParaBorrar = document.querySelector("#motivosParaBorrar select");
	let cancelar = document.querySelector("#comandosBorrar .fa-circle-left");
	let inactivar = document.querySelector("#comandosBorrar .fa-circle-right");

	// Flechas
	let liberarSalir = document.querySelector("#flechas .fa-circle-left");
	let aprobarAlta = document.querySelector("#flechas .fa-circle-check");
	let menuInactivar = document.querySelector("#flechas .fa-circle-xmark");

	// Liberar y salir
	liberarSalir.addEventListener("click", async () => {
		let ruta = "/revision/api/liberar-y-salir/?entidad=";
		await fetch(ruta + prodEntidad + "&id=" + prodID);
		window.location.href = "/revision/vision-general";
	});

	// Pre-autorizar
	aprobarAlta.addEventListener("click", async () => {
		let ruta = "/revision/producto/perfil/api/aprobar-alta/?entidad=";
		await fetch(ruta + prodEntidad + "&id=" + prodID);
		window.location.href = "/revision/producto/edicion/?entidad=" + prodEntidad + "&id=" + prodID;
	});

	// Menú inactivar
	menuInactivar.addEventListener("click", () => {
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
		let motivo = motivosParaBorrar.value;
		if (motivo) {
			let ruta = "/revision/producto/perfil/api/inactivar/?entidad=";
			await fetch(ruta + prodEntidad + "&id=" + prodID + "&motivo_id=" + motivo);
			console.log(51);
			window.location.href = "/revision/vision-general";
		}
	});
});
