"use strict";
// Variables de start-up
const ruta = "/consultas/api/";
const rutas = {
	// Obtiene
	obtiene: {
		cabeceraFiltrosPers: ruta + "obtiene-la-cabecera-de-filtrosPers/",
		prefsFiltroPers: ruta + "obtiene-las-preferencias-del-filtroPers/?filtroPers_id=", // opcionesFiltroPers
		layoutsMasOrdenes: ruta + "obtiene-layouts-y-ordenes", // layoutsOrdenes
		diasDelAno: ruta + "obtiene-los-dias-del-ano", // diasDelAno
	},

	guarda: {
		filtroPersNuevo: ruta + "guarda-nuevo-filtroPers/?datos=",
	},

	// Actualiza
	actualiza: {
		filtroPers_id: ruta + "actualiza-filtroPers_id/?filtroPers_id=", // guardaFiltroID
		prefsFiltroPers: ruta + "actualiza-prefs-filtroPers/?datos=", // actualiza
	},

	// Resultados
	resultados: {
		prods: ruta + "obtiene-los-productos/?datos=", // productos
		rclvs: ruta + "obtiene-los-rclvs/?datos=", // rclvs
	},
};

// Funciones
let FN = {
	actualiza:{
		botoneraActivaInactiva: ({filtroDeUsuario, hayCambios,DOM}) => {
			// Variables
			let claseNuevo = DOM.filtroPersNuevo.className.includes("nuevo");
			let claseEdicion = DOM.filtroPersNuevo.className.includes("edicion");
	
			// Activa / Inactiva ícono Nuevo
			!claseEdicion ? DOM.nuevo.classList.remove("inactivo") : DOM.nuevo.classList.add("inactivo");
	
			// Activa / Inactiva ícono Deshacer
			!claseNuevo && !claseEdicion && hayCambios
				? DOM.deshacer.classList.remove("inactivo")
				: DOM.deshacer.classList.add("inactivo");
	
			// Activa / Inactiva ícono Guardar
			claseNuevo || (filtroDeUsuario && (claseEdicion || hayCambios))
				? DOM.guardar.classList.remove("inactivo")
				: DOM.guardar.classList.add("inactivo");
	
			// Activa / Inactiva ícono Edición
			!claseNuevo && filtroDeUsuario && !hayCambios
				? DOM.edicion.classList.remove("inactivo")
				: DOM.edicion.classList.add("inactivo");
	
			// Activa / Inactiva ícono Eliminar
			!claseNuevo && !claseEdicion && filtroDeUsuario && !hayCambios
				? DOM.elimina.classList.remove("inactivo")
				: DOM.elimina.classList.add("inactivo");
	
			// Fin
			return;
		},
		valorDePrefs: async (filtroPers_id) => {
			// Variables
			let DOM = {
				prefsSimples: document.querySelectorAll("#cuerpo .prefSimple .input"),
				ascDesInputs: document.querySelectorAll("#encabezado #ascDes input"),
			};
			const prefsFiltroPers = await fetch(rutas.obtiene.prefsFiltroPers + filtroPers_id).then((n) => n.json());
	
			// Actualiza las preferencias simples (Encabezado + Filtros)
			for (let prefSimple of DOM.prefsSimples)
				prefSimple.value = prefsFiltroPers[prefSimple.name] ? prefsFiltroPers[prefSimple.name] : "";
	
			// Actualiza las preferencias 'AscDes'
			for (let ascDesInput of DOM.ascDesInputs)
				ascDesInput.checked = prefsFiltroPers.ascDes && ascDesInput.value == prefsFiltroPers.ascDes;
		},
		sessionCookieUsuarioConFiltroPers_id_: (filtroPers_id) => {
			// Variables
			let DOM = {filtroPers: document.querySelector("#filtroPers select[name='filtroPers']")};
			const filtroPers_id = DOM.filtroPers.value;
	
			// Actualiza el filtroPers_id en la session, cookie y el usuario
			if (filtroPers_id) fetch(rutas.actualiza.filtroPers_id + filtroPers_id);
			else return;
	
			// Fin
			return;
		},
	}
};
