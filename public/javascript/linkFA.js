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
				buscarPorID(ID);
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

const buscarPorID = async (ID) => {
	// Procesando la información
	let resultadoDeBusqueda = document.querySelector("#resultadoDeBusqueda");
	resultadoDeBusqueda.innerHTML = "Procesando la información...";
	// Obtener los datos de la película
	let url = "/peliculas/agregar/api/buscarPorID/?ID=" + ID;
	let lectura = await fetch(url).then((n) => n.json());
	// Información procesada
	resultadoDeBusqueda.innerHTML = "";
	resultadoDeBusqueda.classList.replace("mostrar", "ocultar");
	return lectura
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