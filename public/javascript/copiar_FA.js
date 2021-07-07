window.addEventListener("load", () => {
	// Declarar las variables
	let contenido = document.querySelector("textarea");
	let despues = contenido.value;
	let form = document.querySelector("form");
	let button = document.querySelector("button");
	let iconoAyuda = document.querySelector(".fa-question-circle");
	let mensajeAyuda = document.querySelector(".mensajeAyuda");

	// Verificar o Avanzar
	form.addEventListener("submit", async (e) => {
		e.preventDefault();
		let valor = contenido.value;
		if (button.innerHTML == "Verificar" && valor) {
			if (despues != contenido.value) {
				despues = contenido.value;
				await procesarContenido(contenido.value);
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
	iconoAyuda.addEventListener("click", () => {
		mensajeAyuda.classList.toggle("ocultar");
	});

	// Cerrar los dropdowns en desuso
	window.onclick = (e) => {
		!e.target.matches("#pasos")
			? mensajeAyuda.classList.add("ocultar")
			: "";
	};

});

const procesarContenido = async (input) => {
	// Procesando la información
	let resultadoDeBusqueda = document.querySelector("#resultadoDeBusqueda");
	resultadoDeBusqueda.innerHTML = "Procesando la información...";
	// Obtener los datos de la película
	console.log("línea 60");
	console.log(input)
	console.log("")
	let url = "/peliculas/agregar/api/procesarcopiado/?input=" + input;
	//await fetch(url);
	//let lectura = await fetch(url).then((n) => n.json());
	// Información procesada
	resultadoDeBusqueda.innerHTML = "";
	resultadoDeBusqueda.classList.replace("mostrar", "ocultar");
	return
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
