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

		// Campos - Varios
		nombre: document.querySelector("#dataEntry input[name='nombre']"),
		desconocida: document.querySelector("#dataEntry input[name='desconocida']"),
		// Campos - Vigencia
		camposFecha: document.querySelectorAll("#dataEntry #vigencia .input"),
		desde_mes_id: document.querySelector("#dataEntry select[name='desde_mes_id']"),
		desde_dia: document.querySelector("#dataEntry select[name='desde_dia']"),
		hasta_mes_id: document.querySelector("#dataEntry select[name='hasta_mes_id']"),
		hasta_dia: document.querySelector("#dataEntry select[name='hasta_dia']"),
		// Campos - Descripción
		descripcion: document.querySelector("#dataEntry textarea[name='descripcion']"),
		pendiente: document.querySelector("#segundaCol #pendiente"),
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
		camposFecha: Array.from(DOM.camposFecha).map((n) => n.name),
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

	// Previene el uso del 'enter'
	DOM.descripcion.addEventListener("keypress", (e) => {
		if (e.key == "Enter") e.preventDefault();
	});
	// Correcciones mientras se escribe
	DOM.dataEntry.addEventListener("input", async (e) => {
		// Variables
		const campo = e.target.name;
		let valor = e.target.value;
		const largoMaximo = varios.largoMaximo[campo];

		// Validaciones
		if (["input", "textarea"].includes(e.target.localName) && valor.length) {
			// 1. Quita los caracteres no deseados
			valor = valor
				.replace(/ +/g, " ")
				.replace(/[^a-záéíóúüñ ,.'"\d\-]+$/gi, "")
				.replace(/\n/g, "")
				.replace(/\t/g, "")
				.replace(/\r/g, "");

			// 2. El primer caracter no puede ser un espacio
			if (valor.length && valor.slice(0, 1) == " ") valor = valor.slice(1);

			// 3. Primera letra en mayúscula
			if (valor.length) valor = valor.slice(0, 1).toUpperCase() + valor.slice(1);

			// 4. Quita los caracteres que exceden el largo permitido
			valor = valor.slice(0, largoMaximo);

			// 5. Actualiza el valor en el DOM
			e.target.value = valor;

			// 6. Actualiza el contador de caracteres
			if (campo == "descripcion") DOM.pendiente.innerHTML = 100 - valor.length;
		}

		// Revisa los errores y los publica si existen
		// await validacs.nombre[campo]();
		// validacs.muestraErrorOK(0, true);
	});
	// Acciones cuando se  confirma el input
	DOM.dataEntry.addEventListener("change", async (e) => {
		// Variables
		let campo = e.target.name;
		// 1. Acciones si se cambia el sector Nombre
		if (campo == "nombre" && DOM.nombre.value) await validacs.nombre.nombre();

		// 2. Acciones si se cambia el sector Vigencia
		if (varios.camposFecha.includes(campo)) {
			if (campo.endsWith("mes_id")) impactos.vigencia.muestraLosDiasDelMes(campo);
			DOM.desconocida.checked = false;
			let todosConValor = true;
			for (let campoFecha of varios.camposFecha) if (!campoFecha.value) todosConValor = false;
			if (todosConValor) await validacs.vigencia();
		}
		if (campo == "desconocida") {
			if (DOM.desconocida.checked) impactos.vigencia.limpiezaDeMesDia();
			await validacs.vigencia();
		}

		// 3. Acciones si se cambia el sector Descripción
		if (campo == "descripcion") validacs.descripcion();

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
	});

	// Status inicial
	await validacs.startUp();
});

// Funciones
