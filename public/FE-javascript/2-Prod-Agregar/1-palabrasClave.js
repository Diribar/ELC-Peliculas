window.addEventListener("load", () => {
	// Declarar las variables
	let form = document.querySelector("#dataEntry");
	let button = document.querySelector("#dataEntry button");
	let input = document.querySelector("#dataEntry input");
	let iconoError = document.querySelector("#dataEntry .fa-circle-xmark");
	let mensajeError = document.querySelector("#dataEntry .mensajeError");
	let resultado = document.querySelector("#dataEntry #resultado");

	// Fórmula de revisar input
	let accionesSiHayErrores = async (dato) => {
		let link = "/producto/agregar/api/validar-palabras-clave/?palabrasClave=" + dato;
		respuesta = await fetch(link).then((n) => n.json());
		// Acciones en función de la respuesta
		if (respuesta) {
			// Mostrar errores
			iconoError.classList.remove("ocultar");
			button.classList.add("botonInactivo");
			mensajeError.innerHTML = respuesta;
		} else {
			// Ocultar errores
			iconoError.classList.add("ocultar");
			button.classList.remove("botonInactivo");
			mensajeError.innerHTML = "";
		}
	};

	// Status inicial
	iconoError.classList.contains("ocultar") && input.value != ""
		? accionesSiHayErrores(input.value)
		: "";

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
			if (!button.classList.contains("botonInactivo")) {
				button.classList.add("botonInactivo");
				let link = api_pre(input.value);
				let lectura = await fetch(link).then((n) => n.json());
				api_post(lectura);
				button.classList.remove("botonInactivo");
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
		return "/producto/agregar/api/PC-cant-prod/?palabrasClave=" + palabrasClave;
	};

	let api_post = async (lectura) => {
		// Averiguar cantidad de coincidencias
		let prod_nuevos = lectura.resultados.filter((n) => n.YaEnBD == false).length;
		let cantResultados = lectura.cantResultados;
		let hayMas = lectura.hayMas;
		// Determinar oracion y formato
		let formatoVigente = "";
		// Resultado exitoso
		if (cantResultados > 0 && !hayMas) {
			oracion =
				"Encontramos " +
				(cantResultados == 1
					? "1 sola coincidencia, que " + (prod_nuevos ? "no" : "ya")
					: cantResultados +
					  " coincidencias, " +
					  (prod_nuevos == cantResultados
							? "y ninguna"
							: prod_nuevos
							? prod_nuevos + " no"
							: "y todas")) +
				" está" +
				(prod_nuevos > 1 && prod_nuevos != cantResultados ? "n" : "") +
				" en nuestra BD";
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
