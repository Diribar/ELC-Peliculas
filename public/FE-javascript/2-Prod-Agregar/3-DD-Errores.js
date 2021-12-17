window.addEventListener("load", async () => {
	// Variables generales
	let form = document.querySelector("#dataEntry");
	let button = document.querySelector("#dataEntry button[type='submit']");
	let inputs = document.querySelectorAll(".input-error .input");
	let iconoError = document.querySelectorAll(".input-error .fa-times-circle");
	let mensajeError = document.querySelectorAll(".input-error .mensajeError");
	// Variables de país
	let selectPais = document.querySelector("#paises_id select");
	if (selectPais) {
		paises = await fetch("/producto/agregar/api/DD-paises").then((n) => n.json());
		inputPais = document.querySelector("#paises_id input[name='paises_id']");
		mostrarPaises = document.querySelector("#dataEntry #paises_id #mostrarPaises");
	} 


	// Revisar el data-entry y comunicar los aciertos y errores
	for (let i = 0; i < inputs.length; i++) {
		// Status inicial
		!iconoError[i].classList.contains("ocultar") ? button.classList.add("botonSinLink") : "";
		// Acciones ante cambios en el input
		inputs[i].addEventListener("input", async () => {
			// Averiguar si hay algún error
			if (selectPais == inputs[i]) {
				funcionPaises()
				campo = "paises_id";
				valor = inputPais.value;
			} else {
				campo = inputs[i].name;
				valor = inputs[i].value;
			}
			errores = await fetch(
				"/producto/agregar/api/validar-datos-duros/?" + campo + "=" + valor
			).then((n) => n.json());
			mensaje = errores[campo];
			// Verificar que el año de fin sea mayor o igual que el de estreno
			if (!mensaje && campo == "ano_fin") {
				inputs.forEach((input, index) => {
					if (input.name == "ano_estreno") indice = index;
				});
				ano_estreno = inputs[indice].value;
				valor < ano_estreno
					? (mensaje =
							"El año de finalización debe ser igual o mayor que el año de estreno")
					: "";
			}
			mensajeError[i].innerHTML = mensaje;
			// Acciones en función de si hay o no mensajes de error
			if (mensaje) {
				iconoError[i].classList.remove("ocultar");
				button.classList.add("botonSinLink");
			} else {
				iconoError[i].classList.add("ocultar");
				button.classList.remove("botonSinLink");
				for (let j = 0; j < inputs.length; j++) {
					if (mensajeError[j].innerHTML) button.classList.add("botonSinLink");
				}
			}
		});
	}

	// Submit
	form.addEventListener("submit", (e) => {
		if (button.classList.contains("botonSinLink")) e.preventDefault();
	});

	let funcionPaises = () => {
		let paisId = selectPais.value;
		// Verificar si figura en inputPais
		let agregar = !inputPais.value.includes(paisId);
		// Si no figura en inputPais, agregárselo
		if (agregar) {
			// Limita la cantidad máxima de países a 1+4 = 5, para permitir el mensaje de error
			if (inputPais.value.length >= 2 * 1 + 4 * 4) return;
			inputPais.value += !inputPais.value ? paisId : ", " + paisId;
		} else {
			// Si sí figura, quitárselo
			paises_idArray = inputPais.value.split(", ");
			indice = paises_idArray.indexOf(paisId);
			paises_idArray.splice(indice, 1);
			inputPais.value = paises_idArray.join(", ");
		}
		// Agregar los países a mostrar
		mostrarPaises.value = "";
		if (inputPais.value) paises_idArray = inputPais.value.split(", ");
		else return;
		for (pais_id of paises_idArray) {
			paisNombre = paises.find((n) => n.id == pais_id).nombre;
			mostrarPaises.value += !mostrarPaises.value ? paisNombre : ", " + paisNombre;
		}
	};
});
