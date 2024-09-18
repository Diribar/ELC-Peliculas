"use strict";
window.addEventListener("load", async () => {
	// Variables
	let DOM = {
		// Variables generales
		linksAlta: document.querySelectorAll(".inputError i.linkRCLV#alta"),
		linksEdicion: document.querySelectorAll(".inputError i.linkRCLV#edicion"),
		inputsRCLV: document.querySelectorAll(".inputError .input.RCLV"),

		// Otras
		inputs: document.querySelectorAll(".inputError .input"),
	};

	// Variables para el ruteo del origen
	const paramsOrigen = "&prodEntidad=" + entidad + "&prodId=" + id + "&origen=PED";

	// Variables para guardar los datos
	const rutaSession = "/producto/api/envia-a-req-session/";

	// FUNCIONES
	// Mostrar u ocultar los íconos de alta/edición de RCLV
	let mostrarOcultarIconos = (input, i) => {
		// Oculta el link de alta para Jesús
		if (input.value == "11" && i === 0) DOM.linksAlta[i].classList.add("ocultar");
		else DOM.linksAlta[i].classList.remove("ocultar");
		// Oculta el link de edición cuando el valor es 'nada', 'ninguno' o 'Jesús
		if (!input.value || input.value == "1" || (input.value == "11" && i === 0)) DOM.linksEdicion[i].classList.add("ocultar");
		else DOM.linksEdicion[i].classList.remove("ocultar");
		return;
	};
	//
	// Guardar los valores del formulario
	let guardarLosValoresEnSession = () => {
		// Variables
		let objeto = "?entidad=" + entidad + "&id=" + id;

		// Actualiza los valores
		obtieneLosValoresEdicN()

		// Completa los valores
		for (let campo in version.edicN)
			if (campo != "avatar") objeto += "&" + campo + "=" + version.edicN[campo];

		// Guardar los valores en session
		fetch(rutaSession + objeto); // Guarda el Data-Entry en session

		// Fin
		return;
	};

	// Links a RCLV - Alta
	DOM.linksAlta.forEach((link) => {
		link.addEventListener("click", () => {
			// Si el ícono está inactivo, aborta la operación
			if (link.className.includes("inactivo")) return;

			// Guardar los valores en Session y Cookies
			guardarLosValoresEnSession();

			// Obtiene la RCLV_entidad
			const entidadRclv = "?entidad=" + entidades(link);

			// Para ir a la vista RCLV
			location.href = "/rclv/agregar/" + entidadRclv + paramsOrigen;

			// Fin
			return
		});
	});

	// Links a RCLV - Edición
	DOM.linksEdicion.forEach((link, i) => {
		link.addEventListener("click", () => {
			// Si el ícono está inactivo, aborta la operación
			if (link.className.includes("inactivo")) return;
			// Guardar los valores en Session y Cookies
			guardarLosValoresEnSession();

			// Obtiene la RCLV_entidad
			let entidadRclv = "?entidad=" + entidades(link);

			// Obtiene el RCLV_id
			let rclv_id = "&id=" + DOM.inputsRCLV[i].value;

			// Para ir a la vista RCLV
			location.href = "/rclv/edicion/" + entidadRclv + rclv_id + paramsOrigen;
		});
	});

	// Activar links RCLV
	DOM.inputsRCLV.forEach((input, i) => {
		mostrarOcultarIconos(input, i);
		input.addEventListener("input", () => {
			mostrarOcultarIconos(input, i);
		});
	});
});

let entidades = (link) => {
	return link.className.includes("personaje_id")
		? "personajes"
		: link.className.includes("hecho_id")
		? "hechos"
		: link.className.includes("tema_id")
		? "temas"
		: link.className.includes("evento_id")
		? "eventos"
		: link.className.includes("epocaDelAno_id")
		? "epocasDelAno"
		: "";
};
