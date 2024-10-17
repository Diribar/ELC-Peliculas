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
		submit: async function (e) {
			e.preventDefault();

			// Acciones si el botón está inactivo
			if (DOM.botonSubmit.className.includes("inactivo")) return this.muestraElErrorMasBotonSubmit(true);

			// Acciones si el botón está listo para buscar
			if (DOM.botonSubmit.className.includes("verdeClaro")) {
				// Adecuaciones iniciales
				DOM.botonSubmit.classList.add("inactivo");
				DOM.botonSubmit.innerHTML = "Buscando";
				DOM.resultado.innerHTML = "<br>";

				// Obtiene los resultados
				const palabrasClave = DOM.inputPalsClave.value.trim();
				const APIs = [...APIs_buscar];
				APIs[0].ruta += "&palabrasClave=" + palabrasClave;
				resultados = await barraProgreso(rutas.pre, APIs);

				// Muestra los resultados
				this.muestraResultados();

				// Fin
				return;
			}

			// Acciones si el botón está listo para avanzar
			if (DOM.botonSubmit.className.includes("verdeOscuro")) return DOM.form.submit(); // post
		},
		muestraResultados: () => {
			// Variables
			const {prodsNuevos, hayMas, mensaje} = resultados;
			const formato = prodsNuevos.length && !hayMas ? "resultadoExitoso" : "resultadoInvalido";

			// Publica el resultado
			DOM.resultado.innerHTML = mensaje.palabrasClave;
			DOM.resultado.classList.remove(...DOM.resultado.classList);
			DOM.resultado.classList.add(formato);

			// Formato botón submit
			DOM.botonSubmit.classList.replace("verdeClaro", "verdeOscuro");
			DOM.botonSubmit.classList.remove("inactivo");

			// Contenido botón submit
			const resultado = resultados.prodsNuevos || resultados.prodsYaEnBD ? "Desambiguar" : "Ingr. Man.";
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
	DOM.form.addEventListener("submit", (e) => FN.submit(e));
	DOM.botonSubmit.addEventListener("click", (e) => FN.submit(e));
	DOM.form.addEventListener("keydown", (e) => {
		if (e.key == "Enter") FN.submit(e);
	});

	// Start-up
	FN.muestraElErrorMasBotonSubmit();
});

// Variables
rutas.validaDatos = "/producto/api/pa-valida-pc/?";
let resultados = {};
