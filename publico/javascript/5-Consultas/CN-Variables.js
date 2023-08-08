"use strict";
window.addEventListener("load", async () => {
	// Variables - DOM
	DOM = {
		// Formulario General
		cuerpo: document.querySelector("#cuerpo"),
		// Encabezado, Cabecera, Campos
		prefsSimples: document.querySelectorAll("#cuerpo :is(#encabezado, #configCampos) .prefSimple"),
		configCons: document.querySelector("#configCons"),
		configCabecera: document.querySelector("#configCons #configCabecera"),
		configCampos: document.querySelector("#configCons #configCampos"),
		encabMasPelis: document.querySelector("#encabMasPelis"),
		encabezado: document.querySelector("#encabMasPelis #encabezado"),
		ordenEntidad: document.querySelector("#encabMasPelis #encabezado #tituloPrincipal"),
		// Zona de productos
		zonaDisponible: document.querySelector("#zonaDisponible"),
	};
	DOM = {
		...DOM,

		// Encabezado
		orden_id: DOM.ordenEntidad.querySelector("select[name='orden_id']"),
		entidad_id: DOM.ordenEntidad.querySelector("select[name='entidad_id']"),
		entidad_idOpciones: DOM.ordenEntidad.querySelectorAll("select[name='entidad_id'] option"),
		iconosAyuda: DOM.ordenEntidad.querySelectorAll("#ayudaOrden ul li"),
		contadorDeProds: DOM.encabezado.querySelector("#derecha #contadorDeProds"),

		// Configuración de Cabecera
		configNuevaNombre: DOM.configCabecera.querySelector("#configNueva input[name='nombreNuevo']"),
		configCons_id: DOM.configCabecera.querySelector("select[name='configCons_id']"),
		configsConsPropios: DOM.configCabecera.querySelector("select[name='configCons_id'] optgroup#propios"),
		iconosBotonera: DOM.configCabecera.querySelectorAll("#iconosBotonera i"),

		// Configuración de Campos
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
