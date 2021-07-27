window.addEventListener("load", () => {
	// Declarar las variables
	let palabras_clave = document.querySelector("input");
	let despues = "";
	let form = document.getElementById("data_entry");
	let button = document.querySelector("button");
	let iconoAyuda = document.querySelector(".fa-question-circle");
	let mensajeAyuda = document.querySelector(".mensajeAyuda");

	// Verificar o Avanzar
	form.addEventListener("submit", (e) => {
		e.preventDefault();
		if (
			button.innerHTML == "Verificar" &&
			palabras_clave.value.length > 1
		) {
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

	// "Verificar" ante cambios en el input
	palabras_clave.addEventListener("keyup", () => {
		if (
			palabras_clave.value.length == 0 ||
			palabras_clave.value != despues
		) {
			button.innerHTML = "Verificar";
			borrarComentario();
		}
	});

	// Detectar si se hace "click" en Ayuda
	iconoAyuda.addEventListener("click", () => {
		mensajeAyuda.classList.toggle("ocultar");
	});

	// Cerrar los dropdowns en desuso
	window.onclick = (e) => {
		!e.target.matches(".fa-question-circle")
			? mensajeAyuda.classList.add("ocultar")
			: "";
	};

});

const contador = async (palabras_clave) => {
	let resultadoDeBusqueda = document.querySelector("#resultadoDeBusqueda");
	palabras_clave = palabras_clave.trim()
	if (palabras_clave.length > 1) {
		// Procesando la información
		resultadoDeBusqueda.innerHTML = "Procesando la información...";
		resultadoDeBusqueda.classList.remove("resultadoExitoso");
		resultadoDeBusqueda.classList.remove("resultadoInvalido");
		resultadoDeBusqueda.classList.remove("sinResultado");
		resultadoDeBusqueda.classList.add("resultadoEnEspera");
		// Obtener el link
		let link = "/peliculas/agregar/api/contador/?palabras_clave=" + palabras_clave;
		// Averiguar cantidad de coincidencias
		let lectura = await fetch(link).then((n) => n.json());
		let prod_nuevos = lectura.resultados.filter((n) => n.YaEnBD != false).length;
		let cantResultados = lectura.cantResultados;
		let hayMas = lectura.hayMas;
		// Determinar oracion y formato
		let formatoVigente = "";
		// Resultado exitoso
		if (cantResultados > 0 && !hayMas) {
			oracion = (cantResultados == 1)
				? ("Encontramos 1 sola coincidencia, " +
					((prod_nuevos)
						? "que no está en nuestra BD"
						: "que ya está en nuestra BD"))
				: ("Encontramos " + cantResultados + " coincidencias, " +
					((prod_nuevos == cantResultados)
						? "ninguna está en nuestra BD"
						: ((prod_nuevos)
							? prod_nuevos + " no están en nuestra BD"
							: "que ya están todas en nuestra BD")))
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
		resultadoDeBusqueda.innerHTML = oracion;
		resultadoDeBusqueda.classList.remove("resultadoEnEspera");
		resultadoDeBusqueda.classList.remove(formatoAnterior);
		resultadoDeBusqueda.classList.add(formatoVigente);
	}
};

const borrarComentario = () => {
	let resultadoDeBusqueda = document.querySelector("#resultadoDeBusqueda");
	resultadoDeBusqueda.innerHTML = "<br>";
	resultadoDeBusqueda.classList.remove("resultadoInvalido");
	resultadoDeBusqueda.classList.remove("resultadoExitoso");
	resultadoDeBusqueda.classList.add("sinResultado");
};
