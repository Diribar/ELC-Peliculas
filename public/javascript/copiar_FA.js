window.addEventListener("load", () => {
	// Declarar las variables
	let contenido = document.querySelector("textarea");
	let despues = contenido.value;
	let form = document.querySelector("form");
	let button = document.querySelector("button");
	let iconoAyuda = document.querySelectorAll(".fa-question-circle");
	let mensajeAyuda = document.querySelectorAll(".mensajeAyuda");

	// Verificar o Avanzar
	form.addEventListener("submit", async (e) => {
		e.preventDefault();
		let valor = contenido.value;
		if (button.innerHTML == "Verificar" && valor) {
			if (despues != contenido.value) {
				despues = contenido.value;
				lectura = await procesarContenido(contenido.value);
				console.log(lectura)
			}
			button.innerHTML = "Avanzar";
		} else {
			if (button.innerHTML == "Avanzar" && valor) {
				e.currentTarget.submit();
			}
		}
	});

	// "Verificar" ante cambios en el input
	contenido.addEventListener("keyup", () => {
		if (
			contenido.value.length == 0 ||
			contenido.value != despues
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
		console.log(!e.target.matches("#direccion"));
		!e.target.matches("#direccion")
			? mensajeAyuda[0].classList.add("ocultar")
			: "";
		!e.target.matches("#contenido")
			? mensajeAyuda[1].classList.add("ocultar")
			: "";
	};
});

const procesarContenido = async (contenido) => {
	// Procesando la información
	let resultadoDeBusqueda = document.querySelector("#resultadoDeBusqueda");
	resultadoDeBusqueda.innerHTML = "Procesando la información...";
	// Procesar los datos de la película
	let encodedValue = encodeURIComponent(contenido);
	let url =
		"/peliculas/agregar/api/procesarcopiado/?contenido=" + encodedValue;
	let lectura = await fetch(url).then((n) => n.json());
	// Información procesada
	resultadoDeBusqueda.innerHTML = "";
	resultadoDeBusqueda.classList.replace("mostrar", "ocultar");
	return lectura;
}

const borrarComentario = () => {
	document.querySelector("#resultadoDeBusqueda").innerHTML = "";
	document
		.querySelector("#resultadoDeBusqueda")
		.classList.remove("resultadoInvalido");
	document
		.querySelector("#resultadoDeBusqueda")
		.classList.remove("resultadoExitoso");
};
