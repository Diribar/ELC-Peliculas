window.addEventListener("load", async () => {
	// Variables generales
	let form = document.querySelector("#dataEntry");
	let button = document.querySelector("#dataEntry button[type='submit']");
	let entidad = document.querySelector("#dataEntry #entidad").innerHTML;
	let inputs = document.querySelectorAll(".input-error .input");
	let iconoError = document.querySelectorAll(".input-error .fa-times-circle");
	let mensajesError = document.querySelectorAll(".input-error .mensajeError");
	// Campos a controlar
	let ruta = "/producto/agregar/api/campos-DD-a-verificar/?datos=";
	let datosDuros_input = await fetch(ruta + "input");
	console.log(datosDuros_input);
	let datosDuros_change = await fetch(ruta + "change");
	// Variables de país
	let selectPais = document.querySelector("#paises_id select");
	if (selectPais) {
		paises = Array.from(document.querySelectorAll("#paises_id select option")).map((n) => {
			return {id: n.value, nombre: n.innerHTML};
		});
		mostrarPaises = document.querySelector("#paises_id #mostrarPaises"); // Lugar donde mostrar los nombres
		inputPais = document.querySelector("#paises_id input[name='paises_id']"); // Lugar donde almacenar los ID
	}

	// Revisar el data-entry y comunicar los aciertos y errores
	for (let i = 0; i < inputs.length; i++) {
		// Status inicial
		!iconoError[i].classList.contains("ocultar") ? button.classList.add("botonSinLink") : "";
		// Acciones ante cambios en el input
		inputs[i].addEventListener("input", async () => {
			// Averiguar si hay algún error
			if (selectPais && selectPais == inputs[i]) {
				funcionPaises();
				campo = "paises_id";
				valor = inputPais.value;
			} else {
				campo = inputs[i].name;
				valor = inputs[i].value;
			}
			let ruta = "/producto/agregar/api/validar-datos-duros-input/?entidad=" + entidad + "&";
			let errores = await fetch(ruta + campo + "=" + valor).then((n) => n.json());
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
			mensajesError[i].innerHTML = mensaje;
			// Acciones en función de si hay o no mensajes de error
			if (mensaje) {
				iconoError[i].classList.remove("ocultar");
				button.classList.add("botonSinLink");
			} else {
				iconoError[i].classList.add("ocultar");
				Array.from(mensajesError).find((n) => n.innerHTML)
					? button.classList.add("botonSinLink")
					: button.classList.remove("botonSinLink");
			}
		});
	}

	// Submit
	form.addEventListener("submit", (e) => {
		if (button.classList.contains("botonSinLink")) e.preventDefault();
	});

	let funcionPaises = () => {
		let paisId = selectPais.value;
		if (paisId == "borrar") {
			selectPais.value = "";
			mostrarPaises.value = "";
			inputPais.value = "";
			return;
		}
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
		paisesNombre = "";
		if (inputPais.value) {
			paises_idArray = inputPais.value.split(", ");
			for (pais_id of paises_idArray) {
				paisNombre = paises.find((n) => n.id == pais_id).nombre;
				paisesNombre += (paisesNombre ? ", " : "") + paisNombre;
			}
		}
		mostrarPaises.value = paisesNombre;
	};
});
