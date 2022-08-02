"use strict";
window.addEventListener("load", async () => {
	// Variables generales
	let linksAlta = document.querySelectorAll(".input-error i.linkRCLV#alta");
	let linksEdicion = document.querySelectorAll(".input-error i.linkRCLV#edicion");
	let inputsRCLV = document.querySelectorAll(".input-error .input.RCLV");
	let prodEntidad = new URL(window.location.href).searchParams.get("entidad");
	let prodID = new URL(window.location.href).searchParams.get("id");
	let url = "&origen=ED&prodEntidad=" + prodEntidad + "&prodID=" + prodID;

	// FUNCIONES
	let mostrarOcultarIconos = (input, i) => {
		// Excepciones para: Ninguno y Jesús
		if (!input.value || input.value == "1" || (input.value == "11" && i === 0)) {
			linksAlta[i].classList.add("ocultar");
			linksEdicion[i].classList.add("ocultar");
		} else {
			linksAlta[i].classList.remove("ocultar");
			linksEdicion[i].classList.remove("ocultar");
		}
		return;
	};

	// ADD EVENT LISTENERS
	// Links a RCLV - Alta
	linksAlta.forEach((link) => {
		link.addEventListener("click", () => {
			// Obtener la RCLV_entidad
			let entidad = "?entidad=" + entidades(link);
			// Para ir a la vista RCLV
			window.location.href = "/rclv/agregar/" + entidad + url;
		});
	});

	// Links a RCLV - Edición
	linksEdicion.forEach((link, i) => {
		link.addEventListener("click", () => {
			// Obtener la RCLV_entidad
			let entidad = "?entidad=" + entidades(link);
			// Obtener el RCLV_id
			let id = "&id=" + inputsRCLV[i].value;
			// Para ir a la vista RCLV
			window.location.href = "/rclv/edicion/" + entidad + id + url;
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
