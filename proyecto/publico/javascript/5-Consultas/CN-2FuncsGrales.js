"use strict";

let obtiene = {
	cabecera: () => {
		const rutaCompleta = ruta + "obtiene-la-cabecera/?id=";
		const id = DOM.cabecera_id.value;
		return fetch(rutaCompleta + (id ? id : "")).then((n) => n.json());
	},
	prefsDeCabecera: (texto) => {
		texto = texto ? "texto=" + texto + "&" : "";
		const rutaCompleta = ruta + "obtiene-las-prefs-de-la-cabecera/?" + texto + "cabecera_id=";
		return fetch(rutaCompleta + (cabecera.id ? cabecera.id : "")).then((n) => n.json());
	},
	variablesDelBE: () => {
		const rutaCompleta = ruta + "obtiene-variables/";
		return fetch(rutaCompleta).then((n) => n.json());
	},
	cabecerasPosibles: () => {
		const rutaCompleta = ruta + "obtiene-las-cabeceras-posibles-para-el-usuario";
		return fetch(rutaCompleta).then((n) => n.json());
	},
};
let actualiza = {
	valoresInicialesDeVariables: async () => {
		// Variables autónomas
		v.hayCambiosDeCampo = false;
		v.nombreOK = false;
		cabecera = await obtiene.cabecera();
		if (!DOM.cabecera_id.value) DOM.cabecera_id.value = cabecera.id ? cabecera.id : "";

		// Variables que dependen de otras variables 'v'
		v.filtroPropio = v.userID && cabecera.usuario_id == v.userID;

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

		// Sin filtros
		DOM.sinFiltros.classList.add("inactivo");
		for (let campo of v.camposFiltros)
			if (DOM[campo].value && DOM[campo].value != "todos") DOM.sinFiltros.classList.remove("inactivo");
		DOM.sinFiltros.title = !DOM.sinFiltros.className.includes("inactivo") ? v.titulo.sinFiltros : "No hay filtros aplicados";

		// Ícono Nuevo
		v.layout_id && !claseEdicion && v.userID ? DOM.nuevo.classList.remove("inactivo") : DOM.nuevo.classList.add("inactivo");
		DOM.nuevo.title = !DOM.nuevo.className.includes("inactivo")
			? v.titulo.nuevo
			: !v.userID
			? "Necesitamos que estés logueado para crear una configuración"
			: !v.layout_id
			? "No está permitido crear una configuración cuando hay un error en los filtros"
			: claseEdicion
			? "No está permitido crear una configuración cuando se está editando el nombre de otra"
			: "";

		// Ícono Deshacer
		!claseNuevo && !claseEdicion && v.hayCambiosDeCampo && cabecera.id
			? DOM.deshacer.classList.remove("inactivo")
			: DOM.deshacer.classList.add("inactivo");
		DOM.deshacer.title = !DOM.deshacer.className.includes("inactivo")
			? v.titulo.deshacer
			: claseNuevo || claseEdicion
			? "No está permitido deshacer cuando se está cambiando el nombre"
			: !v.hayCambiosDeCampo
			? "No hay nada que deshacer cuando no se hicieron cambios en la configuración"
			: !cabecera.id
			? "Tenés que elegir una configuración guardada, para poder deshacer los cambios"
			: "";

		// Ícono Guardar
		v.layout_id && (v.nuevo || v.edicion || v.propio) && v.userID
			? DOM.guardar.classList.remove("inactivo")
			: DOM.guardar.classList.add("inactivo");
		DOM.guardar.title = !DOM.guardar.className.includes("inactivo")
			? v.titulo.guardar
			: !v.userID
			? "Necesitamos que estés logueado para guardar una configuración"
			: !v.layout_id
			? "No está permitido guardar una configuración si no se eligió una opción"
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

		// Ícono Edición
		!claseNuevo && v.filtroPropio && !v.hayCambiosDeCampo && v.layout_id
			? DOM.edicion.classList.remove("inactivo")
			: DOM.edicion.classList.add("inactivo");
		DOM.edicion.title = !DOM.edicion.className.includes("inactivo")
			? v.titulo.edicion
			: claseNuevo
			? "No se puede editar el nombre de una configuración que todavía no está creada"
			: !v.filtroPropio
			? "No está permitido editar el nombre de las configuraciones provistas por nuestro sitio"
			: v.hayCambiosDeCampo
			? "No está permitido editar el nombre de una configuración cuando se le hicieron cambios"
			: !v.layout_id
			? "No está permitido editar una configuración si no se eligió una opción"
			: "";

		// Ícono Eliminar
		!claseNuevo && !claseEdicion && v.filtroPropio && !v.hayCambiosDeCampo
			? DOM.eliminar.classList.remove("inactivo")
			: DOM.eliminar.classList.add("inactivo");
		DOM.eliminar.title = !DOM.eliminar.className.includes("inactivo")
			? v.titulo.eliminar
			: claseNuevo || claseEdicion
			? "No está permitido eliminar cuando se está cambiando el nombre"
			: !v.filtroPropio
			? "No está permitido eliminar las configuraciones provistas por nuestro sitio"
			: v.hayCambiosDeCampo
			? "No está permitido eliminar cuando se hicieron cambios en la configuración"
			: "";

		// Fin
		return;
	},
	statusInicialCampos: async (texto) => {
		// Variables
		const prefsDeCabecera = await obtiene.prefsDeCabecera(texto);

		// Actualiza las preferencias simples (layout + filtros)
		for (let prefSimple of DOM.prefsSimples)
			prefSimple.value = prefsDeCabecera[prefSimple.name]
				? prefsDeCabecera[prefSimple.name]
				: v.filtrosConDefault[prefSimple.name]
				? v.filtrosConDefault[prefSimple.name]
				: "";

		// 'palClaveIcono'
		DOM.palClaveIcono.classList.remove("fa-circle-right"); // siempre oculto
		DOM.palClaveInput.value
			? DOM.palClaveIcono.classList.add("fa-circle-xmark") // si 'palClaveInput' tiene valor
			: DOM.palClaveIcono.classList.remove("fa-circle-xmark");

		// Si session está activa, lo informa
		if (prefsDeCabecera.cambios) v.hayCambiosDeCampo = true;

		// Fin
		return;
	},
	cartelQuieroVerVisible: () => {
		// Partes a ocultar
		DOM.botones.innerHTML = "";
		DOM.listados.innerHTML = "";
		DOM.noTenemos.classList.add("ocultar");

		// Partes a mostrar
		DOM.quieroVer.classList.remove("ocultar");
		v.mostrarCartelQuieroVer = true;

		// Fin
		return;
	},
	toggleBotonFiltros: function () {
		// Variables
		v.muestraFiltros =
			window.getComputedStyle(DOM.toggleFiltros).display == "none" ||
			window.getComputedStyle(DOM.muestraFiltros).display == "none";

		// Muestra / Oculta los filtros
		for (let campo of DOM.selects) {
			// Sólo sirve para el start-up
			if (v.muestraFiltros || DOM[campo.name].value)
				DOM[campo.name].parentNode.classList.replace("ocultaFiltro", "aparece");

			// Sirve en régimen
			v.muestraFiltros || DOM[campo.name].value
				? DOM[campo.name].parentNode.classList.replace("desaparece", "aparece") // Se muestra
				: DOM[campo.name].parentNode.classList.replace("aparece", "desaparece"); // Se oculta
		}

		// Palabras clave - sólo sirve para el start-up
		if (v.muestraFiltros || DOM.palClaveInput.value)
			DOM.palClaveInput.parentNode.classList.replace("ocultaFiltro", "aparece");

		// Palabras clave - sirve en régimen
		v.muestraFiltros || DOM.palClaveInput.value
			? DOM.palClaveInput.parentNode.classList.replace("desaparece", "aparece") // Se muestra
			: DOM.palClaveInput.parentNode.classList.replace("aparece", "desaparece"); // Se oculta

		// Fin
		return;
	},
};
let cambiosEnBD = {
	actualizaEnUsuarioConfigCons_id: () => {
		if (!v.userID || !cabecera.id) return;

		// Actualiza en el usuario
		const rutaCompleta = ruta + "actualiza-en-usuario-configCons_id/?configCons_id=";
		fetch(rutaCompleta + cabecera.id);

		// Fin
		return;
	},
	creaConfig: async function () {
		if (!v.userID) return;

		// Crea la nueva configuración
		const rutaCompleta = ruta + "crea-una-configuracion/?cabecera=";
		cabecera.id = await fetch(rutaCompleta + JSON.stringify(cabecera)).then((n) => n.json());

		// Actualiza las cabeceras posibles para el usuario
		v.cabeceras = await obtiene.cabecerasPosibles();

		// Actualiza configCons_id en usuario
		this.actualizaEnUsuarioConfigCons_id();

		// Elimina session y cookie
		await sessionCookie.eliminaConfig();

		// Crea una configuración en el DOM
		const nombre = cabecera.nombre;
		const cabsPropias = DOM.cabsPropias.children;
		const nuevaConfig = new Option(nombre, cabecera.id);

		// Obtiene el índice donde ubicarla
		const nombres = [...Array.from(cabsPropias).map((n) => n.text), nombre];
		nombres.sort((a, b) => (a < b ? -1 : 1));
		const indice = nombres.indexOf(nombre);

		// Agrega la opción
		indice < cabsPropias.length
			? DOM.cabsPropias.insertBefore(nuevaConfig, cabsPropias[indice])
			: DOM.cabsPropias.appendChild(nuevaConfig);

		// La pone como 'selected'
		DOM.cabsPropias.children[indice].selected = true;
		if (DOM.cabsPropias.className.includes("ocultar")) DOM.cabsPropias.classList.remove("ocultar");

		// Fin
		return;
	},
	guardaConfig: async () => {
		if (!v.userID) return;

		// Guarda los cambios
		let configCons = {cabecera, prefs};
		if (v.entidadBD.id == v.layoutBD.entDefault_id) delete configCons.prefs.entidad; // si la entidad es la estándar, elimina el campo
		const rutaCompleta = ruta + "guarda-una-configuracion/?configCons=";
		await fetch(rutaCompleta + JSON.stringify(configCons));

		// Cambia el texto en el select y limpia la cabecera
		if (cabecera.edicion) DOM.cabecera_id.options[DOM.cabecera_id.selectedIndex].text = cabecera.nombre;
		delete cabecera.edicion;

		// Fin
		return;
	},
	eliminaConfig: async () => {
		if (!v.userID) return;

		// Variables
		let cabecera_id;

		// Elimina la configuración
		const rutaCompleta = ruta + "elimina-configuracion-de-consulta/?cabecera_id=";
		cabecera_id = DOM.cabecera_id.value;
		await fetch(rutaCompleta + cabecera_id);

		// Actualiza la variable
		v.cabeceras = await obtiene.cabecerasPosibles();

		// Elimina la opción del select
		const opciones = DOM.cabecera_id.querySelectorAll("option");
		opciones.forEach((opcion, i) => {
			if (opcion.value == cabecera_id) DOM.cabecera_id.remove(i);
		});

		// Si corresponde, oculta el 'optgroup' de 'propios'
		if (!DOM.cabsPropias.children.length) DOM.cabsPropias.classList.add("ocultar");

		// Obtiene las configuraciones posibles para el usuario, ordenando por la más reciente primero
		const cabeceras = [...v.cabeceras].sort((a, b) => (a.creadoEn > b.creadoEn ? -1 : 1));
		const propios = cabeceras.filter((n) => n.usuario_id == v.userID);
		cabecera_id = propios.length ? propios[0].id : "";

		// Actualiza el select con el id
		DOM.cabecera_id.value = cabecera_id;

		// Fin
		return;
	},
	ppp: async (elemento) => {
		if (!v.userID) return;

		// Opción actual
		const indice = v.ppps.findIndex((n) => n == elemento);
		const opcionActual = v.pppOpcsArray.find((n) => v.ppps[indice].className.endsWith(n.icono));
		const idActual = opcionActual.id;

		// Opción propuesta
		const idPropuesta = idActual > 1 ? idActual - 1 : v.pppOpcsSimples.length;
		const opcionPropuesta = v.pppOpcsArray.find((n) => n.id == idPropuesta);

		// Actualiza el ícono y el título
		DOM.ppps[indice].classList.remove(...opcionActual.icono.split(" "));
		DOM.ppps[indice].classList.add(...opcionPropuesta.icono.split(" "));
		DOM.ppps[indice].title = opcionPropuesta.nombre;

		// Actualiza la preferencia
		const producto = v.productos[indice];
		DOM.ppps[indice].classList.add("inactivo");
		await fetch(v.pppRutaGuardar + producto.entidad + "&entidad_id=" + producto.id + "&ppp_id=" + idPropuesta);
		DOM.ppps[indice].classList.remove("inactivo");

		// Aumenta o disminuye la cantidad de PPP del usuario
		if (opcionActual.sinPref) v.usuarioTienePPP++;
		else if (opcionPropuesta.sinPref && v.usuarioTienePPP) v.usuarioTienePPP--;

		// Fin
		return;
	},
};
let sessionCookie = {
	guardaConfig: () => {
		// Variables
		const rutaCompleta = ruta + "guarda-la-configuracion-en-session-y-cookie/?configCons=";
		let configCons = {id: cabecera.id, ...prefs};
		if (v.entidadBD.id == v.layoutBD.entDefault_id) delete configCons.entidad; // si la entidad es la estándar, elimina el campo

		// Guarda
		fetch(rutaCompleta + JSON.stringify(configCons));

		// Fin
		return;
	},
	eliminaConfig: async () => {
		const rutaCompleta = ruta + "elimina-la-configuracion-en-session-y-cookie";
		await fetch(rutaCompleta);
		return;
	},
};
let cambioDeConfig_id = async (texto) => {
	// Funciones
	await actualiza.valoresInicialesDeVariables();
	if (cabecera.id && v.userID) cambiosEnBD.actualizaEnUsuarioConfigCons_id();
	if (texto != "start-up") await sessionCookie.eliminaConfig();
	await actualiza.statusInicialCampos();
	actualiza.toggleBotonFiltros();

	// Fin
	return;
};
let accionesPorCambioDePrefs = async () => {
	// Cambios de campo
	v.hayCambiosDeCampo = true;

	// Cambio de clases
	DOM.configNuevaNombre.classList.remove("nuevo");
	DOM.configNuevaNombre.classList.remove("edicion");

	// Funciones
	actualizaConfigCons.consolidado(); // obtiene las preferencias
	actualiza.botoneraActivaInactiva(); // actualiza la botonera
	if (v.layout_id) {
		await resultados.obtiene(); // obtiene los resultados
		if (!v.mostrarCartelQuieroVer) resultados.muestra.generico(); // muestra los resultados
	}

	// Guarda la configuración en session y cookie
	sessionCookie.guardaConfig();

	// Fin
	return;
};
