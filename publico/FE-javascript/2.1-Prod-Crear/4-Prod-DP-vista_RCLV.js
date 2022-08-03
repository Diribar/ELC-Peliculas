"use strict";
window.addEventListener("load", async () => {
	// Variables generales
	let linksAlta = document.querySelectorAll(".input-error .linkRCLV.alta");
	let linksEdicion = document.querySelectorAll(".input-error .linkRCLV.edicion");
	let inputsRCLV = document.querySelectorAll(".input-error .input.RCLV");

	// FUNCIONES
	// Función para buscar todos los valores del formulario
	let guardarLosValoresEnSessionCookies = () => {
		let inputs = document.querySelectorAll(".input-error .input");
		let url = "";
		inputs.forEach((input) => {
			url += "&" + input.name + "=";
			url += encodeURIComponent(input.value);
		});
		// Guardar los valores en session y cookies
		
		return url;
	};

	// Add Event-Listeners
	// Links a RCLV - Alta
	linksAlta.forEach((link) => {
		link.addEventListener("click", () => {
			// Guardar los valores en Session y Cookies
			guardarLosValoresEnSessionCookies()
			// Obtener la RCLV_entidad
			let entidad = link.className.includes("personaje")
				? "personajes"
				: link.className.includes("hecho")
				? "hechos"
				: "valores";
			// Para ir a la vista RCLV
			window.location.href = "/rclv/agregar/?entidad=" + entidad + "origen=DP"
		});
	});

	// Links a RCLV - Edición
	linksEdicion.forEach((link, i) => {
		link.addEventListener("click", () => {
			// Guardar los valores en Session y Cookies
			guardarLosValoresEnSessionCookies()
			// Obtener la RCLV_entidad
			let entidad = link.className.includes("personaje")
				? "personajes"
				: link.className.includes("hecho")
				? "hechos"
				: "valores";
			// Obtener el RCLV_id
			let id = inputsRCLV[i].value;
			// Para ir a la vista RCLV
			window.location.href = "/rclv/edicion/?entidad=" + entidad + "&id=" + id + "origen=DP"
		});
	});
});
