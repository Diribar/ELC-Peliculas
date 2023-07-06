"use strict";
window.addEventListener("load", async () => {
	// Variable DOM
	let DOM = {
		// Encabezado, Cabecera, Campos
		prefsSimples: document.querySelectorAll("#cuerpo .prefSimple"),
		ascDesInputs: document.querySelectorAll("#encabezado #ascDes input"),

		// Encabezado
		layout_id: document.querySelector("#encabezado select[name='layout_id']"),
		orden_id: document.querySelector("#encabezado select[name='orden_id']"),
		orden_idOpciones: document.querySelectorAll("#encabezado select[name='orden_id'] option:not(option[value=''])"),
		ascDes: document.querySelector("#encabezado #ascDes"),
		contador_de_prods: document.querySelector("#encabezado #derecha #contador_de_prods"),

		// Filtro Cabecera - Nombre
		configCons_id: document.querySelector("#configCabecera select[name='configCons_id']"),
		configNuevaNombre: document.querySelector("#configCabecera #configNueva input[name='nombre']"),
		// Filtro Cabecera - Íconos de la botonera
		nuevo: document.querySelector("#configCabecera i#nuevo"),
		deshacer: document.querySelector("#configCabecera i#deshacer"),
		guardar: document.querySelector("#configCabecera i#guardar"),
		edicion: document.querySelector("#configCabecera i#edicion"),
		eliminar: document.querySelector("#configCabecera i#eliminar"),
		iconos: document.querySelectorAll("#configCabecera #iconos i"),

		// Campos
		mostrarSiEncabOK: document.querySelectorAll("#configCons #configsDeCampo .mostrarSiEncabOK"),

		// Zona de productos
		asegurate: document.querySelector("#zona_de_prods #comencemos button#rojo"),
		comencemos: document.querySelector("#zona_de_prods #comencemos button#verde"),
	};

	// Variables varias
	const {cn_layouts: layoutsBD, cn_ordenes: ordenesBD} = await estaticas.obtiene.layoutsMasOrdenes();
	let v = {
		hayCambios: false,
		nombreOK: false,
		comencemos: true,
		configCons_id: DOM.configCons_id.value,
		layoutsBD,
		ordenesBD,
	};
	v.prefsDeCabecera = await estaticas.obtiene.prefsDeCabecera(v.configCons_id);
	v.filtroPropio = !!v.prefsDeCabecera.usuario_id;

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
			estaticas.actualiza.botoneraActivaInactiva({v, DOM});
			return;
		});
	});

	// Start-up
	impactos.configDinamica({v, DOM});
	estaticas.actualiza.botoneraActivaInactiva({v, DOM});
});

// Variables
const ruta = "/consultas/api/";
let configCons = {}; // donde se consolida la configuración de la consulta
