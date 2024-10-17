"use strict";
window.addEventListener("load", async () => {
	// Variables
	const DOM = {
		// Variables generales
		form: document.querySelector("#dataEntry"),
		botonSubmit: document.querySelector("#dataEntry #botonSubmit"),
		resultado: document.querySelector("#dataEntry #resultado"),

		// Datos
		inputPalsClave: document.querySelector("#dataEntry input[name='palabrasClave']"),
		inputMetodo: document.querySelector("#dataEntry input[name='metodo']"),

		// OK/Error
		iconoError: document.querySelector(".inputError .fa-circle-xmark"),
		iconoOK: document.querySelector(".inputError .fa-circle-check"),
		mensajeError: document.querySelector(".inputError .mensajeError"),
	};

	// Funciones
	const FN = {
		muestraElErrorMasBotonSubmit: async (mostrarIconoError) => {
			// Variables
			const datosUrl = "&" + DOM.inputPalsClave.name + "=" + encodeURIComponent(DOM.inputPalsClave.value);

			// Valida los errores
			errores = await fetch(rutas.validaDatos + datosUrl).then((n) => n.json());
			const error = errores.palabrasClave;

			// Acciones si el campo fue validado
			if (Object.keys(errores).includes("palabrasClave")) {
				DOM.mensajeError.innerHTML = error;
				// Acciones si existe un mensaje de error
				if (error) {
					DOM.iconoOK.classList.add("ocultar");
					mostrarIconoError ? DOM.iconoError.classList.remove("ocultar") : DOM.iconoError.classList.add("ocultar");
				}
				// Acciones si no hay errores
				else {
					DOM.iconoOK.classList.remove("ocultar");
					DOM.iconoError.classList.add("ocultar");
				}
			}

			// Actualiza el botón submit
			DOM.iconoOK.className.includes("ocultar")
				? DOM.botonSubmit.classList.add("inactivo")
				: DOM.botonSubmit.classList.remove("inactivo");

			// Fin
			return;
		},
		particsInput: async function () {
			// Actualiza el 'botonSubmit' a 'Verificar'
			DOM.botonSubmit.classList.replace("verdeOscuro", "verdeClaro");
			DOM.botonSubmit.innerHTML = "Buscar";

			// Actualiza el resultado
			DOM.resultado.innerHTML = "<br>";
			DOM.resultado.classList.remove(...DOM.resultado.classList);
			DOM.resultado.classList.add("sinResultado");

			// Validar errores
			await this.muestraElErrorMasBotonSubmit(true);

			// Fin
			return;
		},
		submitForm: async function (e) {
			e.preventDefault();

			// Acciones si el botón está inactivo
			if (DOM.botonSubmit.className.includes("inactivo")) return this.muestraElErrorMasBotonSubmit(true);

			// Acciones si el botón está listo para buscar
			if (DOM.botonSubmit.className.includes("verdeClaro")) {
				// Adecuaciones iniciales
				DOM.botonSubmit.classList.add("inactivo");
				DOM.botonSubmit.innerHTML = "Buscando";
				DOM.resultado.innerHTML = "";

				// Obtiene los resultados
				const palabrasClave = DOM.inputPalsClave.value.trim();
				const APIs = [...APIs_buscar];
				APIs[0].ruta += "&palabrasClave=" + palabrasClave;
				resultados = await barraProgreso(pre, APIs);

				// Muestra los resultados
				this.muestraResultados();
				this.avanzar();
				DOM.botonSubmit.classList.remove("inactivo");

				// Fin
				return;
			}

			// Acciones si el botón está listo para avanzar
			if (DOM.botonSubmit.className.includes("verdeOscuro")) return DOM.form.submit(); // post
		},
		muestraResultados: async () => {
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
			// Formato
			DOM.botonSubmit.classList.replace("verdeClaro", "verdeOscuro");

			// Contenido
			let resultado = resultados.cantProds ? "Desambiguar" : "Ingr. Man.";
			DOM.botonSubmit.innerHTML = resultado;
			DOM.inputMetodo.value = resultado;

			// Fin
			return;
		},
	};

	// ADD EVENT LISTENERS
	DOM.form.addEventListener("keypress", (e) => keyPressed(e));
	DOM.form.addEventListener("input", async (e) => {
		amplio.restringeCaracteres(e, true); // Validaciones estándar
		await FN.particsInput(e); // Validaciones particulares

		// Fin
		return;
	});

	// Submit
	DOM.form.addEventListener("submit", (e) => FN.submitForm(e));
	DOM.botonSubmit.addEventListener("click", (e) => FN.submitForm(e));
	DOM.form.addEventListener("keydown", (e) => {
		if (e.key == "Enter") FN.submitForm(e);
	});

	// Start-up
	FN.muestraElErrorMasBotonSubmit();
});

// Variables
rutas.validaDatos = "/producto/api/pa-valida-pc/?";
let resultados = {};
