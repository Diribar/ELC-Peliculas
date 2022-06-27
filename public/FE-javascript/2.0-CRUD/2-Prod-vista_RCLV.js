"use strict";
window.addEventListener("load", async () => {
	// Variables generales
	let links = document.querySelectorAll(".input-error i.linkRCLV");
	let prodEntidad = new URL(window.location.href).searchParams.get("entidad");
	let prodID = new URL(window.location.href).searchParams.get("id");

	// Links a Relación con la vida
	links.forEach((link) => {
		link.addEventListener("click", () => {
			if (!link.classList.contains("inactivo")) {
				// Obtener la RCLV_entidad
				let RCLV_entidad = link.className.includes("personaje")
					? "personajes"
					: link.className.includes("hecho")
					? "hechos"
					: "valores";
				// Para ir a la vista RCLV
				window.location.href =
					"/rclv/redireccionar/?origen=edicion&entidad=" +
					prodEntidad +
					"&id=" +
					prodID +
					"&RCLV_entidad=" +
					RCLV_entidad;
			}
		});
	});
});
