window.addEventListener("load", () => {
	// Declarar las variables de Input
	let rubroAPI = document.querySelector("select[name='rubroAPI']");
	let direccion = document.querySelector("input[name='direccion']");
	let contenido = document.querySelector("textarea[name='contenido']");

	// Declarar las variables de Error
	let iconoError = document.querySelectorAll(".fa-times-circle");
	let iconoOK = document.querySelectorAll(".fa-check-circle");
	let mensajeError = document.querySelectorAll(".mensajeError");

	// Comportamientos cuando se oprimen teclas
	window.onkeydown = (e) => {
		bloquearDireccion(e);
		bloquearComentario(e);
	};

	// Comportamientos cuando se hace click
	window.onclick = (e) => {
		ayuda(e);
		clickFueraDeRubroApi(e);
		clickFueraDeDireccion(e);
		clickFueraDeContenido(e);
	};

	// Revisar el data-entry y comunicar los errores
	document.querySelector("form").oninput = (e) => {
		e.target.matches("select[name='rubroAPI']") ? dataRubroApi() : "";
		e.target.matches("input[name='direccion']") ? dataDireccion() : "";
		e.target.matches("textarea[name='contenido']") ? dataContenido() : "";
	};

	// Submit
	document.querySelector("form").onsubmit =  async (e) => {
		for (let i=0; i<iconoOK.length; i++) {
			if (iconoOK[i].classList.value.includes("ocultar")) {
				e.preventDefault();
				return;
			}
		}
	}
	
	// Mensajes de Back-End
	let mensajesBE = document.querySelectorAll("p.ocultar");
	for (let i = 0; i < mensajesBE.length; i++) {
		mensajeError[i].innerHTML = mensajesBE[i].innerHTML;
	}

	// FUNCIONES ******************************
	// Mensajes de ayuda
	let ayuda = (e) => {
		let mensajeAyuda = document.querySelectorAll(".mensajeAyuda");
		e.target.matches("#ayuda_direccion")
			? mensajeAyuda[0].classList.toggle("ocultar")
			: mensajeAyuda[0].classList.add("ocultar");
		e.target.matches("#ayuda_contenido")
			? mensajeAyuda[1].classList.toggle("ocultar")
			: mensajeAyuda[1].classList.add("ocultar");
	};
	// Click fuera del input Rubro API
	let clickFueraDeRubroApi = (e) => {
		if (
			// Si se hace click fuera de RubroAPI
			// Si RubroAPI está vacía
			!e.target.matches("select[name='rubroAPI']") &&
			rubroAPI.value == ""
		) {
			iconoError[0].classList.remove("ocultar");
			mensajeError[0].innerHTML = "Elegí una opción";
		}
	};
	// Click fuera del input Dirección
	let clickFueraDeDireccion = (e) => {
		if (
			// Si se hace click fuera de RubroApi y de Dirección
			// Si rubroApi está OK
			// Si Dirección está vacía
			!e.target.matches("select[name='rubroAPI']") &&
			!e.target.matches("input[name='direccion']") &&
			!iconoOK[0].classList.value.includes("ocultar") &&
			direccion.value == ""
		) {
			iconoError[1].classList.remove("ocultar");
			mensajeError[1].innerHTML =
				"Necesitamos que completes esta información";
		}
	};
	// Click fuera del input Contenido
	let clickFueraDeContenido = (e) => {
		if (
			// Si se hace click fuera de RubroApi y de Dirección y de Contenido
			// Si rubroApi y Dirección están OK
			// Si Contenido está vacía
			!e.target.matches("select[name='rubroAPI']") &&
			!e.target.matches("input[name='direccion']") &&
			!e.target.matches("textarea[name='contenido']") &&
			!iconoOK[0].classList.value.includes("ocultar") &&
			!iconoOK[1].classList.value.includes("ocultar") &&
			contenido.value == ""
		) {
			iconoError[2].classList.remove("ocultar");
			mensajeError[2].innerHTML =
				"Necesitamos que completes esta información";
		}
	};
	let bloquearDireccion = (e) => {
		// RubroApi no está OK
		if (iconoOK[0].classList.value.includes("ocultar")) {
			!!e && e.target.matches("input[name='direccion']")
				? e.preventDefault()
				: "";
			direccion.value = "";
		} else {
			direccion.classList.remove("bloqueado");
		}
	};
	let bloquearComentario = (e) => {
		if (
			// RubroApi o Dirección no están OK
			iconoOK[0].classList.value.includes("ocultar") ||
			iconoOK[1].classList.value.includes("ocultar")
		) {
			// console.log("contenido bloqueado");
			!!e && e.target.matches("textarea[name='contenido']")
				? e.preventDefault()
				: "";
			contenido.value = "";
		} else {
			// console.log("contenido permitido");
			contenido.classList.remove("bloqueado");
		}
	};
	let dataRubroApi = () => {
		if (rubroAPI.value != "") {
			iconoError[0].classList.add("ocultar");
			iconoOK[0].classList.remove("ocultar");
			direccion.classList.remove("bloqueado");
		}
	};
	let dataDireccion = async () => {
		// RubroApi no está OK
		if (iconoOK[0].classList.value.includes("ocultar")) {
			direccion.value = "";
			return;
		}
		// https://www.filmaffinity.com/es/film596059.html
		// Verificar que sea una dirección de FA
		let link = direccion.value;
		if (!link.includes("www.filmaffinity.com/")) {
			iconoError[1].classList.remove("ocultar");
			mensajeError[1].innerHTML = "No es una dirección de Film Affinity";
			return;
		}
		// Obtener el FA_id
		// Quitar el dominio
		aux = link.indexOf("www.filmaffinity.com/");
		link = link.slice(aux + 21);
		// Quitar el pais
		aux = link.indexOf("/");
		link = link.slice(aux + 5);
		// Quitar el 'html'
		aux = link.indexOf(".html");
		link = link.slice(0, aux);
		fa_id = link
		// FA_id no repetido en la BD
		let url =
			"/peliculas/agregar/api/averiguar-producto-ya-en-bd-fa/?" +
			"rubroAPI=" +
			rubroAPI.value +
			"&fa_id=" +
			fa_id;
		let id = await fetch(url).then((n) => n.json());
		// Respuesta
		// Resultado exitoso
		if (!id) {
			iconoError[1].classList.add("ocultar");
			iconoOK[1].classList.remove("ocultar");
			contenido.classList.remove("bloqueado");
		// Resultado inválido
		} else {
			iconoError[1].classList.remove("ocultar");
			rubro = rubroAPI.value == "movie" ? "película" : "colección";
			mensajeError[1].innerHTML =
				"La " +
				rubro +
				" ya está en nuestra BD. Hacé click " +
				"<a href='/peliculas/agregar/ya-en-bd?rubroAPI=" +
				rubroAPI.value +
				"&id=" +
				id +
				"'><u><strong>acá</strong></u></a>" +
				" para ver el detalle";
			return;
		}
	};
	let dataContenido = async () => {
		if (
			// RubroApi o Dirección no están OK
			iconoOK[0].classList.value.includes("ocultar") ||
			iconoOK[1].classList.value.includes("ocultar")
		) {
			contenido.value = "";
		}
		// Código de validación
		let campos = await procesarContenidoFA(contenido.value);
		// Respuesta
		// Resultado exitoso
		if (campos > 0) {
			iconoError[2].classList.add("ocultar");
			iconoOK[2].classList.remove("ocultar");
		// Resultado inválido
		} else {
			iconoError[2].classList.remove("ocultar");
			contenido.value == ""
				? (mensajeError[2].innerHTML =
						"Necesitamos que completes esta información")
				: (mensajeError[2].innerHTML =
						"No se puede importar ningún dato");
		}
		return
	};

});

