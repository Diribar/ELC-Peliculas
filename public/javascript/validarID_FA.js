window.addEventListener("load", () => {
	// Declarar las variables
	let url = document.querySelector("input");
	let despues = url.value;
	let form = document.getElementById("data_entry");
	let button = document.querySelector("button");
	let iconoAyuda = document.querySelectorAll(".fa-question-circle");
	let mensajeAyuda = document.querySelectorAll(".mensajeAyuda");

	// Verificar o Avanzar
	form.addEventListener("submit", async (e) => {
		e.preventDefault();
		let ID = obtenerID(url.value);
		if (button.innerHTML == "Verificar" && ID) {
			if (despues != url.value) {
				despues = url.value;
				lectura = await buscarPorID(ID);
				console.log(lectura)
			}
			button.innerHTML = "Avanzar";
		} else {
			if (button.innerHTML == "Avanzar" && ID) {
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
