window.addEventListener("load", () => {
	// Declarar las variables
	let palabras_clave = document.querySelector("input");
	let rubro = document.querySelector("select");
	var resultadoDeBusqueda = document.querySelector("#resultadoDeBusqueda");

	// Actualizar ante cambios en el input
	palabras_clave.addEventListener("input", () => {
		contador(palabras_clave, rubro, resultadoDeBusqueda);
	});

	// Actualizar ante cambios en el rubro
	rubro.addEventListener("input", () => {
		contador(palabras_clave, rubro, resultadoDeBusqueda);
	});
})

const contador = async (palabras_clave, rubro, resultadoDeBusqueda) => {
	// Averiguar cantidad de coincidencias
	let palabras = palabras_clave.value.trim();
	if (palabras.length > 1) {
		let rubroTMDB = "";
		rubro.value == "peliculas"
			? (rubroTMDB = "movie")
			: (rubroTMDB = "collection");
		palabras_clave = palabras.replace(/ /g, "-");
		let link =
			"/peliculas/api/contador/?palabras_clave=" +
			palabras_clave +
			"&rubro=" +
			rubroTMDB;
		cantidad = await fetch(link).then((n) => n.json());
		// Determinar frase y formato
		let frase = "";
		let formatoVigente = "";
		// Resultado exitoso
		if (cantidad > 0 && cantidad <= 20) {
			cantidad > 1 ? (s = "s") : (s = "");
			frase = "Encontramos " + cantidad + " coincidencia" + s;
			formatoVigente = "resultadoExitoso";
			formatoAnterior = "resultadoInvalido";
		} else {
			// Resultados inválidos
			formatoVigente = "resultadoInvalido";
			formatoAnterior = "resultadoExitoso";
			if (cantidad == 0) {
				frase = "No encontramos coincidencias con estas palabras";
			} else if (cantidad > 20) {
				frase = "Hay más de 20 coincidencias, intentá ser más específico";
			}
		}
		resultadoDeBusqueda.innerHTML = frase;
		resultadoDeBusqueda.classList.add(formatoVigente);
		resultadoDeBusqueda.classList.remove(formatoAnterior);
	}
};