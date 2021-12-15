window.addEventListener("load", async () => {
	// Variables generales
	let form = document.querySelector("#dataEntry");
	let button = document.querySelector("#dataEntry button[type='submit']");
	let inputs = document.querySelectorAll(".input-error .input");
	let iconoError = document.querySelectorAll(".input-error .fa-times-circle");
	let iconoOK = document.querySelectorAll(".fa-check-circle");
	let mensajesError = document.querySelectorAll(".input-error .mensajeError");
	let links = document.querySelectorAll(".input-error a.link");
	let statusInicial = true;

	// Anula/activa el botón 'Submit', muestra el ícono de error/acierto
	let accionesSiHayErrores = (i, errores) => {
		// Averiguar si hay un error
		campo = inputs[i].name;
		valor = encodeURIComponent(inputs[i].value);
		mensaje = errores[campo];
		mensajesError[i].innerHTML = mensaje;
		// En caso de error
		mensaje
			? iconoError[i].classList.remove("ocultar")
			: iconoError[i].classList.add("ocultar");
		mensaje
			? iconoOK[i].classList.add("ocultar")
			: valor
			? iconoOK[i].classList.remove("ocultar")
			: "";
		errores.hay
			? button.classList.add("botonSinLink")
			: button.classList.remove("botonSinLink");
	};

	// Busca losvalores de todo el formulario, para hacer un análisis global
	let buscarTodosLosValores = () => {
		for (let i = 0; i < inputs.length; i++) {
			i == 0 ? (url = "/?") : (url += "&");
			url += inputs[i].name;
			url += "=";
			url += encodeURIComponent(inputs[i].value);
		}
		return url;
	};

	// Funciones para revisar todos los inputs, devuelve los errores
	let buscarErroresEnTodoElForm = () => {
		let url = buscarTodosLosValores();
		return fetch("/producto/agregar/api/validar-datos-pers" + url).then((n) => n.json());
	};

	// Status inicial
	if (statusInicial) {
		errores = await buscarErroresEnTodoElForm();
		for (let i = 0; i < inputs.length; i++) {
			inputs[i].value != "" ? accionesSiHayErrores(i, errores) : "";
		}
		statusInicial = false;
	}

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
				entidad_RCLV = "historicos_personajes";
				producto_RCLV = "Personaje Histórico";
			} else {
				entidad_RCLV = "historicos_hechos";
				producto_RCLV = "Hecho Histórico";
			}
			let url = buscarTodosLosValores();
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
