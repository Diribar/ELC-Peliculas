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
		// Determinar oracion y formato
		let formatoVigente = "";
		// Resultado exitoso
		if (lectura.cantResultados > 0 && !lectura.hayMas) {
			lectura.cantResultados > 1 ? (s1 = "s") : (s1 = "");
			oracion1 = "Encontramos " + lectura.cantResultados + " coincidencia" + s1 +", ";
			prod_nuevos > 1 ? (s2 = "s") : (s2 = "");
			prod_nuevos == lectura.cantResultados
				? s2 == ""
					? (oracion2 = "que ya está en nuestra BD")
					: (oracion2 = "todas ya están en nuestra BD")
				: prod_nuevos
				? s2 == ""
					? (oracion2 = "sólo 1 no está en nuestra BD")
					: (oracion2 = prod_nuevos + " no están en nuestra BD")
				: s1 == ""
				? (oracion2 = "que no está en nuestra BD")
				: (oracion2 = "ninguna está en nuestra BD");
			oracion = oracion1 + oracion2
			formatoVigente = "resultadoExitoso";
			formatoAnterior = "resultadoInvalido";
		} else {
			// Resultados inválidos
			formatoVigente = "resultadoInvalido";
			formatoAnterior = "resultadoExitoso";
			if (lectura.hayMas) {
				oracion =
					"Hay demasiadas coincidencias (+" +
					lectura.cantResultados +
					"), intentá ser más específico";
			} else {
				if (lectura.cantResultados == 0) {
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
