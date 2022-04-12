"use strict";
window.addEventListener("load", async () => {
	// Variables generales
	let links = document.querySelectorAll(".input-error i.linkRCLV");
	let prodEntidad = new URL(window.location.href).searchParams.get("entidad");
	let prodID = new URL(window.location.href).searchParams.get("id");

	// Links a Relación con la vida
	for (let i = 0; i < links.length; i++) {
		links[i].addEventListener("click", () => {
			if (!links[i].classList.contains("inactivo")) {
				// Obtener la entidad_RCLV
				let RCLV_entidad = links[i].className.includes("personaje")
					? "RCLV_personajes"
					: links[i].className.includes("hecho")
					? "RCLV_hechos"
					: "RCLV_valores";
				// Para ir a la vista RCLV
				window.location.href =
					"/producto/rclv/redireccionar/?origen=edicion&entidad=" +
					prodEntidad +
					"&id=" +
					prodID +
					"&entidad_RCLV=" +
					RCLV_entidad;
			}
		});
	}
});
