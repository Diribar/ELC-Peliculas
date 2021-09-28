window.addEventListener("load", () => {
	// Variables generales
	let inputs = document.querySelectorAll(".formulario-grupo .input");
	let marcas = document.querySelectorAll(
		".formulario-grupo .fa-times-circle"
	);
	console.log(marcas[0])
	let mensajes = document.querySelectorAll(".formulario-grupo .mensajeError");
	//console.log(inputs)

	for (let i = 0; i < inputs.length; i++) {
		// Acciones si se realizan cambios
		inputs[i].addEventListener("change", async () => {
			campo = inputs[i].name;
			valor = inputs[i].value;
			errores = await fetch(
				"/peliculas/agregar/api/validarDatosDuros/?" +
					campo +
					"=" +
					valor
			).then((n) => n.json());
			error = errores[campo];
			console.log(error);
			mensajes[i].innerHTML = error;
			error
				? marcas[i].classList.remove("ocultar")
				: marcas[i].classList.add("ocultar");
			console.log(marcas[i]);
		});
	}
});
