window.addEventListener("load", () => {
	// Declarar las variables de Input
	let rubroAPI = document.querySelector("select[name='rubroAPI']");
	let direccion = document.querySelector("input[name='direccion']");
	let contenido = document.querySelector("textarea[name='contenido']");

	// Oscurecer los inputs posteriores
	direccion.classList.add("bloqueado");
	contenido.classList.add("bloqueado");

	// Declarar las variables de Error
	let iconoError = document.querySelectorAll(".fa-times-circle");
	let mensajeError = document.querySelectorAll(".mensajeError");
	let mensajeBE = document.querySelectorAll("p.ocultar");

	// Declarar otras variables
	let mensajeAyuda = document.querySelectorAll(".mensajeAyuda");

	// Comportamientos cuando se hace click
	window.onclick = (e) => {
		ayuda(e);
		errorRubroApi(e);
		errorDireccion(e);
		errorContenido(e);
	};

	// Validar ante cambios en los inputs
	window.onkeydown = (e) => {
		//bloquearDireccion(e);
		//rubroAPI.value != "" ? direccion.classList.remove("bloqueado") : "";
	};

	// FUNCIONES ******************************
	// Mensajes de ayuda
	let ayuda = (e) => {
		e.target.matches("#ayuda_direccion")
			? mensajeAyuda[0].classList.toggle("ocultar")
			: mensajeAyuda[0].classList.add("ocultar");
		e.target.matches("#ayuda_contenido")
			? mensajeAyuda[1].classList.toggle("ocultar")
			: mensajeAyuda[1].classList.add("ocultar");
	};

	// Click fuera del input Rubro API
	let errorRubroApi = (e) => {
		if (
			// Si se hace click fuera de RubroAPI
			// Si RubroAPI está vacía
			(!e.target.matches("select[name='rubroAPI']") &&
				rubroAPI.value == "") ||
			// Si hay un error de Back-End
			mensajeBE[0].innerHTML != ""
		) {
			iconoError[0].classList.remove("ocultar");
			mensajeError[0].innerHTML = "Elegí una opción";
		}
	};

	// Click fuera del input Dirección
	let errorDireccion = (e) => {
		if (
			// Si se hace click fuera de RubroApi y de Dirección
			// Si rubroApi no tiene errores
			// Si rubroApi tiene info
			// Si Dirección está vacía
			!e.target.matches("select[name='rubroAPI']") &&
			!e.target.matches("input[name='direccion']") &&
			iconoError[0].classList.value.includes("ocultar") &&
			rubroAPI.value != "" &&
			direccion.value == ""
		) {
			iconoError[1].classList.remove("ocultar");
			mensajeError[1].innerHTML =
				"Necesitamos que completes esta información";
		}
	};

	// Click fuera del input Contenido
	let errorContenido = (e) => {
		if (
			// Si se hace click fuera de RubroApi y de Dirección y de Contenido
			// Si rubroApi y Dirección no tienen errores
			// Si rubroApi y Dirección tienen info
			// Si Contenido está vacía
			!e.target.matches("select[name='rubroAPI']") &&
			!e.target.matches("input[name='direccion']") &&
			!e.target.matches("textarea[name='contenido']") &&
			iconoError[0].classList.value.includes("ocultar") &&
			iconoError[1].classList.value.includes("ocultar") &&
			rubroAPI.value != "" &&
			direccion.value != "" &&
			contenido.value == ""
		) {
			iconoError[2].classList.remove("ocultar");
			mensajeError[2].innerHTML =
				"Necesitamos que completes esta información";
		}
	};

	let bloquearDireccion = (e) => {
		if (
			(e.target.matches("input[name='direccion']") &&
				rubroAPI.value == "") ||
			mensajeBE[1].innerHTML != ""
		) {
			e.preventDefault();
		}
	};
});

