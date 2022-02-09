window.addEventListener("load", async () => {
	// Variables generales
	let form = document.querySelector("#dataEntry");
	let submit = document.querySelector("#dataEntry button[type='submit']");
	// Datos
	let inputs = document.querySelectorAll(".input-error .input");
	let campos = Array.from(inputs).map((n) => n.name);
	// OK/Errores
	let iconoOK = document.querySelectorAll(".fa-check-circle");
	let iconoError = document.querySelectorAll(".input-error .fa-times-circle");
	let mensajesError = document.querySelectorAll(".input-error .mensajeError");
	// Otras variables
	let ruta = "/producto/agregar/api/validar-datos-pers/?";

	// Averiguar si hubieron cambios
	form.addEventListener("input", async (e) => {
		// Definir los valores para 'campo' y 'valor'
		let campo = e.target.name;
		let valor = e.target.value;
		let indice = campos.indexOf(campo);
		// Averiguar si hay algún error
		let errores = await fetch(ruta + campo + "=" + valor).then((n) => n.json());
		if (errores[campo] != undefined) {
			mensajesError[indice].innerHTML = errores[campo];
			if (errores[campo]) {
				iconoOK[indice].classList.add("ocultar");
				iconoError[indice].classList.remove("ocultar");
			} else {
				iconoOK[indice].classList.remove("ocultar");
				iconoError[indice].classList.add("ocultar");
			}
		}
		// Esta función está definida en '4-DP-Subcat'
		if (campo == "subcategoria_id") await funcionRCLV();
		// Fin
		botonSubmit();
	});

	// Submit
	form.addEventListener("submit", async (e) => {
		if (submit.classList.contains("botonSinLink")) {
			e.preventDefault();
			statusInicial((inputValue = false));
		}
	});

	// Funciones
	let statusInicial = async (inputValue) => {
		//Buscar todos los valores
		let url = "";
		for (input of inputs) {
			if (input != inputs[0]) url += "&";
			url += input.name + "=";
			url += encodeURIComponent(input.value);
		}
		let errores = await fetch(ruta + url).then((n) => n.json());
		for (input of inputs) {
			if (inputValue ? input.value : true) {
				// Averiguar si hay un error
				campo = input.name;
				indice = campos.indexOf(campo);
				mensaje = errores[campo];
				mensajesError[indice].innerHTML = mensaje;
				// En caso de error
				if (mensaje != undefined) {
					mensaje
						? iconoError[indice].classList.remove("ocultar")
						: iconoError[indice].classList.add("ocultar");
					mensaje
						? iconoOK[indice].classList.add("ocultar")
						: iconoOK[indice].classList.remove("ocultar");
				}
			}
		}
	};
	let botonSubmit = () => {
		// Detectar la cantidad de 'iconoOK' que no corresponden por motivos de RCLV
		let OK_RCLV = document.querySelectorAll(".RCLV .fa-check-circle.ocultar").length
		// Detectar la cantidad de 'no aciertos'
		let OK =
			Array.from(iconoOK)
				.map((n) => n.classList.value)
				.join(" ")
				.split(" ")
				.reduce((a, b) => {
					return a[b] ? ++a[b] : (a[b] = 1), a;
				}, {}).ocultar==OK_RCLV
				// == undefined;
		// Detectar la cantidad de 'no errores'
		let error =
			Array.from(iconoError)
				.map((n) => n.classList.value)
				.join(" ")
				.split(" ")
				.reduce((a, b) => {
					return a[b] ? ++a[b] : (a[b] = 1), a;
				}, {}).ocultar != iconoError.length;
		// Consecuencias
		OK && !error
			? submit.classList.remove("botonSinLink")
			: submit.classList.add("botonSinLink");
	};

	// Status inicial
	await statusInicial((inputValue = true));
});
