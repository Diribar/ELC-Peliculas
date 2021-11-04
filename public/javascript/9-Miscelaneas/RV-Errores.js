window.addEventListener("load", async () => {
	// Variables generales
	let form = document.querySelector("#data_entry");
	let button = document.querySelector("#data_entry button[type='submit']");
	let iconoError = document.querySelectorAll(".input-error .fa-times-circle");
	let iconoOK = document.querySelectorAll(".input-error .fa-check-circle");
	let mensajesError = document.querySelectorAll(".input-error .mensajeError");

	// Función para mostrar el ícono de error/acierto y agregar el mensaje de error
	let accionesSiHayErrores = (i, mensajes) => {
		// Averiguar si hay un error
		mensaje = mensajes[i];
		mensajesError[i].innerHTML = mensaje;
		// En caso de error
		mensaje
			? iconoError[i].classList.remove("ocultar")
			: iconoError[i].classList.add("ocultar");
		mensaje
			? iconoOK[i].classList.add("ocultar")
			: iconoOK[i].classList.remove("ocultar");
	};

	// Funcion para revisar todos los errores
	let buscarErroresEnTodoElForm = () => {
		rubro = document.querySelector("#rubro").innerHTML;
		inputs = document.querySelectorAll(".input-error .input");
		url = "?";
		for (let i = 0; i < inputs.length; i++) {
			i > 0 ? (url += "&") : "";
			valor =
				inputs[i].name == "desconocida" || i > 3
					? inputs[i].checked
					: encodeURIComponent(inputs[i].value);
			url += inputs[i].name;
			url += "=";
			url += valor;
		}
		url += "&rubro=" + rubro;
		return fetch("/agregar/api/validar-relacion-con-la-vida/" + url).then((n) => n.json());
	};

	// Detecta si hubo alguna novedad de data-entry
	form.addEventListener("change", async (e) => {
		button.innerHTML = "Verificar";
	});

	// Submit
	form.addEventListener("submit", async (e) => {
		if (button.innerHTML == "Verificar") {
			e.preventDefault();
			// Actualizar los errores
			errores = await buscarErroresEnTodoElForm();
			mensajes = Object.values(errores);
			for (i = 0; i < iconoError.length; i++) {
				accionesSiHayErrores(i, mensajes);
			}
			if (!errores.hay) button.innerHTML = "Avanzar";
		}
	});
});
