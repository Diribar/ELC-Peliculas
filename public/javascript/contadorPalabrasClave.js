window.addEventListener("load", () => {
	// Declarar las variables
	let palabras_clave = document.querySelector("input");
	var resultadoDeBusqueda = document.querySelector("#resultadoDeBusqueda");
	var antes = "";
	var despues = "";

	// Actualizar ante cambios en el input
	palabras_clave.addEventListener("keyup", () => {
		while (true) {
			antes = palabras_clave.value;
			if (antes == despues) {
				break;
			}
			contador(antes, resultadoDeBusqueda);
			despues = palabras_clave.value;
		}
	});
});

const contador = async (palabras_clave, resultadoDeBusqueda) => {
	let palabras = palabras_clave.trim();
	if (palabras.length > 1) {
		// Obtener el link
		palabras_clave = palabras.replace(/ /g, "-");
		let link = "/peliculas/api/contador1/?palabras_clave=" + palabras_clave;
		// Averiguar cantidad de coincidencias
		let cantidad = await fetch(link).then((n) => n.json());
		//console.log(cantidad);
		// Determinar oracion y formato
		let oracion = "";
		let formatoVigente = "";
		// Resultado exitoso
		if (cantidad.menor > 0 && !cantidad.masDe20) {
			cantidad.menor < cantidad.mayor
				? (frase = "entre " + cantidad.menor + " y " + cantidad.mayor)
				: (frase = cantidad.mayor);
			cantidad.mayor > 1 ? (s = "s") : (s = "");
			oracion = "Encontramos " + frase + " coincidencia" + s;
			formatoVigente = "resultadoExitoso";
			formatoAnterior = "resultadoInvalido";
		} else {
			// Resultados inválidos
			formatoVigente = "resultadoInvalido";
			formatoAnterior = "resultadoExitoso";
			if (cantidad.masDe20) {
				oracion =
				"Hay demasiadas coincidencias, intentá ser más específico";
			} else {
				if (cantidad.menor == 0) {
					oracion = "No encontramos coincidencias con estas palabras";
				}
			}
		}
		resultadoDeBusqueda.innerHTML = oracion;
		resultadoDeBusqueda.classList.add(formatoVigente);
		resultadoDeBusqueda.classList.remove(formatoAnterior);
	}
};
