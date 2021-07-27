window.addEventListener("load", () => {
	// Declarar las variables
	let palabras_clave = document.querySelector("input");
	let form = document.getElementById("data_entry");
	let button = document.querySelector("button");
	let mensajeAyuda = document.querySelector(".mensajeAyuda");
	let resultadoDeBusqueda = document.querySelector("#resultadoDeBusqueda");

	// "Verificar" ante cambios en el input
	palabras_clave.addEventListener("input", () => {
		button.innerHTML = "Verificar";
		borrarComentario();
	});

	// Cerrar los dropdowns en desuso
	window.onclick = (e) => {
		e.target.matches(".fa-question-circle")
			? mensajeAyuda.classList.toggle("ocultar")
			: mensajeAyuda.classList.add("ocultar");
	};

	// Verificar o Avanzar
	form.addEventListener("submit", (e) => {
		if (button.innerHTML == "Verificar") {
			e.preventDefault();
			if (palabras_clave.value.length > 1) {
				contador(palabras_clave.value);
				button.innerHTML = "Avanzar";
			}
		}
	});

	const contador = async (palabras_clave) => {
		palabras_clave = palabras_clave.trim();
		if (palabras_clave.length > 1) {
			// Procesando la información
			resultadoDeBusqueda.innerHTML = "Procesando la información...";
			resultadoDeBusqueda.classList.remove("resultadoExitoso");
			resultadoDeBusqueda.classList.remove("resultadoInvalido");
			resultadoDeBusqueda.classList.remove("sinResultado");
			resultadoDeBusqueda.classList.add("resultadoEnEspera");
			// Obtener el link
			let link =
				"/peliculas/agregar/api/contador/?palabras_clave=" +
				palabras_clave;
			// Averiguar cantidad de coincidencias
			let lectura = await fetch(link).then((n) => n.json());
			let prod_nuevos = lectura.resultados.filter(
				(n) => n.YaEnBD != false
			).length;
			let cantResultados = lectura.cantResultados;
			let hayMas = lectura.hayMas;
			// Determinar oracion y formato
			let formatoVigente = "";
			// Resultado exitoso
			if (cantResultados > 0 && !hayMas) {
				oracion =
					cantResultados == 1
						? "Encontramos 1 sola coincidencia, " +
						  (prod_nuevos
								? "que no está en nuestra BD"
								: "que ya está en nuestra BD")
						: "Encontramos " +
						  cantResultados +
						  " coincidencias, " +
						  (prod_nuevos == cantResultados
								? "ninguna está en nuestra BD"
								: prod_nuevos
								? prod_nuevos + " no están en nuestra BD"
								: "que ya están todas en nuestra BD");
				formatoVigente = "resultadoExitoso";
				formatoAnterior = "resultadoInvalido";
			} else {
				// Resultados inválidos
				formatoVigente = "resultadoInvalido";
				formatoAnterior = "resultadoExitoso";
				if (hayMas) {
					oracion =
						"Hay demasiadas coincidencias (+" +
						cantResultados +
						"), intentá ser más específico";
				} else {
					if (cantResultados == 0) {
						oracion =
							"No encontramos coincidencias con estas palabras";
					}
				}
			}
			resultadoDeBusqueda.innerHTML = oracion;
			resultadoDeBusqueda.classList.remove("resultadoEnEspera");
			resultadoDeBusqueda.classList.remove(formatoAnterior);
			resultadoDeBusqueda.classList.add(formatoVigente);
		}
	};

	const borrarComentario = () => {
		resultadoDeBusqueda.innerHTML = "<br>";
		resultadoDeBusqueda.classList.remove("resultadoInvalido");
		resultadoDeBusqueda.classList.remove("resultadoExitoso");
		resultadoDeBusqueda.classList.add("sinResultado");
	};
});
