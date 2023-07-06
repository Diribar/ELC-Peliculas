"use strict";
const ruta = "/consultas/api/";

let FN = {
	obtiene: {
		prefsDeCabecera: (configCons_id) => {
			const rutaCompleta = ruta + "obtiene-las-preferencias-de-cabecera/?configCons_id=";
			return fetch(rutaCompleta + configCons_id).then((n) => n.json());
		},
		prefsDeCampos: (configCons_id) => {
			const rutaCompleta = ruta + "obtiene-las-preferencias-de-campos/?configCons_id=";
			return fetch(rutaCompleta + configCons_id).then((n) => n.json());
		},
		prefsEnVista: (DOM) => {
			
		},
	},
	actualiza: {
		botoneraActivaInactiva: ({v, DOM}) => {
			// Variables
			let claseNuevo = DOM.configNuevaNombre.className.includes("nuevo");
			let claseEdicion = DOM.configNuevaNombre.className.includes("edicion");

			// Ícono Nuevo
			!claseEdicion ? DOM.nuevo.classList.remove("inactivo") : DOM.nuevo.classList.add("inactivo");

			// Ícono Deshacer
			!claseNuevo && !claseEdicion && v.hayCambios
				? DOM.deshacer.classList.remove("inactivo")
				: DOM.deshacer.classList.add("inactivo");

			// Ícono Guardar
			v.nombreOK && (claseNuevo || (v.filtroPropio && (claseEdicion || v.hayCambios)))
				? DOM.guardar.classList.remove("inactivo")
				: DOM.guardar.classList.add("inactivo");

			// Ícono Edición
			!claseNuevo && v.filtroPropio && !v.hayCambios
				? DOM.edicion.classList.remove("inactivo")
				: DOM.edicion.classList.add("inactivo");

			// Ícono Eliminar
			!claseNuevo && !claseEdicion && v.filtroPropio && !v.hayCambios
				? DOM.eliminar.classList.remove("inactivo")
				: DOM.eliminar.classList.add("inactivo");

			// Fin
			return;
		},
		prefsDeCamposEnVista: async ({DOM, prefsDeCampos}) => {
			// Actualiza las preferencias simples (Encabezado + Filtros)
			for (let prefSimple of DOM.prefsSimples)
				prefSimple.value = prefsDeCampos[prefSimple.name] ? prefsDeCampos[prefSimple.name] : "";

			// Actualiza las preferencias 'AscDes'
			for (let ascDesInput of DOM.ascDesInputs)
				ascDesInput.checked = prefsDeCampos.ascDes && ascDesInput.value == prefsDeCampos.ascDes;

			// Fin
			return;
		},
		contador: {},
		nombreEnVista: {},
	},
	guardaEnBD: {
		actualizaConfigCons_id: (configCons_id) => {
			const rutaCompleta = ruta + "actualiza-configCons_id/?configCons_id=";
			if (configCons_id) fetch(rutaCompleta + configCons_id);

			// Fin
			return;
		},
		creaUnaConfiguracion: (configuracion) => {
			const rutaCompleta = ruta + "crea-una-configuracion/?configuracion=";
			return fetch(rutaCompleta + configuracion).then((n) => n.json());
		},
		guardaUnaConfiguracion: (configuracion) => {
			const rutaCompleta = ruta + "guarda-una-configuracion/?configuracion=";
			fetch(rutaCompleta + configuracion).then((n) => n.json());

			// Fin
			return;
		},
	},
	resultados: {},
};
// layoutsMasOrdenes: ruta + "obtiene-layouts-y-ordenes", // layoutsOrdenes
// diasDelAno: ruta + "obtiene-los-dias-del-ano", // diasDelAno
