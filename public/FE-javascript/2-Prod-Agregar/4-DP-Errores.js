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
		// Revisar campos en forma INDIVIDUAL
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
		// Revisar campos COMBINADOS
		// Subcategoría + RCLV
		if (
			campo == "subcategoria_id" ||
			campo == "personaje_historico_id" ||
			campo == "hecho_historico_id" ||
			campo == "valor_id"
		) {
			funcionCamposCombinados([
				"subcategoria_id",
				"personaje_historico_id",
				"hecho_historico_id",
				"valor_id",
			]);
			// Esta función está definida en '4-DP-Subcat'
			await funcionRCLV();
		}

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
		// Detectar la cantidad de 'no aciertos'
		let OK =
			Array.from(iconoOK)
				.map((n) => n.classList.value)
				.join(" ")
				.split(" ")
				.reduce((a, b) => {
					return a[b] ? ++a[b] : (a[b] = 1), a;
				}, {}).ocultar == undefined;
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
	let funcionCamposCombinados = async (valores) => {
		// Armado de la ruta
		let dato = "";
		let indice = [];
		for (let i = 0; i < valores.length; i++) {
			indice.push(campos.indexOf(valores[i]));
			dato += "&" + valores[i] + "=" + inputs[indice[i]].value;
		}
		// Obtener el mensaje para el campo
		let errores = await fetch(ruta + dato).then((n) => n.json());
		for (let i = 0; i < valores.length; i++) {
			// Captura el mensaje de error
			mensaje = errores[valores[i]];
			if (mensaje == undefined) mensaje = "";
			// Reemplaza
			mensajesError[indice[i]].innerHTML = mensaje;
			// Acciones en función de si hay o no mensajes de error
			mensaje
				? iconoOK[indice[i]].classList.add("ocultar")
				: iconoOK[indice[i]].classList.remove("ocultar");
			mensaje
				? iconoError[indice[i]].classList.remove("ocultar")
				: iconoError[indice[i]].classList.add("ocultar");
		}
		return;
	};

	// Status inicial
	await statusInicial((inputValue = true));
});
