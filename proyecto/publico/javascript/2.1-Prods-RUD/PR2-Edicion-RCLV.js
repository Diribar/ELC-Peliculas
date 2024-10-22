"use strict";
window.addEventListener("load", async () => {
	// Variables
	const DOM = {
		// Variables generales
		linksAlta: document.querySelectorAll(".inputError i.linkRCLV#alta"),
		linksEdicion: document.querySelectorAll(".inputError i.linkRCLV#edicion"),
		inputsRCLV: document.querySelectorAll(".inputError .input.RCLV"),

		// Otras
		inputs: document.querySelectorAll(".inputError .input"),
	};
	const idsReserv = await fetch(rutas.variablesRclv).then((n) => n.json());

	// FUNCIONES
	const mostrarOcultarIconos = (input, i) => {
		// Oculta el link de edición cuando el valor es 'nada', o es un registro reservado
		if (!input.value || input.value <= idsReserv) DOM.linksEdicion[i].classList.add("ocultar");
		else DOM.linksEdicion[i].classList.remove("ocultar");
		return;
	};
	const guardarLosValoresEnSession = () => {
		// Variables
		let objeto = "?entidad=" + entidad + "&id=" + id;

		// Actualiza los valores
		obtieneLosValoresEdicN();

		// Completa los valores
		for (let campo in version.edicN) if (campo != "avatar") objeto += "&" + campo + "=" + version.edicN[campo];

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

			// Para ir a la vista RCLV
			const entidadRclv = entidadesRclv(link);
			location.href = "/" + entidadRclv + "/agregar/r/?" + paramsOrigen;

			// Fin
			return;
		});
	});

	// Links a RCLV - Edición
	DOM.linksEdicion.forEach((link, i) => {
		link.addEventListener("click", () => {
			// Si el ícono está inactivo, aborta la operación
			if (link.className.includes("inactivo")) return;

			// Guardar los valores en Session y Cookies
			guardarLosValoresEnSession();

			// Redirige a la vista RCLV
			const entidadRclv = entidadesRclv(link);
			const rclv_id = DOM.inputsRCLV[i].value;
			location.href = "/" + entidadRclv + "/edicion/r/?id=" + rclv_id + "&" + paramsOrigen;
		});
	});

	// Mostrar u ocultar links RCLV
	DOM.inputsRCLV.forEach((input, i) => {
		mostrarOcultarIconos(input, i);
		input.addEventListener("input", () => mostrarOcultarIconos(input, i));
	});
});

// Variables
const rutaSession = "/producto/api/pr-envia-a-req-session/";
const paramsOrigen = "prodEntidad=" + entidad + "&prodId=" + id + "&origen=PED";

// Funciones
const entidadesRclv = (link) => {
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
