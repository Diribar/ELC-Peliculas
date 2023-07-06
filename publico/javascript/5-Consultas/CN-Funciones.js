"use strict";
// Variables de start-up
const ruta = "/consultas/api/";
const rutas = {
	// Obtiene
	obtiene: {
		prefsDeCabecera: ruta + "obtiene-las-preferencias-de-cabecera/?configCons_id=",
		prefsDeCampos: ruta + "obtiene-las-preferencias-de-campos/?configCons_id=", // opcionesFiltroPers
	},

	guarda: {
		configNueva: ruta + "guarda-nueva-configuracion/?configuracion=",
	},

	// Actualiza
	actualiza: {
		configCons_id: ruta + "actualiza-configCons_id/?configCons_id=", // guardaFiltroID
		prefsDeCampos: ruta + "actualiza-prefs-de-campo/?configuracion=", // actualiza
	},

	// Resultados
	resultados: {
		prods: ruta + "obtiene-los-productos/?datos=", // productos
		rclvs: ruta + "obtiene-los-rclvs/?datos=", // rclvs
	},
};

// Funciones
let FN = {
	obtiene: {
		prefsDeCabecera: (configCons_id) => {
			return fetch(rutas.obtiene.prefsDeCabecera + configCons_id).then((n) => n.json());
		},
	},
	actualiza: {
		botoneraActivaInactiva: ({v, DOM}) => {
			// Variables
			let claseNuevo = DOM.configNuevaNombre.className.includes("nuevo");
			let claseEdicion = DOM.configNuevaNombre.className.includes("edicion");

			// Activa / Inactiva ícono Nuevo
			!claseEdicion ? DOM.nuevo.classList.remove("inactivo") : DOM.nuevo.classList.add("inactivo");

			// Activa / Inactiva ícono Deshacer
			!claseNuevo && !claseEdicion && v.hayCambios
				? DOM.deshacer.classList.remove("inactivo")
				: DOM.deshacer.classList.add("inactivo");

			// Activa / Inactiva ícono Guardar
			claseNuevo || (v.filtroPropio && (claseEdicion || v.hayCambios))
				? DOM.guardar.classList.remove("inactivo")
				: DOM.guardar.classList.add("inactivo");

			// Activa / Inactiva ícono Edición
			!claseNuevo && v.filtroPropio && !v.hayCambios
				? DOM.edicion.classList.remove("inactivo")
				: DOM.edicion.classList.add("inactivo");

			// Activa / Inactiva ícono Eliminar
			!claseNuevo && !claseEdicion && v.filtroPropio && !v.hayCambios
				? DOM.elimina.classList.remove("inactivo")
				: DOM.elimina.classList.add("inactivo");

			// Fin
			return;
		},
		valorDePrefs: async (DOM) => {
			// Variables
			const configCons_id = DOM.configCons_id.value;
			const prefsDeCampos = await fetch(rutas.obtiene.prefsDeCampos + configCons_id).then((n) => n.json());

			// Actualiza las preferencias simples (Encabezado + Filtros)
			for (let prefSimple of DOM.prefsSimples)
				prefSimple.value = prefsDeCampos[prefSimple.name] ? prefsDeCampos[prefSimple.name] : "";

			// Actualiza las preferencias 'AscDes'
			for (let ascDesInput of DOM.ascDesInputs)
				ascDesInput.checked = prefsDeCampos.ascDes && ascDesInput.value == prefsDeCampos.ascDes;
		},
		sessionCookieUsuarioCon_configCons_id: (DOM) => {
			// Variables
			const configCons_id = DOM.configCons_id.value;

			// Actualiza el configCons_id en la session, cookie y el usuario
			if (configCons_id) fetch(rutas.actualiza.configCons_id + configCons_id);
			else return;

			// Fin
			return;
		},
	},
};
// layoutsMasOrdenes: ruta + "obtiene-layouts-y-ordenes", // layoutsOrdenes
// diasDelAno: ruta + "obtiene-los-dias-del-ano", // diasDelAno
