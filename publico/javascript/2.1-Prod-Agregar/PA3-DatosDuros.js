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
		nombreOriginal: document.querySelector("#dataEntry input[name='nombreOriginal']"),
		nombreCastellano: document.querySelector("#dataEntry input[name='nombreCastellano']"),
		anoEstreno: document.querySelector("#dataEntry input[name='anoEstreno']"),
		anoFin: document.querySelector("#dataEntry input[name='anoFin']"),
		paisesSelect: document.querySelector("#paises_id select"),
	};
	let rutas = {
		validarDatos: "/producto/agregar/api/valida/" + paso + "/?",
		caracteresCastellano: "/producto/agregar/api/convierte-letras-al-castellano/?valor=",
	};
	let v = {
		campos: Array.from(DOM.inputs).map((n) => n.name),
		entidad: document.querySelector("#dataEntry #entidad").innerHTML,
		sinAvatar: document.querySelector("#imgDerecha img").src.includes("imagenes/0-Base"),
	};
	if (DOM.paisesSelect) {
		DOM.paisesMostrar = document.querySelector("#paises_id #mostrarPaises"); // Lugar donde mostrar los nombres
		DOM.paisesID = document.querySelector("#paises_id input[name='paises_id']"); // Lugar donde almacenar los ID
		DOM.paisesOpciones = document.querySelectorAll("#paises_id select option");
		v.paisesListado = Array.from(DOM.paisesOpciones).map((n) => ({id: n.value, nombre: n.innerHTML}));
	}

	// FUNCIONES *******************************************
	let FN = {
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
			await FN.muestraLosErrores(datosUrl);
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
					let paisNombre = v.paisesListado.find((n) => n.id == pais_id).nombre;
					paisesNombre += (paisesNombre ? ", " : "") + paisNombre;
				});
			}
			DOM.paisesMostrar.value = paisesNombre;
			// Fin
			return;
		},
		statusInicial: async function () {
			//Busca todos los valores
			let datosUrl = "entidad=" + (v.entidad ? v.entidad : "");
			DOM.inputs.forEach((input, i) => {
				// Particularidad para avatar
				if (input.name == "avatar" && !v.sinAvatar) return;
				// Agrega el campo y el valor
				datosUrl += "&" + input.name + "=" + encodeURIComponent(input.value);
			});

			// Consecuencias de las validaciones de errores
			await this.muestraLosErrores(datosUrl);
			this.actualizaBotonSubmit();

			// Fin
			return;
		},
		muestraLosErrores: async (datos) => {
			let errores = await fetch(rutas.validarDatos + datos).then((n) => n.json());
			v.campos.forEach((campo, indice) => {
				// Actualiza los mensajes de error
				DOM.mensajesError[indice].innerHTML = errores[campo];

				// Acciones si hay mensajes de error
				if (errores[campo]) {
					DOM.iconosOK[indice].classList.add("ocultar");
					DOM.iconosError[indice].classList.remove("ocultar");
				} else {
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
		submitForm: async function (e) {
			e.preventDefault();
			if (DOM.submit.classList.contains("inactivo")) this.statusInicial(true);
			else DOM.form.submit();
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
		let campo = e.target.name;
		let valor = e.target.value;
		let adicionales = "";

		// Convierte los ID de los países elegidos, en un texto
		if (campo == "paises") {
			FN.actualizaPaises();
			// Actualiza los valores para 'campo' y 'valor'
			campo = DOM.paisesID.name;
			valor = DOM.paisesID.value;
		}
		// Campos combinados
		if (campo == "anoEstreno") {
			if (DOM.anoFin) adicionales += "&anoFin=" + encodeURIComponent(DOM.anoFin.value);
			adicionales += "&nombreOriginal=" + encodeURIComponent(DOM.nombreOriginal.value);
			adicionales += "&nombreCastellano=" + encodeURIComponent(DOM.nombreCastellano.value);
			adicionales += "&entidad=" + encodeURIComponent(v.entidad);
		}
		if (campo == "anoFin") adicionales += "&anoEstreno=" + encodeURIComponent(DOM.anoEstreno.value);
		if (campo == "nombreOriginal" || campo == "nombreCastellano") {
			adicionales += "&anoEstreno=" + encodeURIComponent(DOM.anoEstreno.value);
			adicionales += "&entidad=" + encodeURIComponent(v.entidad);
		}

		// Prepara los datosUrl con los datos a validar
		let datosUrl = campo + "=" + encodeURIComponent(valor) + adicionales;

		// Validar errores
		await FN.muestraLosErrores(datosUrl, true);

		// Actualiza botón Submit
		FN.actualizaBotonSubmit();
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
	FN.statusInicial(true);
});

// Variables
let url = location.pathname;
let paso = url.slice(url.lastIndexOf("/") + 1);