const procesarContenidoFA = async (contenido) => {
	// Procesando la información
	let resultadoDeBusqueda = document.querySelector("#resultadoDeBusqueda");
	resultadoDeBusqueda.classList.remove("resultadoExitoso");
	resultadoDeBusqueda.classList.remove("resultadoInvalido");
	resultadoDeBusqueda.classList.add("resultadoEnEspera");
	resultadoDeBusqueda.innerHTML = "Procesando la información...";
	// Procesar los datos de la película
	let encodedValue = encodeURIComponent(contenido);
	let url =
		"/peliculas/agregar/api/procesarcontenidofa/?contenido=" +
		encodedValue;
	let lectura = await fetch(url).then((n) => n.json());
	// Información procesada
	let campos = Object.keys(lectura).length;
	resultadoDeBusqueda.classList.remove("resultadoEnEspera");
	if (campos) {
		campos == 1 ? mensaje = "Se obtuvo 1 solo dato" : "";
		campos > 1 ? (mensaje = "Se obtuvieron " + campos + " datos") : "";
		resultadoDeBusqueda.classList.add("resultadoExitoso");

	} else {
		if (contenido != "") {
			mensaje = "No se obtuvo ningún dato"
			resultadoDeBusqueda.classList.add("resultadoInvalido")
		} else {
			mensaje = "<br>"
		}
	}
	resultadoDeBusqueda.innerHTML = mensaje;
	return campos;
};
