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
	valoresInicialesDeVariables: async () => {
		// Variables autónomas
		v.hayCambiosDeCampo = false;
		v.nombreOK = false;
		v.configCons_id = DOM.configCons_id.value;
		v.configDeCabecera = await obtiene.configDeCabecera(DOM.configCons_id.value);

		// Variables que dependen de otras variables 'v'
		v.filtroPropio = v.configDeCabecera.usuario_id == v.userID;

		// Fin
		return;
	},
	botoneraActivaInactiva: () => {
		// Variables
		const claseNuevo = DOM.configNuevaNombre.className.includes("nuevo");
		const claseEdicion = DOM.configNuevaNombre.className.includes("edicion");
		v.nuevo = claseNuevo && v.nombreOK;
		v.edicion = claseEdicion && v.nombreOK && v.filtroPropio;
		v.propio = !claseNuevo && !claseEdicion && v.filtroPropio && v.hayCambiosDeCampo;

		// Ícono Nuevo
		v.mostrar && !claseEdicion ? DOM.nuevo.classList.remove("inactivo") : DOM.nuevo.classList.add("inactivo");
		DOM.nuevo.title = !DOM.nuevo.className.includes("inactivo")
			? titulo.nuevo
			: !v.mostrar
			? "No está permitido crear una configuración cuando hay un error en los filtros"
			: claseEdicion
			? "No está permitido crear una configuración cuando se está editando el nombre de otra"
			: "";

		// Ícono Edición
		!claseNuevo && v.filtroPropio && !v.hayCambiosDeCampo && v.mostrar
			? DOM.edicion.classList.remove("inactivo")
			: DOM.edicion.classList.add("inactivo");
		DOM.edicion.title = !DOM.edicion.className.includes("inactivo")
			? titulo.edicion
			: claseNuevo
			? "No se puede editar el nombre de una configuración que todavía no está creada"
			: !v.filtroPropio
			? "No está permitido editar el nombre de las configuraciones provistas por nuestro sitio"
			: v.hayCambiosDeCampo
			? "No está permitido editar el nombre de una configuración cuando se le hicieron cambios"
			: !v.mostrar
			? "No está permitido editar una configuración cuando hay un error en los filtros"
			: "";

		// Ícono Deshacer
		!claseNuevo && !claseEdicion && v.hayCambiosDeCampo
			? DOM.deshacer.classList.remove("inactivo")
			: DOM.deshacer.classList.add("inactivo");
		DOM.deshacer.title = !DOM.deshacer.className.includes("inactivo")
			? titulo.deshacer
			: claseNuevo || claseEdicion
			? "No está permitido deshacer cuando se está cambiando el nombre"
			: !v.hayCambiosDeCampo
			? "No hay nada que deshacer cuando no se hicieron cambios en la configuración"
			: "";

		// Ícono Eliminar
		!claseNuevo && !claseEdicion && v.filtroPropio && !v.hayCambiosDeCampo
			? DOM.eliminar.classList.remove("inactivo")
			: DOM.eliminar.classList.add("inactivo");
		DOM.eliminar.title = !DOM.eliminar.className.includes("inactivo")
			? titulo.eliminar
			: claseNuevo || claseEdicion
			? "No está permitido eliminar cuando se está cambiando el nombre"
			: !v.filtroPropio
			? "No está permitido eliminar las configuraciones provistas por nuestro sitio"
			: v.hayCambiosDeCampo
			? "No está permitido eliminar cuando se hicieron cambios en la configuración"
			: "";

		// Ícono Guardar
		v.mostrar && (v.nuevo || v.edicion || v.propio)
			? DOM.guardar.classList.remove("inactivo")
			: DOM.guardar.classList.add("inactivo");
		DOM.guardar.title = !DOM.guardar.className.includes("inactivo")
			? titulo.guardar
			: !v.mostrar
			? "No está permitido guardar una configuración cuando hay un error en los filtros"
			: (claseNuevo || claseEdicion) && !v.nombreOK
			? "No está permitido guardar un nuevo nombre de configuración si tiene errores"
			: claseEdicion && !v.filtroPropio
			? "No está permitido editar el nombre de las configuraciones provistas por nuestro sitio"
			: !claseNuevo && !claseEdicion
			? !v.hayCambiosDeCampo
				? "No hay cambios que guardar"
				: !v.filtroPropio
				? "No está permitido guardar cambios en las configuraciones provistas por nuestro sitio"
				: ""
			: "";

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

		// Actualiza ícono Palabras Clave
		DOM.palClaveAprob.classList.add("inactivo");

		// Fin
		return;
	},
	cartelQuieroVerVisible: () => {
		// Partes a ocultar
		DOM.productos.innerHTML = "";
		DOM.listados.innerHTML = "";
		DOM.noTenemos.classList.add("ocultar");

		// Partes a mostrar
		DOM.quieroVer.classList.remove("ocultar");
		v.mostrarCartelQuieroVer = true;

		// Fin
		return;
	},
	agregaOptionAlSelect: () => {
		// Fin
		return;
	},
};
let cambiosEnBD = {
	configCons_id: () => {
		const rutaCompleta = ruta + "actualiza-configCons_id-en-cookie-session-y-usuario/?configCons_id=";
		if (v.configCons_id) fetch(rutaCompleta + v.configCons_id);

		// Fin
		return;
	},
	creaUnaConfiguracion: async function () {
		// Variables
		const nombre = configCons.nombre;
		const opciones = DOM.configsConsPropios.children;

		// Crea la nueva configuración
		const rutaCompleta = ruta + "crea-una-configuracion/?configCons=";
		v.configCons_id = await fetch(rutaCompleta + JSON.stringify(configCons)).then((n) => n.json());

		// Actualiza las configsDeCabecera posibles para el usuario
		v.configsDeCabecera = await obtiene.configsDeCabecera();

		// Actualiza configCons_id en cookie, session y usuario
		this.configCons_id();

		// Crea una opción
		const newOption = new Option(nombre, v.configCons_id);
		// Obtiene el índice donde ubicarla
		const nombres = [...Array.from(opciones).map((n) => n.text), nombre];
		nombres.sort((a, b) => (a < b ? -1 : 1));
		const indice = nombres.indexOf(nombre);
		// Agrega la opción
		indice < opciones.length
			? DOM.configsConsPropios.insertBefore(newOption, opciones[indice])
			: DOM.configsConsPropios.appendChild(newOption);

		// La pone como 'selected'
		DOM.configsConsPropios.children[indice].selected = true;

		// Fin
		return;
	},
	guardaUnaConfiguracion: async () => {
		// Variables
		configCons.id = v.configCons_id;

		// Guarda los cambios
		const rutaCompleta = ruta + "guarda-una-configuracion/?configCons=";
		await fetch(rutaCompleta + JSON.stringify(configCons));

		// Cambia el texto en el select
		if (configCons.edicion) DOM.configCons_id.options[DOM.configCons_id.selectedIndex].text = configCons.nombre;

		// Limpia
		delete configCons.edicion, configCons.nombre, configCons.id;

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
	ppp: async (elemento) => {
		// Opción actual
		const indice = v.ppp.findIndex((n) => n == elemento);
		const opcionActual = v.pppOpciones.find((n) => v.ppp[indice].className.endsWith(n.icono));
		const idActual = opcionActual.id;

		// Opción propuesta
		const idPropuesta = idActual > 1 ? idActual - 1 : v.pppOpciones.length;
		const opcionPropuesta = v.pppOpciones.find((n) => n.id == idPropuesta);

		// Actualiza el ícono y el título
		DOM.ppp[indice].classList.remove(...opcionActual.icono.split(" "));
		DOM.ppp[indice].classList.add(...opcionPropuesta.icono.split(" "));
		DOM.ppp[indice].title = opcionPropuesta.nombre;

		// Actualiza la preferencia
		const producto = v.productos[indice];
		DOM.ppp[indice].classList.add("inactivo");
		await fetch(v.pppRrutaGuardar + producto.entidad + "&entidad_id=" + producto.id + "&opcion_id=" + idPropuesta);
		DOM.ppp[indice].classList.remove("inactivo");

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

// Consolidadas
let cambioDeConfig_id = async () => {
	// Funciones
	await actualiza.valoresInicialesDeVariables();
	cambiosEnBD.configCons_id();
	await actualiza.statusInicialCampos();
	actualiza.cartelQuieroVerVisible();

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
	if (v.mostrar) {
		await resultados.obtiene();
		if (!v.mostrarCartelQuieroVer) resultados.muestra.generico();
	}

	// Fin
	return;
};
