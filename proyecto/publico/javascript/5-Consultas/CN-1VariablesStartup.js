"use strict";
window.addEventListener("load", async () => {
	// Variables - DOM
	DOM = {
		// Formulario General
		cuerpo: document.querySelector("#cuerpo"),
		configCons: document.querySelector("#cuerpo #configCons"),
		encabMasPelis: document.querySelector("#cuerpo #encabMasPelis"),
		prefsSimples: document.querySelectorAll("#cuerpo :is(#encabezado, #configCampos) .prefSimple"),

		// Zona de Preferencias
		configCabecera: document.querySelector("#cuerpo #configCons #configCabecera"),
		configCampos: document.querySelector("#cuerpo #configCons #configCampos"),

		// Encabezado
		tituloPrincipal: document.querySelector("#encabMasPelis #encabezado #tituloPrincipal"),
		contadorDeProds: document.querySelector("#encabMasPelis #encabezado #derecha #contadorDeProds"),

		// Zona de Productos
		zonaDisponible: document.querySelector("#encabMasPelis #zonaDisponible"),
	};
	DOM = {
		...DOM,

		// Encabezado
		muestraFiltrosGlobal: DOM.tituloPrincipal.querySelector("#toggleFiltrosGlobal .fa-chevron-right"),
		opcion_id: DOM.tituloPrincipal.querySelector("select[name='opcion_id']"),

		// Configuración de Cabecera - Botonera
		configNuevaNombre: DOM.configCabecera.querySelector("#configNueva input[name='nombreNuevo']"),
		configCons_id: DOM.configCabecera.querySelector("select[name='configCons_id']"),
		configsConsPropios: DOM.configCabecera.querySelector("select[name='configCons_id'] optgroup#propios"),
		iconosBotonera: DOM.configCabecera.querySelectorAll("#iconosBotonera i"),

		// Configuración de Campos - Preferencias
		nav: DOM.configCampos.querySelector("nav"),
		camposPresenciaEstable: DOM.configCampos.querySelectorAll(".presenciaEstable"),
		selects: DOM.configCampos.querySelectorAll("select"),
		palClave: DOM.configCampos.querySelector("#palabrasClave input"),
		palClaveAprob: DOM.configCampos.querySelector("#palabrasClave i"),

		// Muestra / Oculta filtros
		toggleFiltrosIndivs: DOM.configCons.querySelector("#toggleFiltrosIndivs"),
		muestraFiltros: DOM.configCons.querySelector("#toggleFiltrosIndivs #muestraFiltros"),
		ocultaFiltros: DOM.configCons.querySelector("#toggleFiltrosIndivs #ocultaFiltros"),

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

		// Zona Disponible - Resultados
		resultados: DOM.zonaDisponible.querySelectorAll("#vistaDeResults .resultados"),
		vistaDeResults: DOM.zonaDisponible.querySelector("#vistaDeResults"),
		botones: DOM.zonaDisponible.querySelector("#vistaDeResults #botones"),
		listados: DOM.zonaDisponible.querySelector("#vistaDeResults #listados"),

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
		...(await obtiene.obtieneVariablesDelBE()),
		configCons_cabeceras: await obtiene.configsDeCabecera(),
		pppRutaGuardar: "/producto/api/guarda-la-preferencia-del-usuario/?entidad=",
		conLinksHD: "conLinksHD",
		enCast: "enCast",
		muestraFiltros: false,
		contadorDeMostrarResults: 0,
	};

	// Start-up
	DOM.encabMasPelis.classList.replace("ocultar", "aparece"); // Tiene que estar en primer lugar, para no demorar su ejecución
	await cambioDeConfig_id("start-up");
	actualiza.cartelQuieroVerVisible();
	await cambioDeCampos();
	DOM.quieroVer.focus(); // foco en el cartel 'Quiero ver'
});

// Variables
const ruta = "/consultas/api/";
let DOM, v, configCons, titulo;
