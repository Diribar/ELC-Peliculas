"use strict";
window.addEventListener("load", () => {

	// Fórmula de revisar input
	let accionesSegunErrores = async (dato) => {
		let link = "/producto/agregar/api/validar-palabras-clave/?palabrasClave=" + dato;
		let respuesta = await fetch(link).then((n) => n.json());
		// Acciones en función de la respuesta
		if (respuesta) {
			// Mostrar errores
			iconoError.classList.remove("ocultar");
			submit.classList.add("inactivo");
			mensajeError.innerHTML = respuesta;
		} else {
			// Ocultar errores
			iconoError.classList.add("ocultar");
			submit.classList.remove("inactivo");
			mensajeError.innerHTML = "";
		}
	};
	let verificar = () => {
		submit.classList.remove("fa-circle-check");
		submit.classList.add("fa-circle-question");
		submit.classList.remove("verde");
		submit.classList.add("naranja");
		submit.title = "Verificar";
		submit.style = "background";
		return;
	};

	let funcionSubmit = async (e) => {
		if (submit.classList.contains("fa-circle-question")) {
			e.preventDefault();
			if (!submit.classList.contains("inactivo")) {
				submit.classList.add("inactivo");
				let link = api_pre(input.value);
				let lectura = await fetch(link).then((n) => n.json());
				api_post(lectura);
				submit.classList.remove("inactivo");
				avanzar();
			}
		} else form.submit();
	};
	let avanzar = () => {
		submit.classList.remove("fa-circle-question");
		submit.classList.add("fa-circle-check");
		submit.classList.remove("naranja");
		submit.classList.add("verde");
		submit.title = "Avanzar";
		return;
	};
	let api_pre = (input) => {
		let palabrasClave = input.trim();
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
		let formatoAnterior;
		let formatoVigente;
		let oracion;
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
					"Hay demasiadas coincidencias (+" + cantResultados + "), intentá ser más específico";
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

	// Revisar el data-entry y comunicar los aciertos y errores
	input.addEventListener("input", async () => {
		verificar();
		resultado.innerHTML = "<br>";
		resultado.classList.remove(...resultado.classList);
		resultado.classList.add("sinResultado");
		accionesSegunErrores(input.value);
	});

	// Submit
	submit.addEventListener("click", async (e) => {
		funcionSubmit(e);
	});
	submit.addEventListener("keydown", async (e) => {
		if (e.key == "Enter" || e.key == "Space") funcionSubmit(e);
	});
	form.addEventListener("submit", (e) => {
		funcionSubmit(e);
	});

	// Status inicial
	if (iconoError.classList.contains("ocultar") && input.value) accionesSegunErrores(input.value);
});
