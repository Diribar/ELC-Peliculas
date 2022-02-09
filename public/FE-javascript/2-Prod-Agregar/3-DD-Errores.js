window.addEventListener("load", async () => {
	// Variables generales
	let form = document.querySelector("#dataEntry");
	let button = document.querySelector("#dataEntry button[type='submit']");
	let entidad = document.querySelector("#dataEntry #entidad").innerHTML;
	let inputs = document.querySelectorAll(".input-error .input");
	let iconoError = document.querySelectorAll(".input-error .fa-times-circle");
	let mensajesError = document.querySelectorAll(".input-error .mensajeError");

	// Campos combinados - nombre_original
	let nombre_original = document.querySelector("#dataEntry input[name='nombre_original']");
	let iconoErrorNO = document.querySelector(".input-error .fa-times-circle.nombre_original");
	let mensajesErrorNO = document.querySelector(".input-error .mensajeError.nombre_original");
	// Campos combinados - nombre_castellano
	let nombre_castellano = document.querySelector("#dataEntry input[name='nombre_castellano']");
	let iconoErrorNC = document.querySelector(".input-error .fa-times-circle.nombre_castellano");
	let mensajesErrorNC = document.querySelector(".input-error .mensajeError.nombre_castellano");
	// Campos combinados - ano_estreno
	let ano_estreno = document.querySelector("#dataEntry input[name='ano_estreno']");
	let mensajesErrorAE = document.querySelector(".input-error .mensajeError.ano_estreno");

	// Variables de país
	let selectPais = document.querySelector("#paises_id select");
	if (selectPais) {
		paises = Array.from(document.querySelectorAll("#paises_id select option")).map((n) => {
			return {id: n.value, nombre: n.innerHTML};
		});
		mostrarPaises = document.querySelector("#paises_id #mostrarPaises"); // Lugar donde mostrar los nombres
		inputPais = document.querySelector("#paises_id input[name='paises_id']"); // Lugar donde almacenar los ID
	}

	// Otras variables
	let ruta = "/producto/agregar/api/validar-datos-duros/?";

	// Botón 'submit'
	let botonSubmit = () => {
		Array.from(mensajesError).find((n) => n.innerHTML)
			? button.classList.add("botonSinLink")
			: button.classList.remove("botonSinLink");
	};

	// Status inicial
	botonSubmit();

	// Campos combinados
	form.addEventListener("change", async (e) => {
		campo = e.target.name;
		if (
			(campo == "nombre_original" || campo == "ano_estreno") &&
			nombre_original.value &&
			!mensajesErrorNO.innerHTML &&
			ano_estreno.value &&
			!mensajesErrorAE.innerHTML
		)
			funcionChange("nombre_original", nombre_original.value);
		if (
			(campo == "nombre_castellano" || campo == "ano_estreno") &&
			nombre_castellano.value &&
			!mensajesErrorNC.innerHTML &&
			ano_estreno.value &&
			!mensajesErrorAE.innerHTML
		)
			funcionChange("nombre_castellano", nombre_castellano.value);
	});

	// Revisar data-entries 'input' y comunicar los aciertos y errores
	for (let i = 0; i < inputs.length; i++) {
		inputs[i].addEventListener("input", async (e) => {
			// Definir los valores para 'campo' y 'valor'
			if (e.target == selectPais) {
				funcionPaises();
				campo = "paises_id";
				valor = inputPais.value;
			} else {
				campo = e.target.name;
				valor = e.target.value;
			}

			// Averiguar si hay algún error
			let errores = await fetch(ruta + campo + "=" + valor).then((n) => n.json());
			if (e.target == selectPais) campo = "paises_id";
			mensajesError[i].innerHTML = errores[campo];

			// Acciones en función de si hay o no mensajes de error
			if (mensajesError[i].innerHTML) {
				iconoError[i].classList.remove("ocultar");
				button.classList.add("botonSinLink");
			} else {
				iconoError[i].classList.add("ocultar");
				botonSubmit();
			}
		});
	}

	// Submit
	form.addEventListener("submit", (e) => {
		if (button.classList.contains("botonSinLink")) e.preventDefault();
	});

	// Funciones
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

	let funcionChange = async (campo, valor) => {
		// Obtener el mensaje para el campo
		dato1 = "entidad=" + entidad;
		dato2 = campo + "=" + valor;
		dato3 = "ano_estreno=" + ano_estreno.value;
		let mensaje = await fetch(ruta + dato1 + "&" + dato2 + "&" + dato3).then((n) => n.json());
		if (mensaje) mensaje = mensaje[campo];
		// Impactar en la vista
		campo == "nombre_original"
			? (mensajesErrorNO.innerHTML = mensaje)
			: (mensajesErrorNC.innerHTML = mensaje);
		// Acciones en función de si hay o no mensajes de error
		if (mensaje) {
			campo == "nombre_original"
				? iconoErrorNO.classList.remove("ocultar")
				: iconoErrorNC.classList.remove("ocultar");
			button.classList.add("botonSinLink");
		} else {
			campo == "nombre_original"
				? iconoErrorNO.classList.add("ocultar")
				: iconoErrorNC.classList.add("ocultar");
			botonSubmit();
		}
	};
});
