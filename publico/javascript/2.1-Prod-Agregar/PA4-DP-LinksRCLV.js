"use strict";
window.addEventListener("load", async () => {
	// Variables generales
	let linksAlta = document.querySelectorAll(".inputError .linkRCLV.alta");
	let linksEdicion = document.querySelectorAll(".inputError .linkRCLV.edicion");
	let inputsRCLV = document.querySelectorAll(".inputError .input.RCLV");
	let rutaGuardarDatosPers = "/producto/agregar/api/DP-guarda-datos-pers/";

	// FUNCIONES
	// Función para guardar los valores del formulario
	let guardarLosValoresEnSessionCookies = () => {
		let inputs = document.querySelectorAll(".inputError .input");
		let params = "";
		inputs.forEach((input) => {
			if (input.value) params += "&" + input.name + "=" + encodeURIComponent(input.value);
		});
		params = params.replace("&", "?");
		// Guardar los valores en session y cookies
		if (params.length) fetch(rutaGuardarDatosPers + params);
		// Fin
		return;
	};

	// Add Event-Listeners
	// Links a RCLV - Alta
	linksAlta.forEach((link) => {
		link.addEventListener("click", () => {
			// Guardar los valores en Session y Cookies
			guardarLosValoresEnSessionCookies();
			// Obtiene la RCLV_entidad
			let entidad = "?entidad=" + entidades(link);
			// Para ir a la vista RCLV
			window.location.href = "/rclv/agregar/" + entidad + "&origen=DP";
		});
	});

	// Links a RCLV - Edición
	linksEdicion.forEach((link, i) => {
		link.addEventListener("click", () => {
			// Guardar los valores en Session y Cookies
			guardarLosValoresEnSessionCookies();
			// Obtiene la RCLV_entidad
			let entidad = "?entidad=" + entidades(link);
			// Obtiene el RCLV_id
			let id = "&id=" + inputsRCLV[i].value;
			// Para ir a la vista RCLV
			window.location.href = "/rclv/edicion/" + entidad + id + "&origen=DP";
		});
	});
});

let entidades = (link) => {
	return link.className.includes("personaje")
		? "personajes"
		: link.className.includes("hecho")
		? "hechos"
		: "valores";
};
