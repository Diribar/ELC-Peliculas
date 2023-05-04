"use strict";
window.addEventListener("load", async () => {
	// Variables
	let DOM = {
		// Variables generales
		form: document.querySelector("#dataEntry"),
		submit: document.querySelector("#dataEntry #submit"),

		// Datos
		inputs: document.querySelectorAll(".inputError .input"),

		// OK/Errores
		iconosError: document.querySelectorAll(".inputError .fa-circle-xmark"),
		iconosOK: document.querySelectorAll(".inputError .fa-circle-check"),
		mensajesError: document.querySelectorAll(".inputError .mensajeError"),

		// Específicos de Palabras Clave
		resultado: document.querySelector("#dataEntry #resultado"),

		// Específicos de Datos Duros
		nombre_original: document.querySelector("#dataEntry input[name='nombre_original']"),
		nombre_castellano: document.querySelector("#dataEntry input[name='nombre_castellano']"),
		ano_estreno: document.querySelector("#dataEntry input[name='ano_estreno']"),
		ano_fin: document.querySelector("#dataEntry input[name='ano_fin']"),
		paisesSelect: document.querySelector("#paises_id select"),
	};
	let rutas = {
		validarDatos: "/producto/agregar/api/valida/" + paso + "/?",
		caracteresCastellano: "/producto/agregar/api/convierte-letras-al-castellano/?valor=",
	};
	let varios = {
		PC: paso == "palabras-clave",
		DD: paso == "datos-duros",
		campos: Array.from(DOM.inputs).map((n) => n.name),
	};
	if (varios.DD) {
		varios.entidad = document.querySelector("#dataEntry #entidad").innerHTML;
		varios.sinAvatar = document.querySelector("#imgDerecha img").src.includes("imagenes/0-Base");
		if (DOM.paisesSelect) {
			DOM.paisesMostrar = document.querySelector("#paises_id #mostrarPaises"); // Lugar donde mostrar los nombres
			DOM.paisesID = document.querySelector("#paises_id input[name='paises_id']"); // Lugar donde almacenar los ID
			DOM.paisesOpciones = document.querySelectorAll("#paises_id select option");
			varios.paisesListado = Array.from(DOM.paisesOpciones).map((n) => ({id: n.value, nombre: n.innerHTML}));
		}
	}

	// FUNCIONES *******************************************
	let PC = {
		particsInput: () => {
			// Actualiza el botón 'submit'
			DOM.submit.classList.remove("fa-circle-check", "verde");
			DOM.submit.classList.add("fa-circle-question", "naranja");
			DOM.submit.title = "Verificar";
			DOM.submit.style = "background";

			// Actualiza el resultado
			DOM.resultado.innerHTML = "<br>";
			DOM.resultado.classList.remove(...DOM.resultado.classList);
			DOM.resultado.classList.add("sinResultado");

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
	};
	let DD = {
		dosCampos: async function (datos, campo) {
			let campo1 = datos.campo1;
			let campo2 = datos.campo2;
			let indice1 = campos.indexOf(campo1);
			let indice2 = campos.indexOf(campo2);
			let camposComb = [campo1, campo2];
			if (
				(campo == campo1 || campo == campo2) &&
				DOM.inputs[indice1].value &&
				!DOM.mensajesError[indice1].innerHTML &&
				DOM.inputs[indice2].value &&
				!DOM.mensajesError[indice2].innerHTML
			)
				this.camposCombinados(camposComb);
			return;
		},
		camposCombinados: async (camposComb) => {
			// Armado de la ruta
			let datosUrl = "entidad=" + DOM.entidad;
			for (let i = 0; i < camposComb.length; i++) {
				let indice = campos.indexOf(camposComb[i]);
				datosUrl += "&" + camposComb[i] + "=" + DOM.inputs[indice].value;
			}
			// Obtiene el mensaje para el campo
			await FN.muestraLosErrores(datosUrl, true);
			FN.actualizaBotonSubmit();
			return;
		},
		actualizaPaises: () => {
			// Actualiza los ID del input
			// Variables
			const paisID = DOM.paisesSelect.value;

			// Si se eligió 'borrar', borra todo
			if (paisID == "borrar") {
				DOM.paisesSelect.value = "";
				DOM.paisesMostrar.value = "";
				DOM.paisesID.value = "";
				return;
			}

			// Verifica si figura en paisesID
			let agregar = !DOM.paisesID.value.includes(paisID);
			if (agregar) {
				if (DOM.paisesID.value.length >= 2 * 1 + 3 * 4) return; // Limita la cantidad máxima de países a 1 + 4 = 5
				DOM.paisesID.value += (DOM.paisesID.value ? " " : "") + paisID; // Actualiza el input
			} else DOM.paisesID.value = DOM.paisesID.value.replace(paisID, "").replace("  ", " ").trim(); // Quita el paisID solicitado

			// Actualizar los países a mostrar
			let paisesNombre = "";
			if (DOM.paisesID.value) {
				let paises_idArray = DOM.paisesID.value.split(" ");
				paises_idArray.forEach((pais_id) => {
					let paisNombre = varios.paisesListado.find((n) => n.id == pais_id).nombre;
					paisesNombre += (paisesNombre ? ", " : "") + paisNombre;
				});
			}
			DOM.paisesMostrar.value = paisesNombre;
			// Fin
			return;
		},
	};
	// Funciones compartidas
	let FN = {
		statusInicial: async function (mostrarIconoError) {
			//Busca todos los valores
			let datosUrl = "entidad=" + (varios.entidad ? varios.entidad : "");
			DOM.inputs.forEach((input, i) => {
				// Particularidad para DD avatar
				if (varios.DD && input.name == "avatar" && !varios.sinAvatar) return;
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
			let errores = await fetch(rutas.validarDatos + datos).then((n) => n.json());
			varios.campos.forEach((campo, indice) => {
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
			// Detectar la cantidad de 'errores' ocultos
			let hayErrores = Array.from(DOM.iconosError)
				.map((n) => n.className)
				.some((n) => n.includes("error"));
			// Consecuencias
			hayErrores ? DOM.submit.classList.add("inactivo") : DOM.submit.classList.remove("inactivo");
		},
		submitForm: async function (e) {
			e.preventDefault();
			if (varios.PC)
				if (DOM.submit.classList.contains("fa-circle-question")) {
					if (!DOM.submit.classList.contains("inactivo")) {
						DOM.submit.classList.add("inactivo");
						let ruta = PC.rutaObtieneCantProds(DOM.inputs[0].value);
						let resultados = await fetch(ruta).then((n) => n.json());
						PC.mostrarResultados(resultados);
						DOM.submit.classList.remove("inactivo");
						PC.avanzar();
					} else this.statusInicial(true);
				} else DOM.form.submit();
			else if (DOM.submit.classList.contains("inactivo")) this.statusInicial(true);
			else DOM.form.submit();
		},
	};

	// ADD EVENT LISTENERS *********************************
	DOM.form.addEventListener("keypress", (e) => {
		// Previene el uso del 'enter'
		if (e.key == "Enter" && varios.DD) e.preventDefault();

		// Limita el uso del teclado solamente a los caracteres que nos interesan
		let formato = /^[a-záéíóúüñ ,.'"\d\-]+$/i;
		if (!formato.test(e.key)) e.preventDefault();
	});

	DOM.form.addEventListener("input", async (e) => {
		// Variables
		let valor = e.target.value;

		// Tareas comunes
		if (valor.length && e.target.localName != "select") {
			// Limita el uso del teclado solamente a los caracteres que nos interesan
			valor = valor
				.replace(/ +/g, " ")
				.replace(/[^a-záéíóúüñ ,.'"\d\-]+$/gi, "")
				.replace(/\n/g, "");

			// El primer caracter no puede ser un espacio
			if (valor.slice(0, 1) == " ") valor = valor.slice(1);

			// Primera letra en mayúscula
			const posicCursor = e.target.selectionStart;
			if (varios.DD) valor = valor.slice(0, 1).toUpperCase() + valor.slice(1);
			e.target.selectionEnd = posicCursor;
		}
		// Reemplaza el valor del DOM
		e.target.value = valor;

		// Particularidades
		if (varios.PC) {
			PC.particsInput();

			// Prepara los datosUrl con los datos a validar
			const campo = e.target.name;
			const datosUrl = campo + "=" + encodeURIComponent(valor);

			// Validar errores
			await FN.muestraLosErrores(datosUrl, true);

			// Actualiza botón Submit
			FN.actualizaBotonSubmit();
		}

		// Fin
		return;
	});

	if (varios.DD) {
		DOM.form.addEventListener("change", async (e) => {
			// Variables
			let campo = e.target.name;
			let valor = e.target.value;
			let adicionales = "";

			// Convierte los ID de los países elegidos, en un texto
			if (campo == "paises") {
				DD.actualizaPaises();
				// Actualiza los valores para 'campo' y 'valor'
				campo = DOM.paisesID.name;
				valor = DOM.paisesID.value;
			}
			// Campos combinados
			if (campo == "ano_estreno") {
				if (DOM.ano_fin) adicionales += "&ano_fin=" + encodeURIComponent(DOM.ano_fin.value);
				adicionales += "&nombre_original=" + encodeURIComponent(DOM.nombre_original.value);
				adicionales += "&nombre_castellano=" + encodeURIComponent(DOM.nombre_castellano.value);
				adicionales += "&entidad=" + encodeURIComponent(varios.entidad);
			}
			if (campo == "ano_fin") adicionales += "&ano_estreno=" + encodeURIComponent(DOM.ano_estreno.value);
			if (campo == "nombre_original" || campo == "nombre_castellano") {
				adicionales += "&ano_estreno=" + encodeURIComponent(DOM.ano_estreno.value);
				adicionales += "&entidad=" + encodeURIComponent(varios.entidad);
			}

			// Prepara los datosUrl con los datos a validar
			let datosUrl = campo + "=" + encodeURIComponent(valor) + adicionales;

			// Validar errores
			await FN.muestraLosErrores(datosUrl, true);

			// Actualiza botón Submit
			FN.actualizaBotonSubmit();
		});
	}
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
	FN.statusInicial(varios.DD);
});

// Variables
let url = location.pathname;
let paso = url.slice(url.lastIndexOf("/") + 1);
