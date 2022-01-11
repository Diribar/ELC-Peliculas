window.addEventListener("load", async () => {
	// Variables generales
	let form = document.querySelector("#dataEntry");
	let button = document.querySelector("#dataEntry button[type='submit']");
	let inputs = document.querySelectorAll(".input-error .input");
	let iconoError = document.querySelectorAll(".input-error .fa-times-circle");
	let iconoOK = document.querySelectorAll(".fa-check-circle");
	let mensajesError = document.querySelectorAll(".input-error .mensajeError");
	let links = document.querySelectorAll(".input-error a.link");

	// Funciones ********************************************************************
	// Función para anular/activar el botón 'Submit'
	// Los aciertos de los 'select' están configurados como invisibles en la vista (EJS)
	let accionesSiHayErrores = (i, errores) => {
		// Averiguar si hay un error
		campo = inputs[i].name;
		valor = encodeURIComponent(inputs[i].value);
		mensaje = errores[campo];
		mensajesError[i].innerHTML = mensaje;
		// En caso de error
		if (mensaje) {
			iconoError[i].classList.remove("ocultar");
			iconoOK[i].classList.add("ocultar");
		} else {
			iconoError[i].classList.add("ocultar");
			valor ? iconoOK[i].classList.remove("ocultar") : "";
		}
		errores.hay
			? button.classList.add("botonSinLink")
			: button.classList.remove("botonSinLink");
	};

	// Función para buscar los valores del formulario
	let buscarTodosLosValores = () => {
		for (let i = 0; i < inputs.length; i++) {
			i == 0 ? (url = "/?") : (url += "&");
			url += inputs[i].name;
			url += "=";
			url += encodeURIComponent(inputs[i].value);
		}
		return url;
	};

	// Función para revisar todos los inputs, devuelve los errores
	let buscarErroresEnTodoElForm = () => {
		let url = buscarTodosLosValores();
		return fetch("/producto/agregar/api/validar-datos-pers" + url).then((n) => n.json());
	};

	// Status inicial ********************************************************************
	let errores = await buscarErroresEnTodoElForm();
	for (let i = 0; i < inputs.length; i++) {
		if (inputs[i].value) accionesSiHayErrores(i, errores);
	}

	// Rutinas on-line *********************************************************************

	// Revisa un data-entry en particular (el modificado) y comunica si está OK o no
	for (let i = 0; i < inputs.length; i++) {
		inputs[i].addEventListener("input", async () => {
			errores = await buscarErroresEnTodoElForm();
			accionesSiHayErrores(i, errores);
		});
	}

	// Submit
	form.addEventListener("submit", async (e) => {
		if (button.classList.contains("botonSinLink")) {
			e.preventDefault();
			errores = await buscarErroresEnTodoElForm();
			for (let i = 0; i < inputs.length; i++) {
				accionesSiHayErrores(i, errores);
			}
		}
	});

	// Links a Relación con la vida
	for (let i = 0; i < links.length; i++) {
		links[i].addEventListener("click", (e) => {
			e.preventDefault();
			if (links[i].className.includes("personaje")) {
				entidad_RCLV = "RCLV_personajes_historicos";
				producto_RCLV = "Personaje Histórico";
			} else if (links[i].className.includes("hecho")) {
				entidad_RCLV = "RCLV_hechos_historicos";
				producto_RCLV = "Hecho Histórico";
			} else {
				entidad_RCLV = "RCLV_valores";
				producto_RCLV = "Valor";
			}
			// Para preservar los valores ingresados hasta el momento
			let url = buscarTodosLosValores();
			// Para ir a la vista RCLV
			window.location.href =
				"/agregar/relacion-vida" +
				url +
				"&entidad_RCLV=" +
				entidad_RCLV +
				"&producto_RCLV=" +
				producto_RCLV;
		});
	}
});
