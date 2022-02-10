window.addEventListener("load", async () => {
	// Variables generales
	let inputs = document.querySelectorAll(".input-error .input");
	let links = document.querySelectorAll(".input-error a.linkRCLV");
	let entidad = new URL(window.location.href).searchParams.get("entidad");
	let id = new URL(window.location.href).searchParams.get("id");

	// Links a Relación con la vida
	for (let i = 0; i < links.length; i++) {
		links[i].addEventListener("click", (e) => {
			e.preventDefault();
			// Obtener la entidad_RCLV
			let entidad_RCLV = links[i].className.includes("personaje")
				? "RCLV_personajes_historicos"
				: links[i].className.includes("hecho")
				? "RCLV_hechos_historicos"
				: "RCLV_valores";
			// Para ir a la vista RCLV
			window.location.href =
				"/agregar/relacion-vida/?origen=edicion&entidad=" +
				entidad +
				"&id=" +
				id +
				"&entidad_RCLV=" +
				entidad_RCLV;
		});
	}
});
