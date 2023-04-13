"use strict";
window.addEventListener("load", async () => {
	// Variables
	let DOM = {
		// Variables generales
		dataEntry: document.querySelector("#dataEntry"),
		botonSubmit: document.querySelector(".flechas button[type='submit']"),
		// Variables de errores
		iconoOK: document.querySelectorAll("#dataEntry .OK .fa-circle-check"),
		iconoError: document.querySelectorAll("#dataEntry .OK .fa-circle-xmark"),
		mensajeError: document.querySelectorAll("#dataEntry .OK .mensajeError"),
		// Campos comunes a 'personajes' y 'hechos'
		nombre: document.querySelector("#dataEntry input[name='nombre']"),
		descripcion: document.querySelector("#dataEntry textarea[name='descripcion']"),
	};
	let rutas = {
		// Rutas
		validacion: "/rclv/api/valida-sector/?funcion=",
	};
	let varios = {
		// Variables que se obtienen del url
		entidad: new URL(location.href).searchParams.get("entidad"),
		id: new URL(location.href).searchParams.get("id"),
		// Errores
		camposError: ["nombre"],
		OK: {},
		errores: {},
		// Otros
		largoMaximo: {nombre: 30, descripcion: 100},
	};

	// -------------------------------------------------------
	// Funciones
	let impactos = {
		nombre: {},
	};
	let validacs = {
		// Sectores
		nombre: {
			nombre: async () => {
				// Verifica errores en el sector 'nombre', campo 'nombre'
				let params = "&nombre=" + encodeURIComponent(DOM.nombre.value) + "&entidad=" + varios.entidad;

				// Lo agrega lo referido a la aparición mariana
				if (varios.hechos) {
					let solo_cfc = opcionElegida(DOM.solo_cfc);
					let epoca_id = opcionElegida(DOM.epocas_id);
					let ano = FN_ano(DOM.ano.value);
					let ama = opcionElegida(DOM.ama).value;
					if (solo_cfc.value == 1 && epoca_id.value == "pst" && ano > 1100 && ama == 1) params += "&ama=1";
				}

				// Averigua los errores
				varios.errores.nombre = await fetch(rutas.validacion + "nombre" + params).then((n) => n.json());

				// Si hay errores, cambia el OK a false
				if (varios.errores.nombre) varios.OK.nombre = false;
				else if (!varios.personajes) varios.OK.nombre = !varios.errores.nombre;

				// Fin
				return;
			},
		},
		muestraErrorOK: (i, ocultarOK) => {
			// Íconos de OK
			varios.OK[varios.camposError[i]] && !ocultarOK
				? DOM.iconoOK[i].classList.remove("ocultar")
				: DOM.iconoOK[i].classList.add("ocultar");
			// Íconos de error
			varios.errores[varios.camposError[i]]
				? DOM.iconoError[i].classList.remove("ocultar")
				: DOM.iconoError[i].classList.add("ocultar");
			// Mensaje de error
			DOM.mensajeError[i].innerHTML = varios.errores[varios.camposError[i]] ? varios.errores[varios.camposError[i]] : "";
		},
		muestraErroresOK: function () {
			// Muestra los íconos de Error y OK
			for (let i = 0; i < varios.camposError.length; i++) this.muestraErrorOK(i);
		},
		botonSubmit: () => {
			// Botón submit
			let resultado = Object.values(varios.OK);
			let resultadosTrue = resultado.length ? resultado.every((n) => !!n) : false;
			resultadosTrue && resultado.length == varios.camposError.length
				? DOM.botonSubmit.classList.remove("inactivo")
				: DOM.botonSubmit.classList.add("inactivo");
		},
		startUp: async function (forzar) {
			// 1. Valida el nombre
			if (DOM.nombre.value || (forzar && varios.errores.nombre == undefined)) {
			}

			// Fin
			this.muestraErroresOK();
			this.botonSubmit();
		},
	};

	// Correcciones mientras se escribe
	DOM.dataEntry.addEventListener("input", async (e) => {
		let campo = e.target.name;
		// Acciones si se cambia el nombre o apodo
		if (["nombre", "descripcion"].includes(campo)) {
			// Variables
			let valor = DOM[campo].value;
			// 1. Primera letra en mayúscula
			DOM[campo].value = valor.slice(0, 1).toUpperCase() + valor.slice(1);
			valor = DOM[campo].value;
			// 2. Quita los caracteres no deseados
			DOM[campo].value = valor
				.replace(/[^a-záéíóúüñ'.-\s]/gi, "")
				.replace(/ +/g, " ")
				.replace(/\t/g, "")
				.replace(/\r/g, "");
			valor = DOM[campo].value;
			// 4. Quita los caracteres que exceden el largo permitido
			let largoMaximo = varios.largoMaximo[campo];
			if (valor.length > largoMaximo) DOM[campo].value = valor.slice(0, largoMaximo);
			// Revisa los errores y los publica si existen
			// await validacs.nombre[campo]();
			validacs.muestraErrorOK(0, true);
		}
	});
	// Acciones cuando se  confirma el input
	DOM.dataEntry.addEventListener("change", async (e) => {
		// Variables
		let campo = e.target.name;
		// 1. Acciones si se cambia el sector Nombre
		if (campo == "nombre" && DOM.nombre.value) await validacs.nombre.nombre();

		// Final de la rutina
		validacs.muestraErroresOK();
		validacs.botonSubmit();
	});
	// Botón submit
	DOM.botonSubmit.addEventListener("click", async (e) => {
		// Acciones si el botón está inactivo
		if (DOM.botonSubmit.classList.contains("inactivo")) {
			e.preventDefault();
			await validacs.startUp(true);
		}
		// Si el botón está activo, función 'submit'
		else DOM.dataEntry.submit();
	});

	// Status inicial
	await validacs.startUp();
});

// Funciones
