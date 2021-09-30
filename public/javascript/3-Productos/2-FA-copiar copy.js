window.addEventListener("load", () => {
	// Declarar las variables de Input
	let rubroAPI = document.querySelector("select[name='rubroAPI']");
	let direccion = document.querySelector("input[name='direccion']");
	let contenido = document.querySelector("textarea[name='contenido']");
	let avatar = document.querySelector("input[name='avatar']");

	// Declarar las variables de Error
	let iconoError = document.querySelectorAll(".fa-times-circle");
	let iconoOK = document.querySelectorAll(".fa-check-circle");
	let mensajeError = document.querySelectorAll(".mensajeError");
	let mensajeAyuda = document.querySelectorAll(".mensajeAyuda");

	// Comportamientos cuando se hace click -------------------------------
	// Detectar si se hizo click en la ventana
	window.onclick = (e) => {
		iconoError[0].classList.contains("ocultar") &&
		iconoOK[0].classList.contains("ocultar")
			? verificarRubro(false)
			: "";
		iconoError[1].classList.contains("ocultar") &&
		iconoOK[1].classList.contains("ocultar")
			? verificarDireccion(false)
			: "";
		iconoError[2].classList.contains("ocultar") &&
		iconoOK[2].classList.contains("ocultar")
			? verificarContenido(false)
			: "";
		// Click en ayuda dirección
		if (e.target.matches("#ayuda_direccion")) {
			mensajeAyuda[0].classList.toggle("ocultar");
			return;
		} else mensajeAyuda[0].classList.add("ocultar");
		// Click en ayuda contenido
		if (e.target.matches("#ayuda_contenido")) {
			mensajeAyuda[1].classList.toggle("ocultar");
			return;
		} else mensajeAyuda[1].classList.add("ocultar");
	};

	// Revisar el data-entry y comunicar los aciertos y errores
	document.querySelector("form").oninput = (e) => {
		e.target.matches("select[name='rubroAPI']")
			? verificarRubro(true)
			: e.target.matches("input[name='direccion']")
			? verificarDireccion(true)
			: verificarContenido(true);
	};

	// Submit
	document.querySelector("form").addEventListener("submit", async (e) => {
		resultado =
			verificarRubro(true) &&
			(await verificarDireccion(true)) &&
			(await verificarContenido(true));
		!resultado ? e.preventDefault() : "";
	});

	// Mensajes de Back-End
	let mensajesBE = document.querySelectorAll("p.ocultar");
	for (let i = 0; i < mensajesBE.length; i++) {
		mensajeError[i].innerHTML = mensajesBE[i].innerHTML;
	}

	// FUNCIONES ******************************
	let verificarRubro = (verificarErrores) => {
		if (rubroAPI.value != "") {
			iconoError[0].classList.add("ocultar");
			iconoOK[0].classList.remove("ocultar");
			return true;
		} else if (verificarErrores) {
			iconoError[0].classList.remove("ocultar");
			mensajeError[0].innerHTML = "Elegí una opción";
			return false;
		}
	};

	let verificarDireccion = async (verificarErrores) => {
		// https://www.filmaffinity.com/es/film596059.html
		// Verificar que sea una dirección de FA *********
		let link = direccion.value;
		if (!link.includes("www.filmaffinity.com/")) {
			if (verificarErrores) {
				iconoError[1].classList.remove("ocultar");
				mensajeError[1].innerHTML =
					"No es una dirección de Film Affinity";
			}
			return false;
		}
		// Obtener el FA_id ******************************
		// Quitar el dominio
		aux = link.indexOf("www.filmaffinity.com/");
		link = link.slice(aux + 21);
		// Quitar el pais
		aux = link.indexOf("/");
		link = link.slice(aux + 5);
		// Quitar el 'html'
		aux = link.indexOf(".html");
		link = link.slice(0, aux);
		fa_id = link;
		// FA_id no repetido en la BD ********************
		let url =
			"/peliculas/agregar/api/prod-fa-en-bd/?" +
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
			return true;
		} else if (verificarErrores) {
			// Resultado inválido
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
		}
		return false;
	};

	let verificarContenido = async (verificarErrores) => {
		// Código de validación **************************
		let campos = contenido.value
			? await procesarContenidoFA(contenido.value)
			: 0;
		// Resultado exitoso *****************************
		if (campos > 0) {
			iconoError[2].classList.add("ocultar");
			iconoOK[2].classList.remove("ocultar");
			return true;
		}
		// Resultado inválido ****************************
		else if (verificarErrores) {
			iconoError[2].classList.remove("ocultar");
			contenido.value == ""
				? (mensajeError[2].innerHTML =
						"Necesitamos que completes esta información")
				: (mensajeError[2].innerHTML =
						"No se puede importar ningún dato");
		}
		return false;
	};
});

const procesarContenidoFA = async (contenido) => {
	// Procesando la información
	let resultado = document.querySelector("#resultado");
	resultado.classList.remove(...resultado.classList);
	resultado.classList.add("resultadoEnEspera");
	resultado.innerHTML = "Procesando la información...";
	// Procesar los datos de la película
	let encodedValue = encodeURIComponent(contenido);
	let url =
		"/peliculas/agregar/api/procesarcontenidofa/?contenido=" + encodedValue;
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
