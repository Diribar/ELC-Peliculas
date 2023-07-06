"use strict";
window.addEventListener("load", async () => {
	// Variables
	let DOM = {
		// Filtro Personalizado - Nombre
		configCons_id: document.querySelector("#filtroPers select[name='configCons_id']"),
		configNuevaNombre: document.querySelector("#filtroPers #configNueva input[name='nombre']"),
		// Filtro Personalizado - Íconos de la botonera
		nuevo: document.querySelector("#filtroPers i#nuevo"),
		deshacer: document.querySelector("#filtroPers i#deshacer"),
		guardar: document.querySelector("#filtroPers i#guardar"),
		edicion: document.querySelector("#filtroPers i#edicion"),
		eliminar: document.querySelector("#filtroPers i#eliminar"),

		// Preferencias
		prefsSimples: document.querySelectorAll("#cuerpo .prefSimple .input"),
		ascDesInputs: document.querySelectorAll("#encabezado #ascDes input"),
	};
	let v = {
		hayCambios: false,
		configCons_id: DOM.configCons_id.value,
	};
	(v.prefsDeCabecera = await FN.obtiene.prefsDeCabecera(v.configCons_id)),
		(v = {
			...v,
			filtroPropio: !!v.prefsDeCabecera.usuario_id,
		});

	// Start-up
	console.log(v);
	FN.actualiza.botoneraActivaInactiva({v, DOM});
});

// Obtiene el configCons_id
// Actualiza las preferencias
// Actualiza la botonera
