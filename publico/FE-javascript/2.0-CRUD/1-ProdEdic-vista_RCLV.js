"use strict";
window.addEventListener("load", async () => {
	// Variables generales
	let linksAlta = document.querySelectorAll(".input-error i.linkRCLV#alta");
	let linksEdicion = document.querySelectorAll(".input-error i.linkRCLV#edicion");
	let inputsRCLV = document.querySelectorAll(".input-error .input.RCLV");
	// Variables para el ruteo del origen
	let prodEntidad = new URL(window.location.href).searchParams.get("entidad");
	let prodID = new URL(window.location.href).searchParams.get("id");
	let paramsOrigen = "&origen=ED&prodEntidad=" + prodEntidad + "&prodID=" + prodID;
	// Variables para guardar los datos
	let inputs = document.querySelectorAll(".input-error .input");
	let rutaRQ = "/producto/api/edicion/enviar-a-req-session/";

	// FUNCIONES
	// Mostrar u ocultar los íconos de alta/edición de RCLV
	let mostrarOcultarIconos = (input, i) => {
		// Oculta el link de alta para Jesús
		if (input.value == "11" && i === 0) linksAlta[i].classList.add("ocultar");
		else linksAlta[i].classList.remove("ocultar");
		// Oculta el link de edición cuando el valor es 'nada', 'ninguno' o 'Jesús
		if (!input.value || input.value == "1" || (input.value == "11" && i === 0))
			linksEdicion[i].classList.add("ocultar");
		else linksEdicion[i].classList.remove("ocultar");
		return;
	};
	//
	// Guardar los valores del formulario
	let guardarLosValoresEnSession = () => {
		let objeto = "?entidad=" + prodEntidad + "&id=" + prodID;
		for (let input of inputs) {
			if (input.name != "avatar") objeto += "&" + input.name + "=" + input.value;
		}
		// Guardar los valores en session
		fetch(rutaRQ + objeto); // Guarda el Data-Entry en session
		// Fin
		return;
	};

	// ADD EVENT LISTENERS
	// Links a RCLV - Alta
	linksAlta.forEach((link) => {
		link.addEventListener("click", () => {
			// Si el ícono está inactivo, aborta la operación
			if (link.className.includes("inactivo")) return
			// Guardar los valores en Session y Cookies
			guardarLosValoresEnSession();
			// Obtener la RCLV_entidad
			let entidad = "?entidad=" + entidades(link);
			// Para ir a la vista RCLV
			window.location.href = "/rclv/agregar/" + entidad + paramsOrigen;
		});
	});

	// Links a RCLV - Edición
	linksEdicion.forEach((link, i) => {
		link.addEventListener("click", () => {
			// Si el ícono está inactivo, aborta la operación
			if (link.className.includes("inactivo")) return
			// Guardar los valores en Session y Cookies
			guardarLosValoresEnSession();
			// Obtener la RCLV_entidad
			let entidad = "?entidad=" + entidades(link);
			// Obtener el RCLV_id
			let id = "&id=" + inputsRCLV[i].value;
			// Para ir a la vista RCLV
			window.location.href = "/rclv/edicion/" + entidad + id + paramsOrigen;
		});
	});

	// Activar links RCLV
	inputsRCLV.forEach((input, i) => {
		mostrarOcultarIconos(input, i);
		input.addEventListener("input", () => {
			mostrarOcultarIconos(input, i);
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
