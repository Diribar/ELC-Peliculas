window.addEventListener("load", () => {
	// Declarar las variables
	let form = document.getElementById("data_entry");
	let button = document.querySelector("button");
	let input = document.querySelector("input");
	let iconoError = document.querySelector(".fa-times-circle");
	let mensajeError = document.querySelector(".mensajeError");
	let mensajeAyuda = document.querySelector(".mensajeAyuda");
	let resultado = document.querySelector("#resultado");

	// Fórmula de revisar input
	let accionesSiHayErrores = async (dato) => {
		let link =
			"/agregar/productos/api/palabras-clave/?palabrasClave=" + dato;
		respuesta = await fetch(link).then((n) => n.json());
		// Acciones en función de la respuesta
		if (respuesta) {
			// Mostrar errores
			iconoError.classList.remove("ocultar");
			button.classList.add("botonSinLink");
			mensajeError.innerHTML = respuesta;
		} else {
			// Ocultar errores
			iconoError.classList.add("ocultar");
			button.classList.remove("botonSinLink");
			mensajeError.innerHTML = "";
		}
	};

	// Status inicial
	iconoError.classList.contains("ocultar") && input.value != ""
		? accionesSiHayErrores(input.value)
		: "";

	// Mensaje de ayuda
	window.onclick = (e) => {
		e.target.matches(".fa-question-circle")
			? mensajeAyuda.classList.toggle("ocultar")
			: mensajeAyuda.classList.add("ocultar");
	};

	// Revisar el data-entry y comunicar los aciertos y errores
	input.addEventListener("input", async () => {
		button.innerHTML = "Verificar";
		resultado.innerHTML = "<br>";
		resultado.classList.remove(...resultado.classList);
		resultado.classList.add("sinResultado");
		accionesSiHayErrores(input.value);
	});

	// Submit
	form.addEventListener("submit", async (e) => {
		if (button.innerHTML == "Verificar") {
			e.preventDefault();
			if (!button.classList.contains("botonSinLink")) {
				button.classList.add("botonSinLink");
				let link = api_pre(input.value);
				let lectura = await fetch(link).then((n) => n.json());
				api_post(lectura);
				button.classList.remove("botonSinLink");
				button.innerHTML = "Avanzar";
			}
		}
	});

	let api_pre = (input) => {
		palabrasClave = input.trim();
		// Procesando la información
		resultado.innerHTML = "Procesando la información...";
		resultado.classList.remove(...resultado.classList);
		resultado.classList.add("resultadoEnEspera");
		// Obtener el link
		return (
			"/agregar/productos/api/averiguar-cant-prod/?palabrasClave=" +
			palabrasClave
		);
	};

	let api_post = async (lectura) => {
		// Averiguar cantidad de coincidencias
		let prod_nuevos = lectura.resultados.filter(
			(n) => n.YaEnBD == false
		).length;
		let cantResultados = lectura.cantResultados;
		let hayMas = lectura.hayMas;
		// Determinar oracion y formato
		let formatoVigente = "";
		// Resultado exitoso
		if (cantResultados > 0 && !hayMas) {
			oracion =
				cantResultados == 1
					? "Encontramos 1 sola coincidencia, que " +
					  (prod_nuevos
							? "no está en nuestra BD"
							: "ya está en nuestra BD")
					: "Encontramos " +
					  cantResultados +
					  " coincidencias, " +
					  (prod_nuevos == cantResultados
							? "ninguna está en nuestra BD"
							: prod_nuevos
							? prod_nuevos +
							  " no está" +
							  (prod_nuevos == 1 ? "" : "n") +
							  " en nuestra BD"
							: "y todas están en nuestra BD");
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
					oracion = "No encontramos coincidencias con estas palabras";
				}
			}
		}
		resultado.innerHTML = oracion;
		resultado.classList.remove(...resultado.classList);
		resultado.classList.add(formatoVigente);
	};
});
