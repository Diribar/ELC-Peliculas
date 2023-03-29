"use strict";
window.addEventListener("load", async () => {
	// Variables
	let v = {
		// Obtiene inputs
		layout: document.querySelector("#encabezado select[name='layout']"),
		orden: document.querySelector("#encabezado select[name='orden']"),
		ordenOpciones: document.querySelectorAll("#encabezado select[name='orden'] option:not(option[value=''])"),

		// Rutas
		rutaLayoutsOrdenes: "/consultas/api/layouts-y-ordenes",

		// Variables directrices
		notNull: "",
		cfc: "",
		epoca_id: "",
		ocurrio: "",
	};
	console.log(v.ordenOpciones);
	// Obtiene tabla de layouts y ordenes
	const {layouts,ordenes} = await fetch(v.rutaLayoutsOrdenes).then((n) => n.json());

	// Funciones
	let FN = {
		// Impactos de layout
		impactosDELayout: () => {
			v.notNull = v.layout.value;
			// Oculta/Muestra las opciones que corresponden
			v.ordenOpcionesBD.forEach((opcion, i) => {
				if (opcion.not_null_in && opcion.not_null_in != v.notNull) {
					ordenOpciones[i].classList.add("ocultar");
					// Si la opción estaba elegida, la 'des-elige'
					if (ordenOpciones[i].checked) v.orden.value = "";
				} else ordenOpciones[i].classList.remove("ocultar");
			});
		},
		// Impactos de orden

		// Impactos de cfc

		// Impactos de ocurrio

		// Impactos de epoca
	};
});
