"use strict";
window.addEventListener("load", async () => {
	// Variables
	let DOM = {
		// Variables generales
		form: document.querySelector("#dataEntry"),
		submit: document.querySelector("#dataEntry #submit"),
		resultado: document.querySelector("#dataEntry #resultado"),

		// Datos
		inputs: document.querySelectorAll(".inputError .input"),

		// OK/Errores
		iconosError: document.querySelectorAll(".inputError .fa-circle-xmark"),
		iconosOK: document.querySelectorAll(".inputError .fa-circle-check"),
		mensajesError: document.querySelectorAll(".inputError .mensajeError"),
	};
	let v = {
		validaDatos: "/producto/agregar/api/valida/palabras-clave/?",
		campos: Array.from(DOM.inputs).map((n) => n.name),
	};

	// FUNCIONES *******************************************
	let FN = {
		particsInput: async (e) => {
			// Actualiza el botón 'submit' a 'Verificar'
			DOM.submit.classList.remove("fa-circle-check", "verde");
			DOM.submit.classList.add("fa-circle-question", "naranja");
			DOM.submit.title = "Verificar";
			DOM.submit.style = "background";

			// Actualiza el resultado
			DOM.resultado.innerHTML = "<br>";
			DOM.resultado.classList.remove(...DOM.resultado.classList);
			DOM.resultado.classList.add("sinResultado");

			// Validar errores
			const datosUrl = e.target.name + "=" + encodeURIComponent(e.target.value);
			await FN.muestraLosErrores(datosUrl, true);

			// Actualiza botón Submit
			FN.actualizaBotonSubmit();

			// Fin
			return;
		},
		rutaObtieneCantProds: (input) => {
			let palabrasClave = input.trim();
			// Procesando la información
			DOM.resultado.innerHTML = "Procesando la información...";
			DOM.resultado.classList.remove(...DOM.resultado.classList);
			DOM.resultado.classList.add("resultadoEnEspera");
			// Obtiene el link
			return "/producto/agregar/api/PC-cant-prods/?palabrasClave=" + palabrasClave;
		},
		mostrarResultados: async (resultados) => {
			// Variables
			let {cantProds, cantProdsNuevos, hayMas} = resultados;
			// Determinar oracion y formato
			let formatoVigente = "resultadoInvalido";
			let oracion;
			// Resultado exitoso
			if (cantProds && !hayMas) {
				let plural = cantProdsNuevos > 1 ? "s" : "";
				oracion = cantProdsNuevos
					? "Encontramos " + cantProdsNuevos + " coincidencia" + plural + " nueva" + plural
					: "No encontramos ninguna coincidencia nueva";
				if (cantProds > cantProdsNuevos) oracion += ", y " + (cantProds - cantProdsNuevos) + " ya en BD";
				if (cantProdsNuevos) formatoVigente = "resultadoExitoso";
			} else {
				// Resultados inválidos
				oracion = hayMas
					? "Hay demasiadas coincidencias (+" + cantProds + "), intentá ser más específico"
					: cantProds == 0
					? "No encontramos ninguna coincidencia"
					: oracion;
			}
			DOM.resultado.innerHTML = oracion;
			DOM.resultado.classList.remove(...DOM.resultado.classList);
			DOM.resultado.classList.add(formatoVigente);
		},
		avanzar: () => {
			DOM.submit.classList.remove("fa-circle-question", "naranja");
			DOM.submit.classList.add("fa-circle-check", "verde");
			DOM.submit.title = "Avanzar";
			return;
		},
		statusInicial: async function (mostrarIconoError) {
			//Busca todos los valores
			let datosUrl = "entidad=" + (v.entidad ? v.entidad : "");
			DOM.inputs.forEach((input, i) => {
				// Agrega el campo y el valor
				datosUrl += "&" + input.name + "=" + encodeURIComponent(input.value);
			});
			// Consecuencias de las validaciones de errores
			await this.muestraLosErrores(datosUrl, mostrarIconoError);
			this.actualizaBotonSubmit();
			// Fin
			return;
		},
		muestraLosErrores: async (datos, mostrarIconoError) => {
			let errores = await fetch(v.validaDatos + datos).then((n) => n.json());
			v.campos.forEach((campo, indice) => {
				if (errores[campo] !== undefined) {
					DOM.mensajesError[indice].innerHTML = errores[campo];
					// Acciones en función de si hay o no mensajes de error
					errores[campo]
						? DOM.iconosError[indice].classList.add("error")
						: DOM.iconosError[indice].classList.remove("error");
					errores[campo] && mostrarIconoError
						? DOM.iconosError[indice].classList.remove("ocultar")
						: DOM.iconosError[indice].classList.add("ocultar");
					errores[campo]
						? DOM.iconosOK[indice].classList.add("ocultar")
						: DOM.iconosOK[indice].classList.remove("ocultar");
				}
			});
			// Fin
			return;
		},
		actualizaBotonSubmit: () => {
			// Detecta la cantidad de 'errores' ocultos
			let hayErrores = Array.from(DOM.iconosError)
				.map((n) => n.className)
				.some((n) => n.includes("error"));
			// Consecuencias
			hayErrores ? DOM.submit.classList.add("inactivo") : DOM.submit.classList.remove("inactivo");
		},
		submitForm: async function (e) {
			e.preventDefault();
			if (DOM.submit.classList.contains("fa-circle-question")) {
				if (!DOM.submit.classList.contains("inactivo")) {
					DOM.submit.classList.add("inactivo");
					let ruta = FN.rutaObtieneCantProds(DOM.inputs[0].value);
					let resultados = await fetch(ruta).then((n) => n.json());
					FN.mostrarResultados(resultados);
					DOM.submit.classList.remove("inactivo");
					FN.avanzar();
				} else this.statusInicial(true);
			} else DOM.form.submit();
		},
	};

	// ADD EVENT LISTENERS *********************************
	DOM.form.addEventListener("keypress", (e) => {
		keyPressed(e);
		return;
	});

	DOM.form.addEventListener("input", async (e) => {
		// Validaciones estándar
		amplio.restringeCaracteres(e, true);

		// Validaciones particulares
		await FN.particsInput(e);

		// Fin
		return;
	});

	// Submit
	DOM.form.addEventListener("submit", async (e) => {
		FN.submitForm(e);
	});
	DOM.submit.addEventListener("click", async (e) => {
		FN.submitForm(e);
	});
	DOM.submit.addEventListener("keydown", async (e) => {
		if (e.key == "Enter" || e.key == "Space") FN.submitForm(e);
	});

	// STATUS INICIAL *************************************
	FN.statusInicial();
});
