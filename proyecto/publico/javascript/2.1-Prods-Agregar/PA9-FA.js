"use strict";
window.addEventListener("load", async () => {
	// Variables
	const DOM = {
		form: document.querySelector("#dataEntry"),
		button: document.querySelector("form button[type='submit']"),
		inputs: document.querySelectorAll("#dataEntry .input"),
		mensajesError: document.querySelectorAll(".mensajeError"),
		iconoOK: document.querySelectorAll(".fa-circle-check"),
		iconoError: document.querySelectorAll(".fa-circle-xmark"),
		resultComent: document.querySelector("#resultado"),
	};
	const entidad = document.querySelector("#entidad").innerHTML;
	const entNombre = entidad == "peliculas" ? "película" : entidad == "colecciones" ? "colección" : "capítulo";
	const pre = "api/pa-";
	let statusInicial = true;

	// Anula/activa el botón 'Submit', muestra el ícono de error/acierto
	let accionesSiHayErrores = async (i, errores) => {
		// Averigua si hay un error
		let campo = DOM.inputs[i].name;
		let valor = encodeURIComponent(DOM.inputs[i].value);
		let mensaje = errores[campo];
		// Verificar si el FA_id ya está en nuestra BD
		if (campo == "direccion" && !mensaje) mensaje = await verificaRepetido_FA_id();
		// Agregar comentario en 'contenido'
		if (campo == "contenido") comentarioContenido(errores.campos, valor);
		// En caso de error
		DOM.mensajesError[i].innerHTML = mensaje;
		if (mensaje) {
			DOM.iconoError[i].classList.remove("ocultar");
			DOM.iconoOK[i].classList.add("ocultar");
			DOM.button.classList.add("inactivo");
		} else {
			// En caso de que no haya error
			DOM.iconoError[i].classList.add("ocultar");
			DOM.iconoOK[i].classList.remove("ocultar");
			let sinErrores = true;
			for (let j = 0; j < DOM.inputs.length; j++) {
				DOM.iconoOK[j].className.includes("ocultar")
					? DOM.inputs[j].name != "en_coleccion"
						? (sinErrores = false)
						: DOM.inputs[0].value == "peliculas"
						? (sinErrores = false)
						: ""
					: "";
			}
			sinErrores ? DOM.button.classList.remove("inactivo") : DOM.button.classList.add("inactivo");
		}
	};

	// Revisar si el FA_id ya está en la BD
	let verificaRepetido_FA_id = async () => {
		// Variables
		const direccion = document.querySelector(".input[name='direccion']").value;
		const FA_id = await fetch(pre + "obtiene-fa-id/?direccion=" + direccion).then((n) => n.json());
		let url, existe;

		// Averigua si existe el registro
		url = "entidad=" + entidad + "&campo=FA_id&valor=" + FA_id;
		existe = await fetch(pre + "averigua-si-fa-ya-existe-en-bd/?" + url).then((n) => n.json());

		// Si no existe y no es una colección, lo busca en la contraparte
		if (!existe && entidad != "colecciones") {
			url = "entidad=" + (entidad == "peliculas" ? "capitulos" : "peliculas");
			url += "&campo=FA_id&valor=" + FA_id;
			existe = await fetch(pre + "averigua-si-fa-ya-existe-en-bd/?" + url).then((n) => n.json());
		}

		// Fin
		return existe
			? "Esta " +
					"<a " +
					("href='/" + entidad + "/detalle/p/?id=" + existe.id) +
					("' target='_blank'><u><b>" + entNombre + "</b></u></a>") +
					" ya se encuentra en nuestra base de datos"
			: "";
	};

	// Procesa el input del contenido
	let comentarioContenido = (campos, valor) => {
		DOM.resultComent.classList.remove(...DOM.resultComent.classList);
		// Formatos
		campos
			? DOM.resultComent.classList.add("resultadoExitoso")
			: valor != ""
			? DOM.resultComent.classList.add("resultadoInvalido")
			: "";
		// Mensaje
		DOM.resultComent.innerHTML = campos
			? campos == 1
				? "Se obtuvo 1 solo dato"
				: "Se obtuvieron " + campos + " datos"
			: valor != ""
			? "No se obtuvo ningún dato"
			: "<br>";
	};

	// Revisa todos los inputs y devuelve los errores
	let validaDataEntry = () => {
		let url = "?";
		for (let i = 0; i < DOM.inputs.length; i++) {
			if (i > 0) url += "&";
			url += DOM.inputs[i].name;
			url += "=";
			url += encodeURIComponent(DOM.inputs[i].value);
		}
		return fetch("api/pa-valida-fa/" + url).then((n) => n.json());
	};

	// Status inicial
	if (statusInicial) {
		let errores = await validaDataEntry();
		for (let i = 0; i < DOM.inputs.length; i++) {
			DOM.inputs[i].value != "" ? accionesSiHayErrores(i, errores) : "";
		}
		statusInicial = false;
	}

	// Revisa un data-entry en particular (el modificado) y comunica si está OK o no
	for (let i = 0; i < DOM.inputs.length; i++) {
		DOM.inputs[i].addEventListener("input", async () => {
			let errores = await validaDataEntry();
			accionesSiHayErrores(i, errores);
		});
	}

	// Submit
	DOM.form.addEventListener("submit", async (e) => {
		if (DOM.button.className.includes("inactivo")) {
			e.preventDefault();
			let errores = await validaDataEntry();
			for (let i = 0; i < DOM.inputs.length; i++) {
				accionesSiHayErrores(i, errores);
			}
		}
	});
});
