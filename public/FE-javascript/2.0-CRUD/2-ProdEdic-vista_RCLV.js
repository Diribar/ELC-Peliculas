"use strict";
window.addEventListener("load", async () => {
	// Variables generales
	let linksAlta = document.querySelectorAll(".input-error i.linkRCLV#alta");
	let linksEdicion = document.querySelectorAll(".input-error i.linkRCLV#edicion");
	let inputsRCLV = document.querySelectorAll(".input-error .input.RCLV");
	let prodEntidad = new URL(window.location.href).searchParams.get("entidad");
	let prodID = new URL(window.location.href).searchParams.get("id");

	// Links a RCLV - Alta
	linksAlta.forEach((link) => {
		link.addEventListener("click", () => {
			if (!link.classList.contains("inactivo")) {
				let vista = "&vista=agregar";
				// Obtener la RCLV_entidad
				let RCLV_entidad = link.className.includes("personaje")
					? "personajes"
					: link.className.includes("hecho")
					? "hechos"
					: "valores";
				// Para ir a la vista RCLV
				window.location.href =
					"/rclv/redireccionar/?origen=prodEdicion&entidad=" +
					prodEntidad +
					"&id=" +
					prodID +
					"&RCLV_entidad=" +
					RCLV_entidad +
					vista;
			}
		});
	});

	// Links a RCLV - Edición
	linksEdicion.forEach((link,i) => {
		link.addEventListener("click", () => {
			if (link.classList.contains("inactivo")) return;
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
			// Para ir a la vista RCLV
			window.location.href =
				"/rclv/redireccionar/?origen=prodEdicion&entidad=" +
				prodEntidad +
				"&id=" +
				prodID +
				"&RCLV_entidad=" +
				RCLV_entidad +
				vista;
		});
	});
});
