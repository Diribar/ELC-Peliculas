"use strict";
window.addEventListener("load", async () => {
	// Variables
	let DOM = {
		// Filtro Personalizado - Nombre
		configActual_id: document.querySelector("#filtroPers select[name='configActual_id']"),
		configNuevaNombre: document.querySelector("#filtroPers #configNueva input[name='nombre']"),
		// Filtro Personalizado - Íconos de la botonera
		nuevo: document.querySelector("#filtroPers i#nuevo"),
		deshacer: document.querySelector("#filtroPers i#deshacer"),
		guardar: document.querySelector("#filtroPers i#guardar"),
		edicion: document.querySelector("#filtroPers i#edicion"),
		eliminar: document.querySelector("#filtroPers i#eliminar"),
	};
	let v = {
		hayCambios: false,
		configActual_id: DOM.configActual_id.value,
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

// Obtiene el configActual_id
// Actualiza las preferencias
// Actualiza la botonera
