"use strict";
window.addEventListener("load", async () => {
	// Variables generales
	let linksAlta = document.querySelectorAll(".input-error .linkRCLV.alta");
	let linksEdicion = document.querySelectorAll(".input-error .linkRCLV.edicion");
	let inputsRCLV = document.querySelectorAll(".input-error .input.RCLV");

	// FUNCIONES
	// Función para buscar todos los valores del formulario
	let buscarTodosLosValores = () => {
		let inputs = document.querySelectorAll(".input-error .input");
		let url = "";
		inputs.forEach((input) => {
			url += "&" + input.name + "=";
			url += encodeURIComponent(input.value);
		});
		return url;
	};
	let activarIconos = (i) => {
		if (linksEdicion[i].classList.contains("inactivo")) linksEdicion[i].classList.remove("inactivo");
	};

	// Add Event-Listeners
	// Links a RCLV - Alta
	linksAlta.forEach((link) => {
		link.addEventListener("click", () => {
			let vistaRCLV = "&vistaRCLV=agregar";
			// Obtener la RCLV_entidad
			let RCLV_entidad = link.className.includes("personaje")
				? "personajes"
				: link.className.includes("hecho")
				? "hechos"
				: "valores";
			// Para preservar los valores ingresados hasta el momento
			let url = buscarTodosLosValores();
			// Para ir a la vista RCLV
			window.location.href =
				"/rclv/redireccionar/?origen=prodAgregar&RCLV_entidad=" + RCLV_entidad + url + vistaRCLV;
		});
	});

	// Links a RCLV - Edición
	linksEdicion.forEach((link, i) => {
		link.addEventListener("click", () => {
			if (link.classList.contains("inactivo")) return;
			let vistaRCLV = "&vistaRCLV=edicion";
			// Obtener la RCLV_entidad
			let RCLV_entidad = link.className.includes("personaje")
				? "personajes"
				: link.className.includes("hecho")
				? "hechos"
				: "valores";
			// Obtener el RCLV_id
			let RCLV_id = inputsRCLV[i].value;
			if (RCLV_id) RCLV_entidad += "&RCLV_id=" + RCLV_id;
			else return;
			// Para preservar los valores ingresados hasta el momento
			let url = buscarTodosLosValores();
			// Para ir a la vista RCLV
			window.location.href =
				"/rclv/redireccionar/?origen=prodAgregar&RCLV_entidad=" + RCLV_entidad + url + vistaRCLV;
		});
	});

	// Activar links RCLV
	inputsRCLV.forEach((input, i) => {
		if (input.value) activarIconos(i);
		input.addEventListener("input", () => {
			activarIconos(i);
		});
	});
});
