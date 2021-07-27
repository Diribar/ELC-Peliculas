window.addEventListener("load", () => {
	// Declarar las variables de Input
	let rubroAPI = document.querySelector("select[name='rubroAPI']");
	let direccion = document.querySelector("input[name='direccion']");
	let contenido = document.querySelector("textarea[name='contenido']");

	// Declarar las variables de Error
	let iconoError = document.querySelectorAll(".fa-times-circle");
	let mensajeError = document.querySelectorAll(".mensajeError");

	// Comportamientos cuando se hace click
	window.onclick = (e) => {
		ayuda(e);
		clickFueraDeRubroApi(e);
		clickFueraDeDireccion(e);
		clickFueraDeContenido(e);
	};

	// Comportamientos cuando se oprimen teclas
	window.onkeydown = (e) => {
		bloquearDireccion(e);
		bloquearComentario(e);
		//rubroAPI.value != "" ? direccion.classList.remove("bloqueado") : "";
	};

	// Revisar el data-entry y comunicar los errores
	document.querySelector("form").oninput = (e) => {
		e.target.matches("select[name='rubroAPI']") ? dataRubroApi() : "";
		e.target.matches("input[name='direccion']") ? dataDireccion() : "";
		e.target.matches("textarea[name='contenido']") ? dataContenido() : "";
	};

	// FUNCIONES ******************************
	// Mensajes de Back-End
	let mostrarMensajesBE = () => {
		let mensajesBE = document.querySelectorAll("p.ocultar");
		for (let i = 0; i < mensajesBE.length; i++) {
			mensajeError[i].innerHTML = mensajesBE[i].innerHTML;
		}
	};
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
	let clickFueraDeContenido = (e) => {
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
			// Se intenta escribir en Dirección
			// rubroApi tiene algún error
			e.target.matches("input[name='direccion']") &&
			!iconoError[0].classList.value.includes("ocultar")
		) {
			e.preventDefault();
		}
	};
	let bloquearComentario = (e) => {
		if (
			// Se intenta escribir en Comentario
			// rubroApi o Dirección tienen algún error
			e.target.matches("textarea[name='contenido']") &&
			(!iconoError[0].classList.value.includes("ocultar") ||
				!iconoError[1].classList.value.includes("ocultar"))
		) {
			e.preventDefault();
		}
	};
	let dataRubroApi = () => {
		if (rubroAPI.value != "") {
			iconoError[0].classList.add("ocultar");
			direccion.classList.remove("bloqueado");
		}
	};
	let dataDireccion = () => {
		if (direccion.value != "") {
			// Reemplazar por "no hay error"
			iconoError[1].classList.add("ocultar");
			contenido.classList.remove("bloqueado");
		}
	};
	let dataContenido = () => {
		if (contenido.value != "") {
			// Reemplazar por "no hay error"
			iconoError[2].classList.add("ocultar");
		}
	};

	// Tareas iniciales
	mostrarMensajesBE();
	direccion.classList.add("bloqueado");
	contenido.classList.add("bloqueado");
});
