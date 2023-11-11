"use strict";
window.addEventListener("load", async () => {
	// Variables
	let DOM = {
		// Variables generales
		form: document.querySelector("#dataEntry"),
		submit: document.querySelector("#dataEntry #submit"),

		// Datos
		inputs: document.querySelectorAll(".inputError .input"),
		inputAvatar: document.querySelector("form .input#inputImagen"),
		imgAvatar: document.querySelector("#imgDerecha img"),

		// OK/Errores
		iconosError: document.querySelectorAll(".inputError .fa-circle-xmark"),
		iconosOK: document.querySelectorAll(".inputError .fa-circle-check"),
		mensajesError: document.querySelectorAll(".inputError .mensajeError"),

		// Específicos de Palabras Clave
		resultado: document.querySelector("#dataEntry #resultado"),

		// Específicos de Datos Duros
		nombreOriginal: document.querySelector("#dataEntry input[name='nombreOriginal']"),
		nombreCastellano: document.querySelector("#dataEntry input[name='nombreCastellano']"),
		anoEstreno: document.querySelector("#dataEntry input[name='anoEstreno']"),
		anoFin: document.querySelector("#dataEntry input[name='anoFin']"),
		paisesSelect: document.querySelector("#paises_id select"),
	};
	let v = {
		campos: Array.from(DOM.inputs).map((n) => n.name),
		entidad: document.querySelector("#dataEntry #entidad").innerHTML,
		agregarAvatar: DOM.imgAvatar.src.includes("imagenes/Avatar"),
		datosUrl: null,
	};
	let rutas = {
		validarDatos: "/producto/agregar/api/valida/" + paso + "/?",
		caracteresCastellano: "/producto/agregar/api/convierte-letras-al-castellano/?valor=",
	};
	if (DOM.paisesSelect) {
		DOM.paisesMostrar = document.querySelector("#paises_id #mostrarPaises"); // Lugar donde mostrar los nombres
		DOM.paisesID = document.querySelector("#paises_id input[name='paises_id']"); // Lugar donde almacenar los ID
		DOM.paisesOpciones = document.querySelectorAll("#paises_id select option");
		v.paisesListado = Array.from(DOM.paisesOpciones).map((n) => ({id: n.value, nombre: n.innerHTML}));
	}

	// FUNCIONES *******************************************
	let FN = {
		actualizaVarios: async function () {
			this.obtieneLosValores();
			await this.averiguaMuestraLosErrores();
			this.actualizaBotonSubmit();

			// Fin
			return;
		},
		obtieneLosValores: () => {
			// Busca todos los valores
			v.datosUrl = "entidad=" + (v.entidad ? v.entidad : "");
			DOM.inputs.forEach((input, i) => {
				// Particularidad para avatar
				if (input.name == "avatar") {
					if (!v.agregarAvatar) return;
					if (DOM.inputAvatar.value) {
						v.datosUrl += "&esImagen=" + (v.esImagen ? "SI" : "NO");
						v.datosUrl += "&tamano=" + DOM.inputAvatar.files[0].size;
					}
				}

				// Agrega el campo y el valor
				v.datosUrl += "&" + input.name + "=" + encodeURIComponent(input.value);
			});

			// Fin
			return;
		},
		averiguaMuestraLosErrores: async () => {
			// Obtiene los errores
			let errores = await fetch(rutas.validarDatos + v.datosUrl).then((n) => n.json());

			// Acciones en función de si hay errores o no
			v.campos.forEach((campo, indice) => {
				// Actualiza los mensajes de error
				DOM.mensajesError[indice].innerHTML = errores[campo];

				// Acciones si hay mensaje de error
				if (errores[campo]) {
					DOM.iconosOK[indice].classList.add("ocultar");
					DOM.iconosError[indice].classList.remove("ocultar");
				}
				// Acciones si no hay mensaje de error
				else {
					DOM.iconosOK[indice].classList.remove("ocultar");
					DOM.iconosError[indice].classList.add("ocultar");
				}
			});

			// Fin
			return;
		},
		actualizaBotonSubmit: () => {
			// Detecta la cantidad de 'errores' ocultos
			let hayErrores = Array.from(DOM.iconosOK)
				.map((n) => n.className)
				.some((n) => n.includes("ocultar"));
			// Consecuencias
			hayErrores ? DOM.submit.classList.add("inactivo") : DOM.submit.classList.remove("inactivo");
		},

		// Varias
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
					let paisNombre = v.paisesListado.find((n) => n.id == pais_id).nombre;
					paisesNombre += (paisesNombre ? ", " : "") + paisNombre;
				});
			}
			DOM.paisesMostrar.value = paisesNombre;
			// Fin
			return;
		},
		submitForm: async function (e) {
			e.preventDefault();
			if (DOM.submit.classList.contains("inactivo")) await this.actualizaVarios();
			else DOM.form.submit();
			return;
		},
	};

	// ADD EVENT LISTENERS *********************************
	DOM.form.addEventListener("keypress", (e) => {
		keyPressed(e);
		return;
	});

	DOM.form.addEventListener("input", async (e) => {
		// Validaciones estándar
		amplio.restringeCaracteres(e);

		// Validaciones particulares
		const campo = e.target.name == "paises" ? "paises_id" : e.target.name;
		const indice = v.campos.indexOf(campo);
		DOM.iconosError[indice].classList.add("ocultar");

		// Fin
		return;
	});

	DOM.form.addEventListener("change", async (e) => {
		// Variables
		const campo = e.target.name;

		// Particularidades
		if (campo == "paises") FN.actualizaPaises(); // convierte los ID de los países elegidos, en un texto
		if (campo == "avatar") await revisaAvatar({DOM, v, FN});

		// Valida errores y actualiza el botón submit
		FN.actualizaVarios();
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
	await FN.actualizaVarios();
});

// Variables
let url = location.pathname;
let paso = url.slice(url.lastIndexOf("/") + 1);
