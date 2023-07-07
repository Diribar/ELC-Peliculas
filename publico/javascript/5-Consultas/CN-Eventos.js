"use strict";
window.addEventListener("load", async () => {
	// Variable DOM
	let DOM = {
		// Formulario General
		cuerpo: document.querySelector("#cuerpo"),
		// Encabezado, Cabecera, Campos
		prefsSimples: document.querySelectorAll("#cuerpo :is(#encabezado, #configsDeCampo) select"),
		encabezado: document.querySelector("#encabezado"),
		configCabecera: document.querySelector("#configDeCabecera"),
		configCampos: document.querySelector("#configCons #configsDeCampo nav"),
		// Zona de productos
		zonaProds: document.querySelector("#zona_de_prods"),
	};
	DOM = {
		...DOM,

		// Encabezado
		layout_id: DOM.encabezado.querySelector("select[name='layout_id']"),
		orden_id: DOM.encabezado.querySelector("select[name='orden_id']"),
		orden_idOpciones: DOM.encabezado.querySelectorAll("select[name='orden_id'] option:not(option[value=''])"),
		ascDes: DOM.encabezado.querySelector("#ascDes"),
		contador_de_prods: DOM.encabezado.querySelector("#derecha #contador_de_prods"),

		// Configuración de Cabecera
		configNuevaNombre: DOM.configCabecera.querySelector("#configNueva input[name='nombre']"),
		configCons_id: DOM.configCabecera.querySelector("select[name='configCons_id']"),
		iconos: DOM.configCabecera.querySelectorAll("#iconos i"),

		// Configuración de Campos
		camposPresenciaEventual: DOM.configCampos.querySelectorAll("select:not(.presenciaEstable)"),
		camposPresenciaEstable: DOM.configCampos.querySelectorAll(".presenciaEstable"),
		palClave: DOM.configCampos.querySelector("#palabrasClave"),

		// Zona de productos
		asegurate: DOM.zonaProds.querySelector("#comencemos button#rojo"),
		comencemos: DOM.zonaProds.querySelector("#comencemos button#verde"),
	};
	for (let icono of DOM.iconos) DOM[icono.id] = icono;
	for (let campo of DOM.camposPresenciaEventual) DOM[campo.name] = campo;

	// Variables varias
	const {cn_layouts: layoutsBD, cn_ordenes: ordenesBD} = await obtiene.opcionesDeLayoutMasOrden();
	let v = {layoutsBD, ordenesBD};
	v = {...v, ...(await actualiza.valoresInicialesDeObjetoV({v, DOM}))};

	// Eventos - Cambio de Configuración
	DOM.cuerpo.addEventListener("change", async (e) => {
		// Variables
		const campoNombre = e.target.name;
		const campoValor = e.target.value;
		configCons = {};

		// Acciones si se cambia la configuración
		if (campoNombre == "configCons_id") {
			// Averigua si hay un error y en caso afirmativo, interrumpe la función
			const existe = await verifica.configCons_id({v, DOM});
			if (!existe) return;

			// Funciones
			await cambioDeConfig_id({v, DOM});
		} else v.hayCambios = true;

		// Palabras clave
		if (campoNombre == "palabrasClave")
			campoValor ? DOM.palClave.classList.add("verde") : DOM.palClave.classList.remove("verde");

		// Funciones
		await cambioDeCampos({v, DOM});

		// Fin
		return;
	});

	// Eventos - Botonera
	DOM.iconos.forEach((icono, i) => {
		icono.addEventListener("click", async (e) => {
			// Si el ícono está inactivo, interrumpe la función
			if (e.target.className.includes("inactivo")) return;

			// Acciones para Nuevo
			if (e.target.id == "nuevo") {
				// Variables
				DOM.configNuevaNombre.value = "";
				v.nombreOK = false;

				// Agrega/Quita la clase 'nuevo' al input
				DOM.configNuevaNombre.classList.toggle("nuevo"); // Acciones para 'off'
			}
			// Acciones para Deshacer
			else if (e.target.id == "deshacer") {
				// Funciones
				await actualiza.valoresInicialesDeObjetoV({v, DOM});
				await actualiza.statusInicialCampos({v, DOM});
				await cambioDeCampos({v, DOM});

				// Clases
			}

			// Fin
			actualiza.botoneraActivaInactiva({v, DOM});
			return;
		});
	});

	// Start-up
	actualizaConfigCons.consolidado({v, DOM});
	actualiza.botoneraActivaInactiva({v, DOM});
});

// Variables
const ruta = "/consultas/api/";
let configCons = {}; // donde se consolida la configuración de la consulta
