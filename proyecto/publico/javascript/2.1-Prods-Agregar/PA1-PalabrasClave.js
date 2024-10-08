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
	let resultados = {};

	// FUNCIONES *******************************************
	const FN = {
		particsInput: async (e) => {
			// Actualiza el 'botonSubmit' a 'Verificar'
			DOM.botonSubmit.classList.replace("verdeOscuro", "verdeClaro");
			DOM.botonSubmit.innerHTML = "Buscar";

			// Actualiza el resultado
			DOM.resultado.innerHTML = "<br>";
			DOM.resultado.classList.remove(...DOM.resultado.classList);
			DOM.resultado.classList.add("sinResultado");

			// Validar errores
			const datosUrl = e.target.name + "=" + encodeURIComponent(e.target.value);
			await FN.muestraElError(datosUrl, true);

			// Actualiza botón Submit
			FN.actualizaBotonSubmit();

			// Fin
			return;
		},
		palabrasClave: (input) => {
			// Variables
			let palabrasClave = input.trim();

			// Procesando la información
			DOM.resultado.innerHTML = "Procesando la información...";
			DOM.resultado.classList.remove(...DOM.resultado.classList);
			DOM.resultado.classList.add("resultadoEnEspera");

			// Obtiene el link
			return palabrasClave;
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
		statusInicial: async function (mostrarIconoError) {
			// Agrega el campo y el valor
			const datosUrl = "&" + DOM.inputPalsClave.name + "=" + encodeURIComponent(DOM.inputPalsClave.value);

			// Consecuencias de las validaciones de errores
			await this.muestraElError(datosUrl, mostrarIconoError);
			this.actualizaBotonSubmit();

			// Fin
			return;
		},
		muestraElError: async (datos, mostrarIconoError) => {
			const errores = await fetch(rutas.validaDatos + datos).then((n) => n.json());
			const {palabrasClave: error} = errores;

			if (error !== undefined) {
				DOM.mensajeError.innerHTML = error;
				// Acciones en función de si hay o no mensajes de error
				if (error) {
					DOM.iconoError.classList.add("error");
					DOM.iconoOK.classList.add("ocultar");
					mostrarIconoError ? DOM.iconoError.classList.remove("ocultar") : DOM.iconoError.classList.add("ocultar");
				} else {
					DOM.iconoError.classList.remove("error");
					DOM.iconoOK.classList.remove("ocultar");
					DOM.iconoError.classList.add("ocultar");
				}
			}

			// Fin
			return;
		},
		actualizaBotonSubmit: () => {
			const hayError = DOM.iconoError.className.includes("error");
			hayError ? DOM.botonSubmit.classList.add("inactivo") : DOM.botonSubmit.classList.remove("inactivo");
		},
		submitForm: async function (e) {
			e.preventDefault();

			// Acciones si el botón está inactivo
			if (DOM.botonSubmit.className.includes("inactivo")) return this.statusInicial(true);

			// Acciones si el botón está listo para buscar
			if (DOM.botonSubmit.className.includes("verdeClaro")) {
				// Obtiene los resultados
				DOM.botonSubmit.classList.add("inactivo");
				DOM.botonSubmit.innerHTML = "Buscando";
				const palabrasClave = FN.palabrasClave(DOM.inputPalsClave.value);
				resultados = await fetch(rutas.cantProductos + palabrasClave).then((n) => n.json());

				// Muestra los resultados
				FN.muestraResultados();
				FN.avanzar();
				DOM.botonSubmit.classList.remove("inactivo");

				// Fin
				return;
			}

			// Acciones si el botón está listo para avanzar
			if (DOM.botonSubmit.className.includes("verdeOscuro")) return DOM.form.submit(); // post
		},
	};

	// ADD EVENT LISTENERS *********************************
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

	// STATUS INICIAL *************************************
	FN.statusInicial();
});
const rutas = {
	cantProductos: "api/PC-obtiene-la-cantidad-de-prods/?palabrasClave=",
	validaDatos: "api/valida-agregar-pc/?",
};
