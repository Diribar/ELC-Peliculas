"use strict";
window.addEventListener("load", async () => {
	// Variables - DOM
	DOM = {
		// Formulario General
		cuerpoFooterImgDer: document.querySelector("#cuerpoFooterImgDer"),
		cuerpo: document.querySelector("#cuerpo"),
		configCons: document.querySelector("#cuerpo #configCons"),
		encabMasPelis: document.querySelector("#cuerpo #encabMasPelis"),
		prefsSimples: document.querySelectorAll("#cuerpo :is(#encabezado, #configFiltros) .prefSimple"),

		// Zona de Preferencias
		cabecera: document.querySelector("#cuerpo #configCons #cabecera"),
		configFiltros: document.querySelector("#cuerpo #configCons #configFiltros"),

		// Encabezado
		tituloPrincipal: document.querySelector("#encabMasPelis #encabezado #tituloPrincipal"),
		contadorDeProds: document.querySelector("#encabMasPelis #encabezado #derecha #contadorDeProds"),

		// Zona de Productos
		zonaDisponible: document.querySelector("#encabMasPelis #zonaDisponible"),

		// Imagen derecha
		imgDerecha: document.querySelector("#imgDerecha img"),
	};
	DOM = {
		...DOM,

		// Encabezado
		layout_id: DOM.tituloPrincipal.querySelector("select[name='layout_id']"),
		iconoParaMostrarPrefs: DOM.tituloPrincipal.querySelector("#toggleFiltrosGlobal .fa-chevron-right"),
		consCopiada: DOM.tituloPrincipal.querySelector("#iconosDelTitulo #consCopiada"),

		// Configuración de Cabecera - Botonera
		configNuevaNombre: DOM.cabecera.querySelector("#configNueva input[name='nombreNuevo']"),
		cabecera_id: DOM.cabecera.querySelector("select[name='cabecera_id']"),
		cabsPropias: DOM.cabecera.querySelector("select[name='cabecera_id'] optgroup#propios"),
		iconosBotonera: DOM.cabecera.querySelectorAll("#iconosBotonera i"),

		// Configuración de Campos - Preferencias
		nav: DOM.configFiltros.querySelector("nav"),
		filtrosPresenciaEstable: DOM.configFiltros.querySelectorAll(".presenciaEstable"),
		selects: DOM.configFiltros.querySelectorAll("select"),
		palClave: DOM.configFiltros.querySelector("#palabrasClave input"),
		palClaveAprob: DOM.configFiltros.querySelector("#palabrasClave i#palClaveAprob"),

		// Muestra / Oculta filtros
		toggleFiltros: DOM.configCons.querySelector("#toggleFiltros"),
		muestraFiltros: DOM.configCons.querySelector("#toggleFiltros #muestraFiltros"),
		ocultaFiltros: DOM.configCons.querySelector("#toggleFiltros #ocultaFiltros"),

		// Zona Disponible - Resultados
		vistaDeResults: DOM.zonaDisponible.querySelector("#vistaDeResults"),
		resultados: DOM.zonaDisponible.querySelectorAll("#vistaDeResults .resultados"),
		botones: DOM.zonaDisponible.querySelector("#vistaDeResults #botones"),
		listados: DOM.zonaDisponible.querySelector("#vistaDeResults #listados"),

		// Zona Disponible - Carteles e Imagen de fondo
		esperandoResultados: DOM.zonaDisponible.querySelector("#vistaDeResults #esperandoResultados"),
		telonFondo: DOM.zonaDisponible.querySelector("#vistaDeResults img#telonFondo"),
		carteles: DOM.zonaDisponible.querySelectorAll("#carteles .cartel"),
		asegurate: DOM.zonaDisponible.querySelector("#carteles button#asegurate"),
		quieroVer: DOM.zonaDisponible.querySelector("#carteles button#quieroVer"),
		noTenemos: DOM.zonaDisponible.querySelector("#carteles button#noTenemos"),
		loginNecesario: DOM.zonaDisponible.querySelector("#carteles button#loginNecesario"),
		cartelOrdenPPP: DOM.zonaDisponible.querySelector("#carteles #cartelOrdenPPP"),
		cartelUsSinPPP: DOM.zonaDisponible.querySelector("#carteles #cartelUsSinPPP"),
		cartelLoginPend: DOM.zonaDisponible.querySelector("#carteles #loginPend"),
		cartelVerVideo: DOM.zonaDisponible.querySelector("#carteles #verVideo"),
		cartelRCLV: document.querySelector("#imgDerecha a:has(#cartelRCLV)"),

		// Otros
		anchorVerVideo: DOM.zonaDisponible.querySelector("#carteles #verVideo span#consultas"),
	};
	for (let icono of DOM.iconosBotonera) DOM[icono.id] = icono;
	for (let campo of DOM.selects) DOM[campo.name] = campo;

	// Variables - Títulos botonera
	titulo = {
		nuevo: DOM.nuevo.title,
		deshacer: DOM.deshacer.title,
		guardar: DOM.guardar.title,
		edicion: DOM.edicion.title,
		eliminar: DOM.eliminar.title,
	};

	// Variables - General
	v = {
		...(await obtiene.variablesDelBE()),
		cabeceras: await obtiene.cabecerasPosibles(),
		pppRutaGuardar: "/producto/api/guarda-la-preferencia-del-usuario/?entidad=",
		conLinksHD: "conLinksHD",
		enCast: "enCast",
		muestraFiltros: false,
		contadorDeMostrarResults: 0,
	};

	// Start-up
	await cambioDeConfig_id("start-up");
	actualiza.cartelQuieroVerVisible();
	await cambioDePrefs();
	DOM.quieroVer.focus(); // foco en el cartel 'Quiero ver'
});

// Variables
const ruta = "/consultas/api/";
let DOM, v, cabecera, prefs, titulo;
