"use strict";
window.addEventListener("load", async () => {
	// Variable DOM
	let DOM = {
		// Formulario General
		cuerpo: document.querySelector("#cuerpo"),
		// Encabezado, Cabecera, Campos
		prefsSimples: document.querySelectorAll("#cuerpo .prefSimple"),

		// Encabezado
		layout_id: document.querySelector("#encabezado select[name='layout_id']"),
		orden_id: document.querySelector("#encabezado select[name='orden_id']"),
		orden_idOpciones: document.querySelectorAll("#encabezado select[name='orden_id'] option:not(option[value=''])"),
		ascDes: document.querySelector("#encabezado #ascDes"),
		contador_de_prods: document.querySelector("#encabezado #derecha #contador_de_prods"),

		// Filtro Cabecera - Nombre
		configNuevaNombre: document.querySelector("#configDeCabecera #configNueva input[name='nombre']"),
		configCons_id: document.querySelector("#configDeCabecera select[name='configCons_id']"),
		// Filtro Cabecera - Íconos de la botonera
		nuevo: document.querySelector("#configDeCabecera i#nuevo"),
		deshacer: document.querySelector("#configDeCabecera i#deshacer"),
		guardar: document.querySelector("#configDeCabecera i#guardar"),
		edicion: document.querySelector("#configDeCabecera i#edicion"),
		eliminar: document.querySelector("#configDeCabecera i#eliminar"),
		iconos: document.querySelectorAll("#configDeCabecera #iconos i"),

		// Campos
		mostrarSiEncabOK: document.querySelectorAll("#configCons #configsDeCampo .mostrarSiEncabOK"),

		// Zona de productos
		asegurate: document.querySelector("#zona_de_prods #comencemos button#rojo"),
		comencemos: document.querySelector("#zona_de_prods #comencemos button#verde"),
	};

	// Variables varias
	const {cn_layouts: layoutsBD, cn_ordenes: ordenesBD} = await obtiene.opcionesDeLayoutMasOrden();
	let v = {layoutsBD, ordenesBD};
	v = {...v, ...(await actualiza.valoresIniciales({v, DOM}))};

	// Eventos - Botonera
	DOM.iconos.forEach((icono, i) => {
		icono.addEventListener("click", (e) => {
			// Si el ícono está inactivo, interrumpe la función
			if (e.target.className.includes("inactivo")) return;

			// Acciones para cada caso
			if (e.target.id == DOM.nuevo.id) {
				// Variables
				DOM.configNuevaNombre.value = "";
				v.nombreOK = false;
				// Clases
				DOM.configNuevaNombre.className.includes("nuevo")
					? DOM.configNuevaNombre.classList.remove("nuevo") // Acciones para 'off'
					: DOM.configNuevaNombre.classList.add("nuevo"); // Acciones para 'on'
			}

			// Fin
			actualiza.botoneraActivaInactiva({v, DOM});
			return;
		});
	});

	// Eventos - Cambio de Configuración
	DOM.cuerpo.addEventListener("change", async (e) => {
		// Variables
		const campoNombre = e.target.name;
		const campoValor = e.target.value;

		// Acciones si se cambio la configuración
		if (campoNombre == "configCons_id") {
			// Averigua si hay un error y en caso afirmativo, interrumpe la función
			const existe = await verifica.configCons_id({v, DOM});
			if (!existe) return;

			// Más acciones
			await actualiza.valoresIniciales({v, DOM});
			guardaEnBD.configCons_id(v.configCons_id);
			actualiza.botoneraActivaInactiva({v, DOM});
			await actualiza.statusInicialCampos({configCons_id: v.configCons_id, DOM});
			actualiza.cartelComencemosVisible(DOM);
			resultados.obtiene()
			actualiza.contador()
		}

		// Fin
		return;
	});

	// Start-up
	impactos.configDinamica({v, DOM});
	actualiza.botoneraActivaInactiva({v, DOM});
});

// Variables
const ruta = "/consultas/api/";
let configCons = {}; // donde se consolida la configuración de la consulta
