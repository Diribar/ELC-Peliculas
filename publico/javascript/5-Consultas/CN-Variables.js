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
		orden_id: DOM.tituloPrincipal.querySelector("select[name='orden_id']"),
		entidad_id: DOM.tituloPrincipal.querySelector("select[name='entidad_id']"),
		entidad_idOpciones: DOM.tituloPrincipal.querySelectorAll("select[name='entidad_id'] option"),
		iconosAyuda: DOM.tituloPrincipal.querySelectorAll("#ayudaOrden ul li"),

		// Configuración de Cabecera
		configNuevaNombre: DOM.configCabecera.querySelector("#configNueva input[name='nombreNuevo']"),
		configCons_id: DOM.configCabecera.querySelector("select[name='configCons_id']"),
		configsConsPropios: DOM.configCabecera.querySelector("select[name='configCons_id'] optgroup#propios"),
		iconosBotonera: DOM.configCabecera.querySelectorAll("#iconosBotonera i"),

		// Configuración de Campos - Check-Boxes
		noLaVi: DOM.configCampos.querySelector("#checkBoxes #noLaVi"),
		conLinks: DOM.configCampos.querySelector("#checkBoxes #conLinks"),
		enCast: DOM.configCampos.querySelector("#checkBoxes #enCast"),

		// Configuración de Campos - Preferencias
		nav: DOM.configCampos.querySelector("nav"),
		camposPresenciaEstable: DOM.configCampos.querySelectorAll(".presenciaEstable"),
		selects: DOM.configCampos.querySelectorAll("select"),
		palClave: DOM.configCampos.querySelector("#palabrasClave input"),
		palClaveAprob: DOM.configCampos.querySelector("#palabrasClave i"),
		mostrarOcultarFiltros: DOM.configCampos.querySelector("#mostrarOcultarFiltros"),
		mostrarFiltros: DOM.configCampos.querySelector("#mostrarOcultarFiltros #mostrarFiltros"),
		ocultarFiltros: DOM.configCampos.querySelector("#mostrarOcultarFiltros #ocultarFiltros"),

		// Zona Disponible
		asegurate: DOM.zonaDisponible.querySelector("#comencemos button#rojo"),
		quieroVer: DOM.zonaDisponible.querySelector("#comencemos button#verde"),
		noTenemos: DOM.zonaDisponible.querySelector("#comencemos button#azul"),
		resultados: DOM.zonaDisponible.querySelectorAll("#vistaDeResults .resultados"),
		vistaDeResults: DOM.zonaDisponible.querySelector("#vistaDeResults"),
		botones: DOM.zonaDisponible.querySelector("#vistaDeResults #botones"),
		listados: DOM.zonaDisponible.querySelector("#vistaDeResults #listados"),
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
		pppOpciones: await fetch("/producto/api/obtiene-opciones-de-preferencia").then((n) => n.json()),
		pppRrutaGuardar: "/producto/api/guarda-la-preferencia-del-usuario/?entidad=",
		localhost: await fetch("/api/localhost").then((n) => n.json()),
		mostrarFiltros: false,
		topeParaMasRecientes: 20,
	};

	// Start-up
	DOM.encabMasPelis.classList.replace("ocultar", "aparece"); // Tiene que estar en primer lugar, para no demorar su ejecución
	await cambioDeConfig_id();
	actualiza.cartelQuieroVerVisible();
	await cambioDeCampos();
});

// Variables
const ruta = "/consultas/api/";
let DOM, v, configCons, titulo;
