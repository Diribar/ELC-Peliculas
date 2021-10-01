window.addEventListener("load", () => {
	// Acciones cuando se hace click
	let iconoError = document.querySelectorAll(".fa-times-circle");
	let iconoOK = document.querySelectorAll(".fa-check-circle");
	let inputs = document.querySelectorAll("#data_entry .input");
	let button = document.querySelector("form button[type='submit']");

	window.onclick = (e) => {
		// Status inicial
		for (let i = 0; i < iconoError.length; i++) {
			iconoError[i].classList.contains("ocultar") &&
			iconoOK[i].classList.contains("ocultar") &&
			inputs[i].value != "" &&
			!e.target.matches("#submit")
				? verificar(false, i)
				: "";
		}

		// Click en ícono de ayuda
		let iconosAyuda = document.querySelectorAll(".fa-question-circle");
		let mensajesAyuda = document.querySelectorAll(".mensajeAyuda");
		for (let i = 0; i < iconosAyuda.length; i++) {
			e.target.matches("#" + iconosAyuda[i].id)
				? mensajesAyuda[i].classList.toggle("ocultar")
				: mensajesAyuda[i].classList.add("ocultar");
		}
	};

	// Revisar el data-entry y comunicar los aciertos y errores
	for (let i = 0; i < inputs.length; i++) {
		inputs[i].addEventListener("input",async () => {
			console.log(await !verificar(true, i));
			if (!await verificar(true, i)) {
				button.classList.add("botonSinLink");
			} else {
				button.classList.remove("botonSinLink");
				for (let j = 0; j < inputs.length; j++) {
					iconoOK[j].classList.contains("ocultar") || !inputs[j].value
						? button.classList.add("botonSinLink")
						: "";
					console.log(iconoOK[j].classList.contains("ocultar"));
					console.log(!inputs[j].value);
				}
			}
		});
	}

	// Submit
	document.querySelector("form").addEventListener("submit", (e) => {
		button.classList.contains("botonSinLink") ? e.preventDefault() : "";
		verificarRubro(true);
		verificarDireccion(true);
		verificarAvatar(true);
		verificarContenido(true);
	});

	// FUNCIONES ******************************
	let mensajeError = document.querySelectorAll(".mensajeError");
	let verificarRubro = (verificarErrores) => {
		if (inputs[0].value != "") {
			iconoError[0].classList.add("ocultar");
			iconoOK[0].classList.remove("ocultar");
			return true;
		} else if (verificarErrores) {
			iconoError[0].classList.remove("ocultar");
			mensajeError[0].innerHTML = "Elegí una opción";
		}
		return false;
	};
	let verificarDireccion = async (verificarErrores) => {
		// TRUE --> la URL es correcta, el producto no está repetido
		// Obtener el fa_id ****************
		url = encodeURIComponent(inputs[1].value);
		url = "/peliculas/agregar/api/obtener-fa-id/?url=" + url;
		let fa_id = await fetch(url).then((n) => n.json());
		if (!fa_id) {
			mensajeError[1].innerHTML = "No es una dirección de Film Affinity";
			verificarErrores ? iconoError[1].classList.remove("ocultar") : "";
			return false;
		}
		// Obtener el ELC_id ***************
		url =
			"/peliculas/agregar/api/obtener-elc-id/?" +
			"rubroAPI=" +
			inputs[0].value +
			"&fa_id=" +
			fa_id;
		let ELC_id = await fetch(url).then((n) => n.json());
		// Respuesta
		// Resultado exitoso
		if (!ELC_id) {
			iconoError[1].classList.add("ocultar");
			iconoOK[1].classList.remove("ocultar");
			return true;
		} else if (verificarErrores) {
			// Resultado inválido
			iconoError[1].classList.remove("ocultar");
			rubro = inputs[0].value == "movie" ? "película" : "colección";
			mensajeError[1].innerHTML =
				"La " +
				rubro +
				" ya está en nuestra BD. Hacé click " +
				"<a href='/peliculas/agregar/ya-en-bd?rubroAPI=" +
				inputs[0] +
				"&id=" +
				ELC_id +
				"'><u><strong>acá</strong></u></a>" +
				" para ver el detalle";
		}
		return false;
	};
	let verificarAvatar = async (verificarErrores) => {
		// TRUE --> la URL es correcta
		url = encodeURIComponent(inputs[2].value);
		url = "/peliculas/agregar/api/imagen_fa/?url=" + url;
		let resultado = await fetch(url).then((n) => n.json());
		console.log(resultado);
		if (resultado) {
			mensajeError[2].innerHTML = resultado;
			verificarErrores ? iconoError[2].classList.remove("ocultar") : "";
			iconoOK[2].classList.add("ocultar");
			return false;
		}
		iconoError[2].classList.add("ocultar");
		iconoOK[2].classList.remove("ocultar");
		return true;
	};
	let verificarContenido = async (verificarErrores) => {
		// Código de validación **************************
		let campos = inputs[3].value
			? await procesarContenidoFA(inputs[3].value)
			: 0;
		// Resultado exitoso *****************************
		if (campos > 0) {
			iconoError[3].classList.add("ocultar");
			iconoOK[3].classList.remove("ocultar");
			return true;
		}
		// Resultado inválido ****************************
		else if (verificarErrores) {
			iconoError[3].classList.remove("ocultar");
			inputs[3].value == ""
				? (mensajeError[3].innerHTML =
						"Necesitamos que completes esta información")
				: (mensajeError[3].innerHTML =
						"No se puede importar ningún dato");
		}
		return false;
	};
	let verificar =async (verificarErrores, i) => {
		i == 0
			? (aux = verificarRubro(verificarErrores))
			: i == 1
			? (aux = await verificarDireccion(verificarErrores))
			: i == 2
			? (aux = await verificarAvatar(verificarErrores))
			: (aux = await verificarContenido(verificarErrores));
		return aux
	};
});

let procesarContenidoFA = async (contenido) => {
	// Procesando la información
	let resultado = document.querySelector("#resultado");
	resultado.classList.remove(...resultado.classList);
	resultado.classList.add("resultadoEnEspera");
	resultado.innerHTML = "Procesando la información...";
	// Procesar los datos de la película
	contenido = encodeURIComponent(contenido);
	let url =
		"/peliculas/agregar/api/procesarcontenidofa/?contenido=" + contenido;
	let lectura = await fetch(url).then((n) => n.json());
	// Información procesada
	let campos = Object.keys(lectura).length;
	resultado.classList.remove("resultadoEnEspera");
	if (campos) {
		campos == 1
			? (mensaje = "Se obtuvo 1 solo dato")
			: (mensaje = "Se obtuvieron " + campos + " datos");
		resultado.classList.add("resultadoExitoso");
	} else {
		if (contenido != "") {
			mensaje = "No se obtuvo ningún dato";
			resultado.classList.add("resultadoInvalido");
		} else {
			mensaje = "<br>";
		}
	}
	resultado.innerHTML = mensaje;
	return campos;
};
