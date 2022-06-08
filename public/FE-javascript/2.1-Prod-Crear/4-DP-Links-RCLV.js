"use strict";
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
			// Obtener la RCLV_entidad
			let entidad = links[i].className.includes("personaje")
				? "personajes"
				: links[i].className.includes("hecho")
				? "hechos"
				: "valores";
			// Para preservar los valores ingresados hasta el momento
			let url = buscarTodosLosValores();
			// Para ir a la vista RCLV
			window.location.href = "/rclv/redireccionar/?origen=datosPers&RCLV_entidad=" + entidad + url;
		});
	}
});
