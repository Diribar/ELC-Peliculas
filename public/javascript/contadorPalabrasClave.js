window.addEventListener("load", () => {
	// Declarar las variables
	let palabras_clave = document.querySelector("input");
	let despues = palabras_clave.value;
	let form = document.getElementById("data_entry");
	let button = document.querySelector("button");

	// Verificar o Avanzar
	form.addEventListener("submit", (e) => {
		e.preventDefault();
		if (button.innerHTML == "Verificar") {
			if (despues != palabras_clave.value) {
				despues = palabras_clave.value;
				contador(palabras_clave.value);
			}
			button.innerHTML = "Avanzar";
		} else {
			if (button.innerHTML == "Avanzar") {
				e.currentTarget.submit();
			}
		}
	});

	// Actualizar ante cambios en el input
	palabras_clave.addEventListener("keyup", () => {
		if (
			palabras_clave.value.length == 0 ||
			palabras_clave.value != despues
		) {
			button.innerHTML = "Verificar";
			borrarComentario();
		}
	});
});

const contador = async (palabras_clave) => {
	let resultadoDeBusqueda = document.querySelector("#resultadoDeBusqueda");
	let palabras_clave_original = palabras_clave;
	palabras_clave = palabras_clave.trim().replace(/ /g, "-");
	if (palabras_clave.length > 1) {
		// Procesando la información
		resultadoDeBusqueda.innerHTML = "Procesando la información...";
		resultadoDeBusqueda.classList.remove("resultadoExitoso");
		resultadoDeBusqueda.classList.add("resultadoInvalido");
		// Obtener el link
		let link = "/peliculas/api/contador1/?palabras_clave=" + palabras_clave;
		// Averiguar cantidad de coincidencias
		let lectura = await fetch(link).then((n) => n.json());
		// Determinar oracion y formato
		let oracion = "";
		let formatoVigente = "";
		// Resultado exitoso
		if (lectura.cantResultados > 0 && !lectura.hayMas) {
			lectura.cantResultados > 1 ? (s = "s") : (s = "");
			oracion =
				"Encontramos " + lectura.cantResultados + " coincidencia" + s;
			formatoVigente = "resultadoExitoso";
			formatoAnterior = "resultadoInvalido";
		} else {
			// Resultados inválidos
			formatoVigente = "resultadoInvalido";
			formatoAnterior = "resultadoExitoso";
			if (lectura.hayMas) {
				oracion =
					"Hay demasiadas coincidencias, intentá ser más específico";
			} else {
				if (lectura.cantResultados == 0) {
					oracion = "No encontramos coincidencias con estas palabras";
				}
			}
		}
		resultadoDeBusqueda.innerHTML = oracion;
		resultadoDeBusqueda.classList.add(formatoVigente);
		resultadoDeBusqueda.classList.remove(formatoAnterior);
	}
};

const borrarComentario = () => {
	document.querySelector("#resultadoDeBusqueda").innerHTML = "";
	document.querySelector("#resultadoDeBusqueda").classList.remove("resultadoInvalido");
	document.querySelector("#resultadoDeBusqueda").classList.remove("resultadoExitoso");
}