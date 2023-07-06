"use strict";
window.addEventListener("load", async () => {
	// Variable DOM
	let DOM = {
		// Encabezado
		layout_id: document.querySelector("#encabezado select[name='layout_id']"),
		orden_id: document.querySelector("#encabezado select[name='orden_id']"),
		orden_idOpciones: document.querySelectorAll("#encabezado select[name='orden_id'] option:not(option[value=''])"),
		ascDesSector: document.querySelector("#encabezado #ascDes"),
		ascDesInputs: document.querySelectorAll("#encabezado #ascDes input"),
		contador_de_prods: document.querySelector("#encabezado #derecha #contador_de_prods"),

		// Filtro Cabecera - Nombre
		configCons_id: document.querySelector("#filtroPers select[name='configCons_id']"),
		configNuevaNombre: document.querySelector("#filtroPers #configNueva input[name='nombre']"),
		// Filtro Cabecera - Íconos de la botonera
		nuevo: document.querySelector("#filtroPers i#nuevo"),
		deshacer: document.querySelector("#filtroPers i#deshacer"),
		guardar: document.querySelector("#filtroPers i#guardar"),
		edicion: document.querySelector("#filtroPers i#edicion"),
		eliminar: document.querySelector("#filtroPers i#eliminar"),
		iconos: document.querySelectorAll("#filtroPers #iconos i"),

		// Preferencias
		prefsSimples: document.querySelectorAll("#cuerpo .prefSimple"),
		ascDesInputs: document.querySelectorAll("#encabezado #ascDes input"),
	};

	// Variables varias
	const {cn_layouts: layoutsBD, cn_ordenes: ordenesBD} = await estaticas.obtiene.layoutsMasOrdenes();
	let v = {
		hayCambios: false,
		nombreOK: false,
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
