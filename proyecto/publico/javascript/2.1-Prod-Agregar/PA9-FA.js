"use strict";
window.addEventListener("load", async () => {
	// Variables
	let form = document.querySelector("#dataEntry");
	let button = document.querySelector("form button[type='submit']");
	let inputs = document.querySelectorAll("#dataEntry .input");
	let mensajesError = document.querySelectorAll(".mensajeError");
	let iconoOK = document.querySelectorAll(".fa-circle-check");
	let iconoError = document.querySelectorAll(".fa-circle-xmark");
	let resultadoComentario = document.querySelector("#resultado");
	let entidad = document.querySelector("#entidad").innerHTML;
	let statusInicial = true;
	let pre = "/producto/agregar/api/";

	// Anula/activa el botón 'Submit', muestra el ícono de error/acierto
	let accionesSiHayErrores = async (i, errores) => {
		// Averigua si hay un error
		let campo = inputs[i].name;
		let valor = encodeURIComponent(inputs[i].value);
		let mensaje = errores[campo];
		// Verificar si el FA_id ya está en nuestra BD
		if (campo == "direccion" && !mensaje) mensaje = await verificarRepetido_FA_id();
		// Agregar comentario en 'contenido'
		if (campo == "contenido") comentarioContenido(errores.campos, valor);
		// En caso de error
		mensajesError[i].innerHTML = mensaje;
		if (mensaje) {
			iconoError[i].classList.remove("ocultar");
			iconoOK[i].classList.add("ocultar");
			button.classList.add("inactivo");
		} else {
			// En caso de que no haya error
			iconoError[i].classList.add("ocultar");
			iconoOK[i].classList.remove("ocultar");
			let sinErrores = true;
			for (let j = 0; j < inputs.length; j++) {
				iconoOK[j].classList.contains("ocultar")
					? inputs[j].name != "en_coleccion"
						? (sinErrores = false)
						: inputs[0].value == "peliculas"
						? (sinErrores = false)
						: ""
					: "";
			}
			sinErrores
				? button.classList.remove("inactivo")
				: button.classList.add("inactivo");
		}
	};

	// Revisar si el FA_id ya está en la BD
	let verificarRepetido_FA_id = async () => {
		let direccion = document.querySelector(".input[name='direccion']").value;
		let FA_id = await fetch(pre + "FA-obtiene-fa-id/?direccion=" + direccion).then((n) => n.json());
		let url = "entidad=" + entidad;
		url += "&campo=FA_id";
		url += "&valor=" + FA_id;
		let elc_id = await fetch(pre + "FA-obtiene-elc-id/?" + url).then((n) => n.json());
		if (!elc_id && entidad != "colecciones") {
			url = "entidad=" + (entidad == "peliculas" ? "capitulos" : "peliculas");
			url += "&campo=FA_id";
			url += "&valor=" + FA_id;
			elc_id = await fetch(pre + "FA-obtiene-elc-id/?" + url).then((n) => n.json());
		}
		// Definir el mensaje
		return elc_id
			? "Esta " +
					"<a href='/producto/detalle/?entidad=" +
					entidad +
					"&id=" +
					elc_id +
					"' target='_blank'><u><b>" +
					entidad +
					"</b></u></a>" +
					" ya se encuentra en nuestra base de datos"
			: "";
	};

	// Procesa el input del contenido
	let comentarioContenido = (campos, valor) => {
		resultadoComentario.classList.remove(...resultadoComentario.classList);
		// Formatos
		campos
			? resultadoComentario.classList.add("resultadoExitoso")
			: valor != ""
			? resultadoComentario.classList.add("resultadoInvalido")
			: "";
		// Mensaje
		resultadoComentario.innerHTML = campos
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
		for (let i = 0; i < inputs.length; i++) {
			if (i > 0) url += "&";
			url += inputs[i].name;
			url += "=";
			url += encodeURIComponent(inputs[i].value);
		}
		return fetch("/producto/agregar/api/valida/ingreso-fa/" + url).then((n) => n.json());
	};

	// Status inicial
	if (statusInicial) {
		let errores = await validaDataEntry();
		for (let i = 0; i < inputs.length; i++) {
			inputs[i].value != "" ? accionesSiHayErrores(i, errores) : "";
		}
		statusInicial = false;
	}

	// Revisa un data-entry en particular (el modificado) y comunica si está OK o no
	for (let i = 0; i < inputs.length; i++) {
		inputs[i].addEventListener("input", async () => {
			let errores = await validaDataEntry();
			accionesSiHayErrores(i, errores);
		});
	}

	// Submit
	form.addEventListener("submit", async (e) => {
		if (button.classList.contains("inactivo")) {
			e.preventDefault();
			let errores = await validaDataEntry();
			for (let i = 0; i < inputs.length; i++) {
				accionesSiHayErrores(i, errores);
			}
		}
	});
});
