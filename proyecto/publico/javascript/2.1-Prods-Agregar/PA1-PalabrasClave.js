"use strict";
window.addEventListener("load", async () => {
	// Variables
	const DOM = {
		// Variables generales
		form: document.querySelector("#dataEntry"),
		botonSubmit: document.querySelector("#dataEntry #botonSubmit"),
		resultado: document.querySelector("#dataEntry #resultado"),

		// Datos
		inputs: document.querySelectorAll(".inputError .input"),

		// OK/Errores
		iconosError: document.querySelectorAll(".inputError .fa-circle-xmark"),
		iconosOK: document.querySelectorAll(".inputError .fa-circle-check"),
		mensajesError: document.querySelectorAll(".inputError .mensajeError"),
	};
	let v = {
		campos: Array.from(DOM.inputs).map((n) => n.name),
		resultados: {},
	};

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
			await FN.muestraLosErrores(datosUrl, true);

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
			let {cantProds, cantProdsNuevos, hayMas} = v.resultados;
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
			DOM.botonSubmit.classList.replace("verdeClaro", "verdeOscuro");
			DOM.botonSubmit.innerHTML = v.resultados.cantProds ? "Desambiguar" : "Ingr. Man.";
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
			const errores = await fetch(rutas.validaDatos + datos).then((n) => n.json());
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
			hayErrores ? DOM.botonSubmit.classList.add("inactivo") : DOM.botonSubmit.classList.remove("inactivo");
		},
		submitForm: async function (e) {
			e.preventDefault();

			// Acciones si el botón está inactivo
			if (DOM.botonSubmit.className.includes("inactivo")) return this.statusInicial(true);

			// Acciones si el botón está listo para buscar
			if (DOM.botonSubmit.className.includes("verdeClaro")) {
				// Obtiene los resultados
				DOM.botonSubmit.classList.add("inactivo");
				const palabrasClave = FN.palabrasClave(DOM.inputs[0].value);
				v.resultados = await fetch(rutas.cantProductos + palabrasClave).then((n) => n.json());

				// Muestra los resultados
				FN.muestraResultados();
				FN.avanzar();
				DOM.botonSubmit.classList.remove("inactivo");

				// Fin
				return;
			}

			// Acciones si el botón está listo para avanzar
			if (DOM.botonSubmit.className.includes("verdeOscuro"))
				return v.resultados.cantProds
					? DOM.form.submit() // Desambiguar
					: (location.href = "ingreso-manual"); // Ingreso Manual
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
	DOM.botonSubmit.addEventListener("click", async (e) => {
		FN.submitForm(e);
	});
	DOM.botonSubmit.addEventListener("keydown", async (e) => {
		if (e.key == "Enter" || e.key == "Space") FN.submitForm(e);
	});

	// STATUS INICIAL *************************************
	FN.statusInicial();
});
const rutas = {
	cantProductos: "/producto/agregar/api/PC-obtiene-la-cantidad-de-prods/?palabrasClave=",
	validaDatos: "/producto/agregar/api/valida/palabras-clave/?",
};
