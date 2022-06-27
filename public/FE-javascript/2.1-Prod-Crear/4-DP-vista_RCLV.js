"use strict";
window.addEventListener("load", async () => {
	// Variables generales
	let inputs = document.querySelectorAll(".input-error .input");
	let linksAlta = document.querySelectorAll(".input-error a.link#alta");
	let linksEdicion = document.querySelectorAll(".input-error a.link#edicion");
	let inputsRCLV = document.querySelectorAll(".input-error .input.RCLV");

	// Función para buscar todos los valores del formulario
	let buscarTodosLosValores = () => {
		let url = "";
		inputs.forEach((input) => {
			url += "&" + input.name + "=";
			url += encodeURIComponent(input.value);
		});
		return url;
	};

	// Links a RCLV - Alta
	linksAlta.forEach((link) => {
		link.addEventListener("click", (e) => {
			e.preventDefault();
			let vista = "&vista=agregar";
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
				"/rclv/redireccionar/?origen=datosPers&RCLV_entidad=" + RCLV_entidad + url + vista;
		});
	});

	// Links a RCLV - Edición
	linksEdicion.forEach((link, i) => {
		link.addEventListener("click", (e) => {
			e.preventDefault();
			let vista = "&vista=edicion";
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
				"/rclv/redireccionar/?origen=datosPers&RCLV_entidad=" + RCLV_entidad + url + vista;
		});
	});
});
