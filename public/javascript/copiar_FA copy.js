window.addEventListener("load", () => {
	// Declarar las variables de input
	let rubroAPI = document.querySelector('select[name="rubroAPI"]');
	let direccion = document.querySelector('input[name="direccion"]');
	let contenido = document.querySelector('textarea[name="contenido"]');

	let despues = contenido.value;
	let form = document.querySelector("form");
	let button = document.querySelector("button");
	let iconoAyuda = document.querySelectorAll(".fa-question-circle");
	let mensajeAyuda = document.querySelectorAll(".mensajeAyuda");
	let iconoError = document.querySelectorAll(".fa-times-circle");
	let mensajeError = document.querySelectorAll(".mensajeError");

	// Verificar o Avanzar
	form.addEventListener("submit", async (e) => {
		e.preventDefault();
		let valor = contenido.value;
		if (valor) {
			if (despues != contenido.value) {
				despues = contenido.value;
				lectura = await procesarContenidoFA(contenido.value);
				console.log(lectura)
			}
		} else {
			if (valor) {
				e.currentTarget.submit();
			}
		}
	});

	// Validar ante cambios en los inputs
	contenido.addEventListener("keyup", () => {
		if (
			contenido.value.length == 0 ||
			contenido.value != despues
		) {
			borrarComentario();
		}
	});

});

const procesarContenidoFA = async (contenido) => {
	// Procesando la información
	let resultadoDeBusqueda = document.querySelector("#resultadoDeBusqueda");
	resultadoDeBusqueda.innerHTML = "Procesando la información...";
	// Procesar los datos de la película
	let encodedValue = encodeURIComponent(contenido);
	let url =
		"/peliculas/agregar/api/procesarcontenidofa/?contenido=" + encodedValue;
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
