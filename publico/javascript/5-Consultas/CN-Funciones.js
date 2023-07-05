"use strict";
// Variables de start-up
const ruta = "/consultas/api/";
const rutas = {
	// Obtiene
	obtiene: {
		prefsDeCabecera: ruta + "obtiene-las-preferencias-de-cabecera/?configActual_id=",
		prefsDeCampos: ruta + "obtiene-las-preferencias-de-campos/?configActual_id=", // opcionesFiltroPers
	},

	guarda: {
		configNueva: ruta + "guarda-nueva-configuracion/?configuracion=",
	},

	// Actualiza
	actualiza: {
		configActual_id: ruta + "actualiza-configActual_id/?configActual_id=", // guardaFiltroID
		prefsDeCampos: ruta + "actualiza-prefs-filtroPers/?datos=", // actualiza
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
		prefsDeCabecera: (DOM) => {
			const configActual_id = DOM.configActual_id.value;
			return fetch(rutas.obtiene.cabeceraFiltroPers + configActual_id).then((n) => n.json());
		},
	},
	actualiza: {
		botoneraActivaInactiva: ({filtroPropio, hayCambios, DOM}) => {
			// Variables
			let claseNuevo = DOM.configNuevaNombre.className.includes("nuevo");
			let claseEdicion = DOM.configNuevaNombre.className.includes("edicion");

			// Activa / Inactiva ícono Nuevo
			!claseEdicion ? DOM.nuevo.classList.remove("inactivo") : DOM.nuevo.classList.add("inactivo");

			// Activa / Inactiva ícono Deshacer
			!claseNuevo && !claseEdicion && hayCambios
				? DOM.deshacer.classList.remove("inactivo")
				: DOM.deshacer.classList.add("inactivo");

			// Activa / Inactiva ícono Guardar
			claseNuevo || (filtroPropio && (claseEdicion || hayCambios))
				? DOM.guardar.classList.remove("inactivo")
				: DOM.guardar.classList.add("inactivo");

			// Activa / Inactiva ícono Edición
			!claseNuevo && filtroPropio && !hayCambios
				? DOM.edicion.classList.remove("inactivo")
				: DOM.edicion.classList.add("inactivo");

			// Activa / Inactiva ícono Eliminar
			!claseNuevo && !claseEdicion && filtroPropio && !hayCambios
				? DOM.elimina.classList.remove("inactivo")
				: DOM.elimina.classList.add("inactivo");

			// Fin
			return;
		},
		valorDePrefs: async (configActual_id) => {
			// Variables
			let DOM = {
				prefsSimples: document.querySelectorAll("#cuerpo .prefSimple .input"),
				ascDesInputs: document.querySelectorAll("#encabezado #ascDes input"),
			};
			const prefsDeCampos = await fetch(rutas.obtiene.prefsDeCampos + configActual_id).then((n) => n.json());

			// Actualiza las preferencias simples (Encabezado + Filtros)
			for (let prefSimple of DOM.prefsSimples)
				prefSimple.value = prefsDeCampos[prefSimple.name] ? prefsDeCampos[prefSimple.name] : "";

			// Actualiza las preferencias 'AscDes'
			for (let ascDesInput of DOM.ascDesInputs)
				ascDesInput.checked = prefsDeCampos.ascDes && ascDesInput.value == prefsDeCampos.ascDes;
		},
		sessionCookieUsuarioConFiltroPers_id_: (configActual_id) => {
			// Variables
			let DOM = {filtroPers: document.querySelector("#filtroPers select[name='configActual_id']")};
			const configActual_id = DOM.filtroPers.value;

			// Actualiza el configActual_id en la session, cookie y el usuario
			if (configActual_id) fetch(rutas.actualiza.configActual_id + configActual_id);
			else return;

			// Fin
			return;
		},
	},
};
// layoutsMasOrdenes: ruta + "obtiene-layouts-y-ordenes", // layoutsOrdenes
// diasDelAno: ruta + "obtiene-los-dias-del-ano", // diasDelAno
