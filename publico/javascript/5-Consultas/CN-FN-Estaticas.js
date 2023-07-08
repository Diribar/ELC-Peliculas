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
	valoresInicialesDeObjetoV: async ({v, DOM}) => {
		// Variables autónomas
		v.hayCambios = false;
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
		let claseNuevo = DOM.configNuevaNombre.className.includes("nuevo");
		let claseEdicion = DOM.configNuevaNombre.className.includes("edicion");

		// Si no se cumplen las condiciones mínimas, inactiva todos los botones e interrumpe la función
		if (!v.mostrar) {
			for (let icono of DOM.iconos) icono.classList.add("inactivo");
			return;
		}

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
	eliminaConfigCons: (configCons_id) => {

		// 1.	Tabla filtrosCampos: se eliminan los registros vinculados al filtro personalizado
		// 2.	Tabla filtrosCabecera: se elimina el registro.
		// const {cn_layouts: layoutsBD, cn_ordenes: ordenesBD} = await obtiene.opcionesDeLayoutMasOrden();
		// v = {...v, layoutsBD, ordenesBD};
		// actualiza el select con el id de la configCons más reciente
// Fin
		return;
	},
};
let verifica = {
	configCons_id: async ({v, DOM}) => {
		// Variables
		const configCons_id = Number(DOM.configCons_id.value);

		// Obtiene los registros posibles de configuración para el usuario
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
	// Funciones
	actualizaConfigCons.consolidado({v, DOM});
	actualiza.botoneraActivaInactiva({v, DOM});
	await zonaDeProds.obtieneLosProductos(configCons);
	actualiza.contador({v, DOM});

	// Fin
	return;
};

// diasDelAno: ruta + "obtiene-los-dias-del-ano", // diasDelAno
