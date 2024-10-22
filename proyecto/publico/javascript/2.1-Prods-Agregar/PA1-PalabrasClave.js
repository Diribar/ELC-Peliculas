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

			// Muestra/oculta los íconos 'OK' y 'error', si el campo fue validado
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

			// Botón inactivo
			if (DOM.botonSubmit.className.includes("inactivo")) return this.muestraElErrorMasBotonSubmit(true);

			// Botón 'Buscar'
			if (DOM.botonSubmit.className.includes("verdeClaro")) {
				// Adecuaciones iniciales
				DOM.botonSubmit.classList.add("inactivo");
				DOM.botonSubmit.innerHTML = "Buscando";
				DOM.resultado.innerHTML = "<br>";

				// Obtiene los resultados
				const palabrasClave = DOM.inputPalsClave.value.trim();
				APIs_buscar[0].ruta = APIs_buscar[0].ruta.split("&")[0];
				APIs_buscar[0].ruta += "&palabrasClave=" + palabrasClave;
				resultados = await barraProgreso(rutas.pre, APIs_buscar);

				// Actualiza el mensaje y adecua el botón submit
				this.muestraResultados();

				// Fin
				return;
			}

			// Botón 'Avanzar
			if (DOM.botonSubmit.className.includes("verdeOscuro")) return DOM.form.submit(); // post
		},
		statusInicial: async function () {
			// Si el botón está inactivo, interrumpe la función
			if (DOM.botonSubmit.className.includes("inactivo")) return;

			// Averigua si existe la session 'pc_ds', y en caso que no, interrumpe la función
			resultados = await fetch(rutas.pre + rutas.buscaInfo).then((n) => n.json());
			if (!resultados || !resultados.mensaje) return;

			// Actualiza el mensaje y adecua el botón submit
			this.muestraResultados();

			// Fin
			return;
		},
		muestraResultados: () => {
			// Variables
			const {prodsNuevos, hayMas, mensaje} = resultados;

			// Publica el resultado
			DOM.resultado.innerHTML = mensaje ? mensaje.palabrasClave : resultados;
			DOM.resultado.classList.remove(...DOM.resultado.classList);
			const formato = prodsNuevos && prodsNuevos.length && !hayMas ? "resultadoExitoso" : "resultadoInvalido";
			DOM.resultado.classList.add(formato);

			// Si hubo un error en los resultados, interrumpe la función
			if (!mensaje) return;

			// Formato botón submit
			DOM.botonSubmit.classList.replace("verdeClaro", "verdeOscuro");
			DOM.botonSubmit.classList.remove("inactivo");

			// Contenido botón submit
			const proxTarea = resultados.prodsNuevos.length || resultados.prodsYaEnBD.length ? "Desambiguar" : "Ingr. Man.";
			DOM.botonSubmit.innerHTML = proxTarea;
			DOM.inputMetodo.value = proxTarea;

			// Fin
			return;
		},
	};

	// Add Event listeners - Varios
	DOM.form.addEventListener("keypress", (e) => keyPressed(e));
	DOM.form.addEventListener("input", async (e) => {
		amplio.restringeCaracteres(e, true); // Validaciones estándar
		await FN.particsInput(e); // Validaciones particulares

		// Fin
		return;
	});

	// Add Event listeners - Submit
	DOM.form.addEventListener("submit", (e) => FN.submit(e));
	DOM.botonSubmit.addEventListener("click", (e) => FN.submit(e));
	DOM.form.addEventListener("keydown", (e) => {
		if (e.key == "Enter") FN.submit(e);
	});

	// Start-up
	await FN.muestraElErrorMasBotonSubmit();
	FN.statusInicial();
});

// Variables
rutas.validaDatos = "/producto/api/pa-valida-pc/?";
let resultados = {};
