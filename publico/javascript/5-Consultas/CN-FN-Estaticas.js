"use strict";

let obtiene = {
	opcionesDeConfigDeCabecera: () => {
		const rutaCompleta = ruta + "obtiene-las-opciones-de-config-de-cabecera";
		return fetch(rutaCompleta).then((n) => n.json());
	},
	opcionesDeLayoutMasOrden: () => {
		const rutaCompleta = ruta + "obtiene-las-opciones-de-layout-y-orden/";
		return fetch(rutaCompleta).then((n) => n.json());
	},
	configDeCabecera: (configCons_id) => {
		const rutaCompleta = ruta + "obtiene-la-configuracion-de-cabecera/?configCons_id=";
		return fetch(rutaCompleta + configCons_id).then((n) => n.json());
	},
	configDeCampos: (configCons_id) => {
		const rutaCompleta = ruta + "obtiene-la-configuracion-de-campos/?configCons_id=";
		return fetch(rutaCompleta + configCons_id).then((n) => n.json());
	},
};
let actualiza = {
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
	configDeCamposEnVista: async ({DOM, configDeCampos}) => {
		// Actualiza las preferencias simples (Encabezado + Filtros)
		for (let prefSimple of DOM.prefsSimples)
			prefSimple.value = configDeCampos[prefSimple.name] ? configDeCampos[prefSimple.name] : "";

		// Actualiza las preferencias 'AscDes'
		const ascDesInputs = DOM.ascDes.querySelectorAll("input");
		for (let ascDesInput of ascDesInputs)
			ascDesInput.checked = configDeCampos.ascDes && ascDesInput.value == configDeCampos.ascDes;

		// Fin
		return;
	},
	contador: {},
	nombreEnVista: {},
};
let guardaEnBD = {
	actualizaConfigCons_id: (configCons_id) => {
		const rutaCompleta = ruta + "actualiza-configCons_id-en-cookie-session-y-usuario/?configCons_id=";
		if (configCons_id) fetch(rutaCompleta + configCons_id);

		// Fin
		return;
	},
	creaUnaConfiguracion: (configCons) => {
		const rutaCompleta = ruta + "crea-una-configuracion/?configCons=";
		return fetch(rutaCompleta + configCons).then((n) => n.json());
	},
	guardaUnaConfiguracion: (configCons) => {
		const rutaCompleta = ruta + "guarda-una-configuracion/?configCons=";
		fetch(rutaCompleta + configCons).then((n) => n.json());

		// Fin
		return;
	},
};
let verifica = {
	configCons_id: async ({configCons_id, v, DOM}) => {
		// Variables
		configCons_id = Number(configCons_id);
		const configsCons_id = await obtiene
			.opcionesDeConfigDeCabecera()
			.then((n) => [...n.propios.map((m) => m.id), ...n.elc.map((m) => m.id)]);

		// Averigua si el valor está entre los valores posibles
		const existe = configsCons_id.includes(configCons_id);

		// Si no existe, devuelve a su configuración anterior
		if (!existe) DOM.configCons_id.value = v.configCons_id;

		// Fin
		return existe;
	},
};

let resultados = {};

// diasDelAno: ruta + "obtiene-los-dias-del-ano", // diasDelAno
