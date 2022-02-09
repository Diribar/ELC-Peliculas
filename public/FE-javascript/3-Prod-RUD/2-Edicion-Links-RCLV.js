window.addEventListener("load", async () => {
	// Variables generales
	let inputs = document.querySelectorAll(".input-error .input");
	let links = document.querySelectorAll(".input-error a.linkRCLV");
	let entidad = new URL(window.location.href).searchParams.get("entidad");
	let id = new URL(window.location.href).searchParams.get("id");
	console.log(entidad,id);

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
			console.log(123);
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
				"/agregar/relacion-vida/?origen=edicion" +
				"&entidad_RCLV=" +
				entidad_RCLV +
				"&producto_RCLV=" +
				producto_RCLV +
				url;
		});
	}
});
