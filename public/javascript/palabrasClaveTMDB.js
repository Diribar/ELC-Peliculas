window.addEventListener("load", () => {
	// Declarar las variables
	let palabras_clave = document.querySelector("input");
	let form = document.getElementById("data_entry");
	let button = document.querySelector("button");
	let mensajeAyuda = document.querySelector(".mensajeAyuda");
	let resultado = document.querySelector("#resultado");

	// 'Verificar' ante cambios en el input
	palabras_clave.addEventListener("input", () => {
		button.innerHTML = "Verificar";
		borrarComentario();
	});

	// 'Verificar' o 'Avanzar'
	form.addEventListener("submit", (e) => {
		if (button.innerHTML == "Verificar") {
			e.preventDefault();
			if (palabras_clave.value.length > 1) {
				contador(palabras_clave.value);
				button.innerHTML = "Avanzar";
			}
		}
	});

	// Mensajes de ayuda
	window.onclick = (e) => {
		e.target.matches(".fa-question-circle")
			? mensajeAyuda.classList.toggle("ocultar")
			: mensajeAyuda.classList.add("ocultar");
	};

	let contador = async (palabras_clave) => {
		palabras_clave = palabras_clave.trim();
		if (palabras_clave.length > 1) {
			// Procesando la información
			resultado.innerHTML = "Procesando la información...";
			resultado.classList.remove(...resultado.classList);
			resultado.classList.add("resultadoEnEspera");
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
			resultado.innerHTML = oracion;
			resultado.classList.remove(...resultado.classList);
			resultado.classList.add(formatoVigente);
		}
	};

	let borrarComentario = () => {
		resultado.innerHTML = "<br>";
		resultado.classList.remove(...resultado.classList);
		resultado.classList.add("sinResultado");
	};
});
