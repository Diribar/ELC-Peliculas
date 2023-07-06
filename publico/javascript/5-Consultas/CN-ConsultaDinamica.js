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
		prefsDeCabecera: FN.obtiene.prefsDeCabecera(DOM),
	};
	v = {
		...v,
		filtroPropio: !!v.filtroPersCabecera.usuario_id,
	};
	// filtroPers:{
	// 			cabecera=
	// 		}
	// Eventos

	// Start-up

	botoneraActivaInactiva({filtroPropio, hayCambios, DOM});
});

// Obtiene el configCons_id
// Actualiza las preferencias
// Actualiza la botonera
