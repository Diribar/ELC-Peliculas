"use strict";
window.addEventListener("load", async () => {
	// Variables - DOM
	DOM = {
		// Formulario General
		cuerpo: document.querySelector("#cuerpo"),
		// Encabezado, Cabecera, Campos
		prefsSimples: document.querySelectorAll("#cuerpo :is(#encabezado, #configsDeCampo) .prefSimple"),
		configCons: document.querySelector("#configCons"),
		configCabecera: document.querySelector("#configCons #configDeCabecera"),
		configCampos: document.querySelector("#configCons #configsDeCampo nav"),
		encabMasPelis: document.querySelector("#encabMasPelis"),
		encabezado: document.querySelector("#encabMasPelis #encabezado"),
		layoutOrden: document.querySelector("#encabMasPelis #encabezado #tituloPrincipal"),
		// Zona de productos
		zonaProds: document.querySelector("#zonaDisponible"),
	};
	DOM = {
		...DOM,

		// Encabezado
		layout_id: DOM.layoutOrden.querySelector("select[name='layout_id']"),
		orden_id: DOM.layoutOrden.querySelector("select[name='orden_id']"),
		orden_idOpciones: DOM.layoutOrden.querySelectorAll("select[name='orden_id'] option:not(option[value=''])"),
		ascDes: DOM.layoutOrden.querySelector("#ascDes"),
		inputsAscDes: DOM.layoutOrden.querySelectorAll("#ascDes input"),
		iconosAyuda: DOM.layoutOrden.querySelectorAll("#ayudaOrden ul li"),
		contadorDeProds: DOM.encabezado.querySelector("#derecha #contadorDeProds"),

		// Configuración de Cabecera
		configNuevaNombre: DOM.configCabecera.querySelector("#configNueva input[name='nombreNuevo']"),
		configCons_id: DOM.configCabecera.querySelector("select[name='configCons_id']"),
		configsConsPropios: DOM.configCabecera.querySelector("select[name='configCons_id'] optgroup#propios"),
		iconosBotonera: DOM.configCabecera.querySelectorAll("#iconosBotonera i"),

		// Configuración de Campos
		camposPresenciaEstable: DOM.configCampos.querySelectorAll(".presenciaEstable"),
		selects: DOM.configCampos.querySelectorAll("select"),
		palClave: DOM.configCampos.querySelector("#palabrasClave input"),
		palClaveAprob: DOM.configCampos.querySelector("#palabrasClave i"),

		// Zona de resultados
		asegurate: DOM.zonaProds.querySelector("#comencemos button#rojo"),
		quieroVer: DOM.zonaProds.querySelector("#comencemos button#verde"),
		noTenemos: DOM.zonaProds.querySelector("#comencemos button#azul"),
		resultados: DOM.zonaProds.querySelectorAll("#vistaDeResults .resultados"),
		vistaDeResults: DOM.zonaProds.querySelector("#vistaDeResults"),
		botones: DOM.zonaProds.querySelector("#vistaDeResults #botones"),
		listados: DOM.zonaProds.querySelector("#vistaDeResults #listados"),
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
		...(await obtiene.opcionesDeLayoutMasOrden()),
		configsDeCabecera: await obtiene.configsDeCabecera(),
		pppOpciones: await fetch("/producto/api/obtiene-opciones-de-preferencia").then((n) => n.json()),
		pppRrutaGuardar: "/producto/api/guarda-la-preferencia-del-usuario/?entidad=",
		localhost: await fetch("/api/localhost").then((n) => n.json()),
	};

	// Start-up
	await cambioDeConfig_id();
	await cambioDeCampos();
	DOM.encabMasPelis.classList.replace("ocultar", "aparece");
});

// Variables
const br = document.createElement("br");
const ruta = "/consultas/api/";
let configCons, DOM, titulo, v, entidad;
