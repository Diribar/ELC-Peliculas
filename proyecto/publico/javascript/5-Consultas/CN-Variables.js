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
		entidad_id: DOM.tituloPrincipal.querySelector("select[name='entidad_id']"),
		ordenPorEnt_id: DOM.tituloPrincipal.querySelector("select[name='ordenPorEnt_id']"),
		ordenPorEntOpciones: DOM.tituloPrincipal.querySelectorAll("select[name='ordenPorEnt_id'] option"),
		optgroupCuatroPelis: DOM.tituloPrincipal.querySelector("select[name='ordenPorEnt_id'] optgroup#cuatroPelis"),
		iconosAyuda: DOM.tituloPrincipal.querySelectorAll("#ayudaOrden ul li"),

		// Configuración de Cabecera - Botonera
		configNuevaNombre: DOM.configCabecera.querySelector("#configNueva input[name='nombreNuevo']"),
		configCons_id: DOM.configCabecera.querySelector("select[name='configCons_id']"),
		configsConsPropios: DOM.configCabecera.querySelector("select[name='configCons_id'] optgroup#propios"),
		iconosBotonera: DOM.configCabecera.querySelectorAll("#iconosBotonera i"),

		// Configuración de de Cabecera - Check-Boxes
		checkBoxesInputs: DOM.configCons.querySelectorAll("#checkBoxes input"),
		noLaVi: DOM.configCons.querySelector("#checkBoxes #noLaVi"),
		conLinksHD: DOM.configCons.querySelector("#checkBoxes #conLinksHD"),
		enCast: DOM.configCons.querySelector("#checkBoxes #enCast"),

		// Configuración de Campos - Preferencias
		nav: DOM.configCampos.querySelector("nav"),
		camposPresenciaEstable: DOM.configCampos.querySelectorAll(".presenciaEstable"),
		selects: DOM.configCampos.querySelectorAll("select"),
		palClave: DOM.configCampos.querySelector("#palabrasClave input"),
		palClaveAprob: DOM.configCampos.querySelector("#palabrasClave i"),

		// Muestra / Oculta filtros
		mostrarOcultarFiltros: DOM.configCons.querySelector("#mostrarOcultarFiltros"),
		mostrarFiltros: DOM.configCons.querySelector("#mostrarOcultarFiltros #mostrarFiltros"),
		ocultarFiltros: DOM.configCons.querySelector("#mostrarOcultarFiltros #ocultarFiltros"),

		// Zona Disponible - Carteles e Imagen de fondo
		esperandoResultados: DOM.zonaDisponible.querySelector("#vistaDeResults #esperandoResultados"),
		telonFondo: DOM.zonaDisponible.querySelector("#vistaDeResults img#telonFondo"),
		carteles: DOM.zonaDisponible.querySelectorAll("#carteles .cartel"),
		asegurate: DOM.zonaDisponible.querySelector("#carteles button#asegurate"),
		quieroVer: DOM.zonaDisponible.querySelector("#carteles button#quieroVer"),
		noTenemos: DOM.zonaDisponible.querySelector("#carteles button#noTenemos"),
		pppSinLogin: DOM.zonaDisponible.querySelector("#carteles button#pppSinLogin"),
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
		configsDeCabecera: await obtiene.configsDeCabecera(),
		pppRrutaGuardar: "/producto/api/guarda-la-preferencia-del-usuario/?entidad=",
		mostrarFiltros: false,
		topeParaMasRecientes: 20,
		contadorDeMostrarResults: 0,
	};
	for (let pppOcion of v.pppOpciones) v[pppOcion.codigo] = v.pppOpciones.find((n) => n.codigo == pppOcion.codigo);


	// Start-up
	DOM.encabMasPelis.classList.replace("ocultar", "aparece"); // Tiene que estar en primer lugar, para no demorar su ejecución
	await cambioDeConfig_id();
	actualiza.cartelQuieroVerVisible();
	await cambioDeCampos();
	DOM.quieroVer.focus(); // foco en el cartel 'Quiero ver'
	document.querySelector('main').scrollLeft = 220
});

// Variables
const ruta = "/consultas/api/";
let DOM, v, configCons, titulo;
