window.addEventListener("load", async () => {
	// Variables
	let form = document.querySelector("#dataEntry");
	let button = document.querySelector("form button[type='submit']");
	let inputs = document.querySelectorAll("#dataEntry .input");
	let mensajesError = document.querySelectorAll(".mensajeError");
	let mensajesAyuda = document.querySelectorAll(".mensajeAyuda");
	let iconosAyuda = document.querySelectorAll(".fa-question-circle");
	let iconoOK = document.querySelectorAll(".fa-check-circle");
	let iconoError = document.querySelectorAll(".fa-times-circle");
	let resultadoComentario = document.querySelector("#resultado");
	let entidad = document.querySelector("select[name='entidad']");
	let resto = document.querySelector("#dataEntry #resto");
	let sectEnColeccion = document.querySelector("#en_coleccion");
	let statusInicial = true;
	let pre = "/agregar/producto/api/";

	// Muestra en la vista, los campos posteriores a 'entidad'
	let mostrarCampos = (valor, mensaje) => {
		// Acciones si hay un error
		if (mensaje) {
			sectEnColeccion.classList.add("ocultar");
			resto.classList.add("ocultar");
			return;
		}
		// Acciones si no hay un error
		valor == "collection"
			? sectEnColeccion.classList.add("ocultar")
			: sectEnColeccion.classList.remove("ocultar");
		resto.classList.remove("ocultar");
		return;
	};

	// Anula/activa el botón 'Submit', muestra el ícono de error/acierto
	let accionesSiHayErrores = (i, errores) => {
		// Averiguar si hay un error
		campo = inputs[i].name;
		valor = encodeURIComponent(inputs[i].value);
		mensaje = errores[campo];
		mensajesError[i].innerHTML = mensaje;
		// Mostrar secciones
		campo == "entidad" ? mostrarCampos(valor, mensaje) : "";
		// Acciones en submit si se cambia la Dirección
		campo == "direccion" ? (button.innerHTML = "Verificar") : "";
		// Agregar comentario en 'contenido'
		campo == "contenido" ? comentarioContenido(errores.campos, valor) : "";
		// En caso de error
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
						: inputs[0].value == "movie"
						? (sinErrores = false)
						: ""
					: "";
			}
			sinErrores
				? button.classList.remove("botonSinLink")
				: button.classList.add("botonSinLink");
		}
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
		return fetch("/agregar/producto/api/validar-copiar-fa/" + url).then(
			(n) => n.json()
		);
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
		} else if (button.innerHTML == "Verificar") {
			e.preventDefault();
			// Averiguar si el ID está repetido
			direccion = document.querySelector(
				".input[name='direccion']"
			).value;
			fa_id = await fetch(
				pre + "obtener-fa-id/?direccion=" + direccion
			).then((n) => n.json());
			campo = entidad.value == "movie" ? "peli_fa_id" : "colec_fa_id";
			url = "entidad=" + entidad.value;
			url += "&campo=" + campo;
			url += "&id=" + fa_id;
			ELC_id = await fetch(pre + "obtener-elc-id/?" + url).then((n) =>
				n.json()
			);
			// Acciones si el pedido está repetido o no
			if (ELC_id) {
				// Si el pedido está repetido, avisar del error
				!errores ? (errores = {}) : "";
				errores.direccion =
					"El código interno de esta " +
					entidad.selectedOptions[0].label +
					" ya se encuentra en nuestra base de datos";
				accionesSiHayErrores(2, errores);
			} else {
				button.innerHTML = "Avanzar";
			}
		}
	});

	// Mensajes de ayuda
	window.onclick = (e) => {
		for (let i = 0; i < iconosAyuda.length; i++) {
			e.target.matches("#" + iconosAyuda[i].id)
				? mensajesAyuda[i].classList.toggle("ocultar")
				: mensajesAyuda[i].classList.add("ocultar");
		}
	};
});
