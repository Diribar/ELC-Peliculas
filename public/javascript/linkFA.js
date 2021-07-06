window.addEventListener("load", () => {
	// Declarar las variables
	let url = document.querySelector("input");
	let despues = url.value;
	let form = document.getElementById("data_entry");
	let button = document.querySelector("button");
	let iconoAyuda = document.querySelectorAll(".fa-question-circle");
	let mensajeAyuda = document.querySelectorAll(".mensajeAyuda");

	// Verificar o Avanzar
	form.addEventListener("submit", (e) => {
		e.preventDefault();
		let ID = ID(url.value);
		if (button.innerHTML == "Verificar" && ID) {
			if (despues != url.value) {
				despues = url.value;
				buscar(ID);
			}
			button.innerHTML = "Avanzar";
		} else {
			if (button.innerHTML == "Avanzar") {
				e.currentTarget.submit();
			}
		}
	});

	// "Verificar" ante cambios en el input
	url.addEventListener("keyup", () => {
		if (
			url.value.length == 0 ||
			url.value != despues
		) {
			button.innerHTML = "Verificar";
			borrarComentario();
		}
	});

	// Detectar si se hace "click" en Ayuda
	for (let i=0; i<iconoAyuda.length; i++) {
		iconoAyuda[i].addEventListener("click", () => {
			mensajeAyuda[i].classList.toggle("ocultar");
		});
	}

	// Cerrar los dropdowns en desuso
	window.onclick = (e) => {
		!e.target.matches("#pasos")
			? mensajeAyuda[0].classList.add("ocultar")
			: "";
		!e.target.matches("#ejemplo")
			? mensajeAyuda[1].classList.add("ocultar")
			: "";
	};

});

const contador = async (url) => {
	let resultadoDeBusqueda = document.querySelector("#resultadoDeBusqueda");
	url = url.trim()
	if (url.length > 1) {
		// Procesando la información
		resultadoDeBusqueda.innerHTML = "Procesando la información...";
		resultadoDeBusqueda.classList.remove("resultadoExitoso");
		resultadoDeBusqueda.classList.add("resultadoInvalido");
		// Obtener el url
		let url = "/peliculas/agregar/api/contador/?url=" + url;
		// Averiguar cantidad de coincidencias
		let lectura = await fetch(url).then((n) => n.json());
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
};

const ID = (url) => {
	//https://www.filmaffinity.com/ar/film515226.html
	if (url.length < 29) return false, 0;
	// Quitar el prefijo "www.filmaffinity.com/xx/film"
	let comienzo = url.indexOf("www.filmaffinity.com/");
	if (comienzo < 0) return false, 0;
	url = url.slice(comienzo + 21);
	comienzo = url.indexOf("/film");
	if (comienzo < 0) return false, 0;
	url = url.slice(comienzo + 5);
	// Quitar el sufijo ".html"
	comienzo = url.indexOf(".html");
	comienzo > 0 ? (url = url.slice(0, comienzo)) : "";
	// Terminación
	//console.log(!isNaN(url));
	if (isNaN(url)) return false;
	let ID = parseInt(url);
	console.log(ID);
	return ID;
}