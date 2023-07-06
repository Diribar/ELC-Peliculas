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
		iconos: document.querySelectorAll("#filtroPers #iconos i"),

		// Preferencias
		prefsSimples: document.querySelectorAll("#cuerpo .prefSimple .input"),
		ascDesInputs: document.querySelectorAll("#encabezado #ascDes input"),
	};
	let v = {
		hayCambios: false,
		nombreOK: false,
		configCons_id: DOM.configCons_id.value,
	};
	v.prefsDeCabecera = await FN.obtiene.prefsDeCabecera(v.configCons_id);
	v = {
		...v,
		filtroPropio: !!v.prefsDeCabecera.usuario_id,
	};

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
			FN.actualiza.botoneraActivaInactiva({v, DOM});
			return;
		});
	});

	// Start-up
	FN.actualiza.botoneraActivaInactiva({v, DOM});
});
