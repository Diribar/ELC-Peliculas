"use strict";
window.addEventListener("load", async () => {
	// Variables
	let DOM = {
		// Filtro Personalizado - Nombre
		filtroPers_id: document.querySelector("#filtroPers select[name='filtroPers_id']"),
		filtroPersNuevo: document.querySelector("#filtroPers input[name='filtroPersNuevo']"),
		// Filtro Personalizado - Íconos de la botonera
		nuevo: document.querySelector("#filtroPers i#nuevo"),
		deshacer: document.querySelector("#filtroPers i#deshacer"),
		guardar: document.querySelector("#filtroPers i#guardar"),
		edicion: document.querySelector("#filtroPers i#edicion"),
		eliminar: document.querySelector("#filtroPers i#eliminar"),
	};
	let v = {
		hayCambios: false,
		filtroPersCabecera:FN.obtiene.cabeceraFiltroPers(DOM)
	};
	v={
		...v,
		filtroDeUsuario: !!v.filtroPersCabecera.usuario_id
	}
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
