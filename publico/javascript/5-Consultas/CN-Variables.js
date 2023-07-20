"use strict";
window.addEventListener("load", async () => {
	// Variables
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
		layoutOrden: document.querySelector("#encabMasPelis #encabezado #layoutOrden"),
		// Zona de productos
		zonaProds: document.querySelector("#zonaDeProds"),
	};
	DOM = {
		...DOM,

		// Encabezado
		layout_id: DOM.layoutOrden.querySelector("select[name='layout_id']"),
		orden_id: DOM.layoutOrden.querySelector("select[name='orden_id']"),
		orden_idOpciones: DOM.layoutOrden.querySelectorAll("select[name='orden_id'] option:not(option[value=''])"),
		ascDes: DOM.layoutOrden.querySelector("#ascDes"),
		inputsAscDes:DOM.layoutOrden.querySelectorAll("#ascDes input"),
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

		// Zona de productos
		asegurate: DOM.zonaProds.querySelector("#comencemos button#rojo"),
		comencemos: DOM.zonaProds.querySelector("#comencemos button#verde"),
		noTenemos: DOM.zonaProds.querySelector("#comencemos button#azul"),
		resultados: DOM.zonaProds.querySelectorAll("#vistaProds .resultados"),
		// Productos
		vistaProds: DOM.zonaProds.querySelector("#vistaProds"),
		productos: DOM.zonaProds.querySelector("#vistaProds #productos"),
		producto: DOM.zonaProds.querySelector("#vistaProds .producto"),
	};
	for (let icono of DOM.iconosBotonera) DOM[icono.id] = icono;
	for (let campo of DOM.selects) DOM[campo.name] = campo;
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
	DOM.encabMasPelis.classList.replace("ocultar", "aparece")
});

// Variables
const ruta = "/consultas/api/";
let configCons, DOM, v, entidad;
