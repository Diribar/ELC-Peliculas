window.addEventListener("load", async () => {
	// Variables
	let form = document.querySelector("#data_entry");
	let button = document.querySelector("form button[type='submit']");
	let inputs = document.querySelectorAll("#data_entry .input");
	let iconoError = document.querySelectorAll(".fa-times-circle");
	let mensajesError = document.querySelectorAll(".mensajeError");
	let mensajesAyuda = document.querySelectorAll(".mensajeAyuda");
	let iconoOK = document.querySelectorAll(".fa-check-circle");
	let iconosAyuda = document.querySelectorAll(".fa-question-circle");
	let resultado = document.querySelector("#resultado");
	let statusInicial = true;

	// Fórmulas
	let mostrarSecciones = (campo, valor, mensaje) => {
		if (campo != "rubroAPI" && campo != "direccion") return;
		// Declarar funciones
		let rubroAPI = document.querySelector("select[name='rubroAPI']").value;
		let sectDireccion = document.querySelector("#data_entry section#id");
		let sectEnColeccion = document.querySelector("section#enColeccion");
		let sectImagenMasCuerpo = document.querySelector("#imagenMasCuerpo");
		// Campo 'rubroAPI'
		if (campo == "rubroAPI") {
			// Acciones
			sectDireccion.classList.remove("ocultar");
			if (valor == "collection") {
				sectEnColeccion.classList.add("ocultar");
				sectImagenMasCuerpo.classList.remove("ocultar");
			} else if (valor == "movie") {
				sectEnColeccion.classList.remove("ocultar");
				sectImagenMasCuerpo.classList.add("ocultar");
			}
		}
		// Campo 'direccion web'
		if (campo == "direccion" && rubroAPI == "movie" && mensaje == "") {
			pre = "/productos/agregar/api/";
			FA_id = fetch(pre + "obtener-fa-id/" + valor).then((n) => n.json());
			enColeccion = FA_id
				? fetch(pre + "coleccion-fa-id/" + FA_id).then((n) => n.json())
				: "";
			// enColeccion
			// 	?
			// 	:
		}
	};
	let revisarInput = (i, errores) => {
		// Averiguar si hay un error
		campo = inputs[i].name;
		valor = encodeURIComponent(inputs[i].value);
		mensaje = errores[campo];
		mensajesError[i].innerHTML = mensaje;
		// Mostrar secciones
		mostrarSecciones(campo, valor, mensaje);
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
			button.classList.remove("botonSinLink");
			for (let j = 0; j < inputs.length; j++) {
				iconoOK[j].classList.contains("ocultar")
					? button.classList.add("botonSinLink")
					: "";
			}
		}
	};
	let comentarioContenido = (campos, valor) => {
		resultado.classList.remove(...resultado.classList);
		// Formatos
		campos
			? resultado.classList.add("resultadoExitoso")
			: valor != ""
			? resultado.classList.add("resultadoInvalido")
			: "";
		// Mensaje
		resultado.innerHTML = campos
			? campos == 1
				? "Se obtuvo 1 solo dato"
				: "Se obtuvieron " + campos + " datos"
			: valor != ""
			? "No se obtuvo ningún dato"
			: "<br>";
	};
	let validarDataEntry = () => {
		url = "?";
		for (let i = 0; i < inputs.length; i++) {
			i > 0 ? (url += "&") : "";
			url += inputs[i].name;
			url += "=";
			url += encodeURIComponent(inputs[i].value);
		}
		return fetch("/productos/agregar/api/validar-copiar-fa/" + url).then(
			(n) => n.json()
		);
	};

	// Status inicial
	if (statusInicial) {
		errores = await validarDataEntry();
		for (let i = 0; i < inputs.length; i++) {
			inputs[i].value != "" ? revisarInput(i, errores) : "";
		}
		statusInicial = false;
	}

	// Revisar el data-entry y comunicar los aciertos y errores
	for (let i = 0; i < inputs.length; i++) {
		inputs[i].addEventListener("input", async () => {
			errores = await validarDataEntry();
			revisarInput(i, errores);
		});
	}

	// Submit
	form.addEventListener("submit", (e) => {
		button.classList.contains("botonSinLink") ? e.preventDefault() : "";
	});

	// Mensajes de ayuda
	window.onclick = (e) => {
		// Mensajes de ayuda
		for (let i = 0; i < iconosAyuda.length; i++) {
			e.target.matches("#" + iconosAyuda[i].id)
				? mensajesAyuda[i].classList.toggle("ocultar")
				: mensajesAyuda[i].classList.add("ocultar");
		}
	};
});
