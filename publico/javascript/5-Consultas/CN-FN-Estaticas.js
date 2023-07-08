"use strict";

let obtiene = {
	configsDeCabecera: () => {
		const rutaCompleta = ruta + "obtiene-las-configs-posibles-para-el-usuario";
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
	valoresInicialesDeObjetoV: async ({v, DOM}) => {
		// Variables autónomas
		v.hayCambiosDeCampo = false;
		v.nombreOK = false;
		v.comencemos = true;
		v.configCons_id = DOM.configCons_id.value;

		// Variables que dependen de otras variables 'v'
		v.configDeCabecera = await obtiene.configDeCabecera(DOM.configCons_id.value);
		v.filtroPropio = !!v.configDeCabecera.usuario_id;

		// Fin
		return;
	},
	botoneraActivaInactiva: ({v, DOM}) => {
		// Variables
		v.claseNuevo = DOM.configNuevaNombre.className.includes("nuevo");
		v.claseEdicion = DOM.configNuevaNombre.className.includes("edicion");
		v.nuevo = v.claseNuevo && v.nombreOK;
		v.edicion = v.claseEdicion && v.nombreOK && v.filtroPropio;
		v.propio = v.filtroPropio && v.hayCambiosDeCampo;

		// Ícono Nuevo
		v.mostrar && !v.claseEdicion ? DOM.nuevo.classList.remove("inactivo") : DOM.nuevo.classList.add("inactivo");

		// Ícono Edición
		v.mostrar && !v.claseNuevo && v.filtroPropio && !v.hayCambiosDeCampo
			? DOM.edicion.classList.remove("inactivo")
			: DOM.edicion.classList.add("inactivo");

		// Ícono Deshacer
		v.mostrar && !v.claseNuevo && !v.claseEdicion && v.hayCambiosDeCampo
			? DOM.deshacer.classList.remove("inactivo")
			: DOM.deshacer.classList.add("inactivo");

		// Ícono Eliminar
		!v.claseNuevo && !v.claseEdicion && v.filtroPropio && !v.hayCambiosDeCampo
			? DOM.eliminar.classList.remove("inactivo")
			: DOM.eliminar.classList.add("inactivo");

		// Ícono Guardar
		v.mostrar && (v.nuevo || v.edicion || v.propio)
			? DOM.guardar.classList.remove("inactivo")
			: DOM.guardar.classList.add("inactivo");

		// Fin
		return;
	},
	statusInicialCampos: async ({v, DOM}) => {
		// Variables
		const configDeCampos = await obtiene.configDeCampos(v.configCons_id);

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
	cartelComencemosVisible: (DOM) => {
		DOM.comencemos.classList.remove("ocultar");
		return;
	},
	contador: () => {
		// Fin
		return;
	},
	agregaOptionAlSelect: () => {
		// Fin
		return;
	},
};
let cambiosEnBD = {
	configCons_id: (configCons_id) => {
		const rutaCompleta = ruta + "actualiza-configCons_id-en-cookie-session-y-usuario/?configCons_id=";
		if (configCons_id) fetch(rutaCompleta + configCons_id);

		// Fin
		return;
	},
	creaUnaConfiguracion: async ({v, configCons}) => {
		// Crea la nueva configuración
		const rutaCompleta = ruta + "crea-una-configuracion/?configCons=";
		v.configCons_id = await fetch(rutaCompleta + configCons).then((n) => n.json());
		delete configCons.nombre;

		// Des-selecciona la opción actual

		// Agrega una opción y la pone como selected

		// Fin
		return;
	},
	guardaUnaConfiguracion: ({v, configCons}) => {
		const rutaCompleta = ruta + "guarda-una-configuracion/?configCons=";
		fetch(rutaCompleta + configCons).then((n) => n.json());

		// Fin
		return;
	},
	eliminaConfigCons: async (DOM) => {
		// Elimina la configuración
		const rutaCompleta = ruta + "elimina-configuracion-de-consulta/?configCons_id=";
		let configCons_id = DOM.configCons_id.value;
		await fetch(rutaCompleta + configCons_id);

		// Actualiza la variable
		v.configsDeCabecera = await obtiene.configsDeCabecera();

		// Oculta la opción en la vista
		const opciones = DOM.configCons_id.querySelectorAll("option");
		for (let opcion of opciones) if (opcion.value == configCons_id) opcion.classList.add("ocultar");

		// Obtiene las configuraciones posibles para el usuario, ordenando por la más reciente primero
		const configsDeCabecera = [...v.configsDeCabecera].sort((a, b) => (a.creadoEn > b.creadoEn ? -1 : 1));
		const propios = configsDeCabecera.filter((n) => n.usuario_id);
		configCons_id = propios.length ? propios[0].id : configsDeCabecera[0];

		// Actualiza el select con el id
		DOM.configCons_id.value = configCons_id;

		// Fin
		return;
	},
};
let verifica = {
	configCons_id: async ({v, DOM}) => {
		// Variables
		const configCons_id = Number(DOM.configCons_id.value);

		// Obtiene los registros posibles de configuración para el usuario
		const configsCons_id = [...v.configsDeCabecera].map((m) => m.id);

		// Averigua si el valor está entre los valores posibles
		const existe = configsCons_id.includes(configCons_id);

		// Si no existe, devuelve a su configuración anterior
		if (!existe) DOM.configCons_id.value = v.configCons_id;

		// Fin
		return existe;
	},
};
let zonaDeProds = {
	obtieneLosProductos: () => {
		// Fin
		return;
	},
};

// Consolidadas
let cambioDeConfig_id = async ({v, DOM}) => {
	// Funciones
	await actualiza.valoresInicialesDeObjetoV({v, DOM});
	cambiosEnBD.configCons_id(v.configCons_id);
	await actualiza.statusInicialCampos({v, DOM});
	actualiza.cartelComencemosVisible(DOM);

	// Fin
	return;
};
let cambioDeCampos = async ({v, DOM}) => {
	// Cambio de clases
	DOM.configNuevaNombre.classList.remove("nuevo");
	DOM.configNuevaNombre.classList.remove("edicion");

	// Funciones
	actualizaConfigCons.consolidado({v, DOM});
	actualiza.botoneraActivaInactiva({v, DOM});
	await zonaDeProds.obtieneLosProductos(configCons);
	actualiza.contador({v, DOM});

	// Fin
	return;
};

// diasDelAno: ruta + "obtiene-los-dias-del-ano", // diasDelAno
