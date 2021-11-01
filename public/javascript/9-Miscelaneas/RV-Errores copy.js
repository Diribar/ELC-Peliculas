window.addEventListener("load", async () => {
	// Variables generales
	let form = document.querySelector("#data_entry");
	let button = document.querySelector("#data_entry button[type='submit']");
	let inputs = document.querySelectorAll(".input-error .input");
	let iconoError = document.querySelectorAll(".input-error .fa-times-circle");
	let iconoOK = document.querySelectorAll(".fa-check-circle");
	let mensajesError = document.querySelectorAll(".input-error .mensajeError");
	let statusInicial = true;
	let desconocida = document.querySelector("form input[name='desconocida']");

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

	// Funciones para revisar todos los errores
	let buscarErroresEnTodoElForm = () => {
		url = "?";
		for (let i = 0; i < inputs.length; i++) {
			i > 0 ? (url += "&") : "";
			url += inputs[i].name;
			url += "=";
			url += encodeURIComponent(inputs[i].value);
		}
		return fetch("/agregar/api/validarPersonaje/" + url).then((n) =>
			n.json()
		);
	};

	// Status inicial
	if (statusInicial) {
		errores = await buscarErroresEnTodoElForm();
		for (let i = 0; i < inputs.length; i++) {
			inputs[i].value != "" ? accionesSiHayErrores(i, errores) : "";
		}
		statusInicial = false;
	}

	// Submit
	form.addEventListener("submit", async (e) => {
		if (button.classList.contains("botonSinLink")) {
			e.preventDefault();
			errores = await buscarErroresEnTodoElForm();
			console.log(errores);
			for (let i = 0; i < inputs.length; i++) {
				accionesSiHayErrores(i, errores);
			}
		}
	});
});
