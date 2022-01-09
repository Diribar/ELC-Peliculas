window.addEventListener("load", async () => {
	// Variables
	let form = document.querySelector("#dataEntry");
	let button = document.querySelector("form button[type='submit']");
	let inputs = document.querySelectorAll("#dataEntry .input");
	let mensajesError = document.querySelectorAll(".mensajeError");
	let iconoOK = document.querySelectorAll(".fa-check-circle");
	let iconoError = document.querySelectorAll(".fa-times-circle");
	let resultadoComentario = document.querySelector("#resultado");
	let entidad = document.querySelector("#entidad").innerHTML;
	let statusInicial = true;
	let pre = "/producto/agregar/api/";

	// Anula/activa el botón 'Submit', muestra el ícono de error/acierto
	let accionesSiHayErrores = async (i, errores) => {
		// Averiguar si hay un error
		campo = inputs[i].name;
		valor = encodeURIComponent(inputs[i].value);
		mensaje = errores[campo];
		// Verificar si el FA_id ya está en nuestra BD
		if (campo == "direccion" && !mensaje) mensaje = await verificarRepetido();
		// Agregar comentario en 'contenido'
		if (campo == "contenido") comentarioContenido(errores.campos, valor);
		// En caso de error
		mensajesError[i].innerHTML = mensaje;
		if (mensaje) {
			iconoError[i].classList.remove("ocultar");
			iconoOK[i].classList.add("ocultar");
			button.classList.add("botonSinLink");
		} else {
			// En caso de que no haya error
			iconoError[i].classList.add("ocultar");
			iconoOK[i].classList.remove("ocultar");
			sinErrores = true;
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
				? button.classList.remove("botonSinLink")
				: button.classList.add("botonSinLink");
		}
	};

	// Revisar si el FA_id ya está en la BD
	let verificarRepetido = async () => {
		direccion = document.querySelector(".input[name='direccion']").value;
		FA_id = await fetch(pre + "FA-obtener-fa-id/?direccion=" + direccion).then((n) => n.json());
		url = "entidad=" + entidad;
		url += "&campo=FA_id";
		url += "&valor=" + FA_id;
		ELC_id = await fetch(pre + "FA-obtener-elc-id/?" + url).then((n) => n.json());
		// Definir el mensaje
		return ELC_id 
			? "Esta " +
					"<a href='/producto/detalle/?entidad=" +
					entidad +
					"&id=" +
					ELC_id +
					"' target='_blank'><u><strong>" +
					entidad +
					"</strong></u></a>" +
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
	let validarDataEntry = () => {
		url = "?";
		for (let i = 0; i < inputs.length; i++) {
			i > 0 ? (url += "&") : "";
			url += inputs[i].name;
			url += "=";
			url += encodeURIComponent(inputs[i].value);
		}
		return fetch("/producto/agregar/api/validar-copiar-fa/" + url).then((n) => n.json());
	};

	// Status inicial
	if (statusInicial) {
		errores = await validarDataEntry();
		for (let i = 0; i < inputs.length; i++) {
			inputs[i].value != "" ? accionesSiHayErrores(i, errores) : "";
		}
		statusInicial = false;
	}

	// Revisa un data-entry en particular (el modificado) y comunica si está OK o no
	for (let i = 0; i < inputs.length; i++) {
		inputs[i].addEventListener("input", async () => {
			errores = await validarDataEntry();
			accionesSiHayErrores(i, errores);
		});
	}

	// Submit
	form.addEventListener("submit", async (e) => {
		if (button.classList.contains("botonSinLink")) {
			e.preventDefault();
			errores = await validarDataEntry();
			for (let i = 0; i < inputs.length; i++) {
				accionesSiHayErrores(i, errores);
			}
		}
	});
});
