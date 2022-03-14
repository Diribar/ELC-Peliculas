window.addEventListener("load", async () => {
	// Variables generales
	let inputs = document.querySelectorAll(".input-error .input");
	let links = document.querySelectorAll(".input-error a.link");

	// Función para buscar todos los valores del formulario
	let buscarTodosLosValores = () => {
		let url = "";
		for (let i = 0; i < inputs.length; i++) {
			url += "&" + inputs[i].name + "=";
			url += encodeURIComponent(inputs[i].value);
		}
		return url;
	};

	// Links a Relación con la vida
	for (let i = 0; i < links.length; i++) {
		links[i].addEventListener("click", (e) => {
			e.preventDefault();
			// Obtener la entidad_RCLV
			let entidad_RCLV = links[i].className.includes("personaje")
				? "RCLV_personajes"
				: links[i].className.includes("hecho")
				? "RCLV_hechos"
				: "RCLV_valores";
			// Para preservar los valores ingresados hasta el momento
			let url = buscarTodosLosValores();
			// Para ir a la vista RCLV
			window.location.href =
				"/agregar/rclv/redireccionar/?origen=datosPers&entidad_RCLV=" + entidad_RCLV + url;
		});
	}
});
