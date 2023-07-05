"use strict";
window.addEventListener("load", async () => {
	// Variables
	let DOM = {
		// Filtro Personalizado - Nombre
		filtroPers: document.querySelector("#filtroPers select[name='filtroPers']"),
		filtroPersNuevo: document.querySelector("#filtroPers #filtroPersNuevo"), // div del input 'filtroPersNuevo'
		// Filtro Personalizado - Íconos de la botonera
		nuevo: document.querySelector("#filtroPers i#nuevo"),
		deshacer: document.querySelector("#filtroPers i#deshacer"),
		guardar: document.querySelector("#filtroPers i#guardar"),
		edicion: document.querySelector("#filtroPers i#edicion"),
		eliminar: document.querySelector("#filtroPers i#eliminar"),
	};
	let v = {
		hayCambios: false,
		filtroPers_id:DOM.filtroPers.value
		
	};
// filtroPers:{
// 			cabecera=
// 		}
	// Eventos

	// Start-up

	botoneraActivaInactiva({filtroDeUsuario, hayCambios, DOM});
});

// Obtiene el filtroPers_id
// Actualiza las preferencias
// Actualiza la botonera