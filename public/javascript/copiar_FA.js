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

	// Error en el input Rubro API
	let errorRubroApi = (e) => {
		if (
			// Si se hace click fuera de RubroAPI y esta está vacía
			(!e.target.matches("select[name='rubroAPI']") &&
				rubroAPI.value == "") ||
			// Si hay un error de Back-End
			mensajeBE[0].innerHTML != ""
		) {
			iconoError[0].classList.remove("ocultar");
			mensajeError[0].innerHTML =
				mensajeBE[0].innerHTML != ""
					? mensajeBE[0].innerHTML // Si hay un error de Back-End
					: "Elegí una opción"; // Si no hay un error de Back-End
		} else {
			// Si rubroApi no tiene errores
			iconoError[0].classList.add("ocultar");
		}
	};

	// Error en el input Dirección
	let errorDireccion = (e) => {
		if (
			// Si rubroApi no tiene errores
			// Si se hace click fuera de Dirección y esta está vacía
			(!e.target.matches("select[name='rubroAPI']") &&
				iconoError[0].classList.value.includes("ocultar") &&
				rubroAPI.value != "" &&
				!e.target.matches("input[name='direccion']") &&
				direccion.value == "") ||
			// Si hay un error de Back-End
			mensajeBE[1].innerHTML != ""
		) {
			iconoError[1].classList.remove("ocultar");
			mensajeError[1].innerHTML =
				mensajeBE[1].innerHTML != ""
					? mensajeBE[1].innerHTML // Si hay un error de Back-End
					: "Necesitamos que completes esta información"; // Si no hay un error de Back-End
		} else {
			// Si dirección no tiene errores
			iconoError[1].classList.add("ocultar");
		}
		//iconoError[1].classList.remove("ocultar");
		console.log(iconoError[1].classList);
	};

	// Error en el input Contenido
	let errorContenido = (e) => {
		if (
			// Si rubroApi no tiene errores
			// Si Contenido no tiene errores
			// Si se hace click fuera de Contenido y esta está vacía
			(!e.target.matches("select[name='rubroAPI']") &&
				iconoError[0].classList.value.includes("ocultar") &&
				rubroAPI.value != "" &&
				iconoError[1].classList.value.includes("ocultar") &&
				direccion.value != "" &&
				!e.target.matches("textarea[name='contenido']") &&
				contenido.value == "") ||
			// Si hay un error de Back-End
			mensajeBE[1].innerHTML != ""
		) {
			iconoError[1].classList.remove("ocultar");
			mensajeError[1].innerHTML =
				mensajeBE[1].innerHTML != ""
					? mensajeBE[1].innerHTML // Si hay un error de Back-End
					: "Necesitamos que completes esta información"; // Si no hay un error de Back-End
		} else {
			// Si dirección no tiene errores
			iconoError[1].classList.add("ocultar");
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

