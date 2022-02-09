window.addEventListener("load", async () => {
	// Variables generales
	let inputs = document.querySelectorAll(".input-error .input");
	let links = document.querySelectorAll(".input-error a.link");

	// Función para buscar todos los valores del formulario
	let buscarTodosLosValores = () => {
		for (let i = 0; i < inputs.length; i++) {
			i == 0 ? (url = "/?") : (url += "&");
			url += inputs[i].name;
			url += "=";
			url += encodeURIComponent(inputs[i].value);
		}
		return url;
	};

	// Links a Relación con la vida
	for (let i = 0; i < links.length; i++) {
		links[i].addEventListener("click", (e) => {
			e.preventDefault();
			if (links[i].className.includes("personaje")) {
				entidad_RCLV = "RCLV_personajes_historicos";
				producto_RCLV = "Personaje Histórico";
			} else if (links[i].className.includes("hecho")) {
				entidad_RCLV = "RCLV_hechos_historicos";
				producto_RCLV = "Hecho Histórico";
			} else {
				entidad_RCLV = "RCLV_valores";
				producto_RCLV = "Valor";
			}
			// Para preservar los valores ingresados hasta el momento
			let url = buscarTodosLosValores();
			// Para ir a la vista RCLV
			window.location.href =
				"/agregar/relacion-vida" +
				url +
				"&entidad_RCLV=" +
				entidad_RCLV +
				"&producto_RCLV=" +
				producto_RCLV;
		});
	}
});
