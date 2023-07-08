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
	configDeCabecera: () => {
		const rutaCompleta = ruta + "obtiene-la-configuracion-de-cabecera/?configCons_id=";
		return fetch(rutaCompleta + v.configCons_id).then((n) => n.json());
	},
	configDeCampos: () => {

		const rutaCompleta = ruta + "obtiene-la-configuracion-de-campos/?configCons_id=";
		return fetch(rutaCompleta + v.configCons_id).then((n) => n.json());
	},
};
let actualiza = {
	valoresInicialesDeObjetoV: async () => {
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
	botoneraActivaInactiva: () => {
		// Variables
		const claseNuevo = DOM.configNuevaNombre.className.includes("nuevo");
		const claseEdicion = DOM.configNuevaNombre.className.includes("edicion");
		v.nuevo = claseNuevo && v.nombreOK;
		v.edicion = claseEdicion && v.nombreOK && v.filtroPropio;
		v.propio = v.filtroPropio && v.hayCambiosDeCampo;

		// Ícono Nuevo
		v.mostrar && !claseEdicion ? DOM.nuevo.classList.remove("inactivo") : DOM.nuevo.classList.add("inactivo");

		// Ícono Edición
		v.mostrar && !claseNuevo && v.filtroPropio && !v.hayCambiosDeCampo
			? DOM.edicion.classList.remove("inactivo")
			: DOM.edicion.classList.add("inactivo");

		// Ícono Deshacer
		v.mostrar && !claseNuevo && !claseEdicion && v.hayCambiosDeCampo
			? DOM.deshacer.classList.remove("inactivo")
			: DOM.deshacer.classList.add("inactivo");

		// Ícono Eliminar
		!claseNuevo && !claseEdicion && v.filtroPropio && !v.hayCambiosDeCampo
			? DOM.eliminar.classList.remove("inactivo")
			: DOM.eliminar.classList.add("inactivo");

		// Ícono Guardar
		v.mostrar && (v.nuevo || v.edicion || v.propio)
			? DOM.guardar.classList.remove("inactivo")
			: DOM.guardar.classList.add("inactivo");

		// Fin
		return;
	},
	statusInicialCampos: async () => {
		// Variables
		const configDeCampos = await obtiene.configDeCampos();

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
	cartelComencemosVisible: () => {
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
	creaUnaConfiguracion: async () => {
		// Crea la nueva configuración
		const rutaCompleta = ruta + "crea-una-configuracion/?configCons=";
		v.configCons_id = await fetch(rutaCompleta + configCons).then((n) => n.json());
		delete configCons.nombre;

		// Des-selecciona la opción actual

		// Agrega una opción, la pone como 'selected' y la ordena dentro de propios

		// Fin
		return;
	},
	guardaUnaConfiguracion: () => {
		// Variables
		configCons.id = v.configCons_id;
		const rutaCompleta = ruta + "guarda-una-configuracion/?configCons=";

		// Guarda los cambios
		fetch(rutaCompleta + JSON.stringify(configCons)).then((n) => n.json());
		delete configCons.id;

		// Fin
		return;
	},
	eliminaConfigCons: async () => {
		// Elimina la configuración
		const rutaCompleta = ruta + "elimina-configuracion-de-consulta/?configCons_id=";
		let configCons_id = DOM.configCons_id.value;
		await fetch(rutaCompleta + configCons_id);

		// Actualiza la variable
		v.configsDeCabecera = await obtiene.configsDeCabecera();

		// Elimina la opción del select
		const opciones = DOM.configCons_id.querySelectorAll("option");
		opciones.forEach((opcion, i) => {
			if (opcion.value == configCons_id) DOM.configCons_id.remove(i);
		});

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
	configCons_id: async () => {
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
let cambioDeConfig_id = async () => {
	// Funciones
	await actualiza.valoresInicialesDeObjetoV();
	cambiosEnBD.configCons_id();
	await actualiza.statusInicialCampos();
	actualiza.cartelComencemosVisible();

	// Fin
	return;
};
let cambioDeCampos = async () => {
	// Cambio de clases
	DOM.configNuevaNombre.classList.remove("nuevo");
	DOM.configNuevaNombre.classList.remove("edicion");

	// Funciones
	actualizaConfigCons.consolidado();
	actualiza.botoneraActivaInactiva();
	await zonaDeProds.obtieneLosProductos(configCons);
	actualiza.contador();

	// Fin
	return;
};

// diasDelAno: ruta + "obtiene-los-dias-del-ano", // diasDelAno
