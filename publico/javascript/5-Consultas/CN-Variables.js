"use strict";
window.addEventListener("load", async () => {
	// Variables
	DOM = {
		// Formulario General
		cuerpo: document.querySelector("#cuerpo"),
		// Encabezado, Cabecera, Campos
		prefsSimples: document.querySelectorAll("#cuerpo :is(#encabezado, #configsDeCampo) .prefSimple"),
		encabezado: document.querySelector("#encabMasPelis #encabezado"),
		tituloPrincipal: document.querySelector("#encabMasPelis #encabezado #tituloPrincipal"),
		configCons: document.querySelector("#configCons"),
		configCabecera: document.querySelector("#configCons #configDeCabecera"),
		configCampos: document.querySelector("#configCons #configsDeCampo nav"),
		// Zona de productos
		zonaProds: document.querySelector("#zonaDeProds"),
	};
	DOM = {
		...DOM,

		// Encabezado
		layout_id: DOM.tituloPrincipal.querySelector("select[name='layout_id']"),
		orden_id: DOM.tituloPrincipal.querySelector("select[name='orden_id']"),
		orden_idOpciones: DOM.tituloPrincipal.querySelectorAll("select[name='orden_id'] option:not(option[value=''])"),
		ascDes: DOM.tituloPrincipal.querySelector("#ascDes"),
		iconosAyuda: DOM.tituloPrincipal.querySelectorAll(".ayuda ul li"),
		contadorDeProds: DOM.encabezado.querySelector("#derecha #contadorDeProds"),

		// Configuracion
		iconos: DOM.configCons.querySelectorAll("i"),

		// Configuración de Cabecera
		configNuevaNombre: DOM.configCabecera.querySelector("#configNueva input[name='nombreNuevo']"),
		configCons_id: DOM.configCabecera.querySelector("select[name='configCons_id']"),
		configsConsPropios: DOM.configCabecera.querySelector("select[name='configCons_id'] optgroup#propios"),
		iconosBotonera: DOM.configCabecera.querySelectorAll("#iconosBotonera i"),

		// Configuración de Campos
		camposPresenciaEstable: DOM.configCampos.querySelectorAll(".presenciaEstable"),
		camposPresenciaEventual: DOM.configCampos.querySelectorAll("select:not(.presenciaEstable)"),
		palClave: DOM.configCampos.querySelector("#palabrasClave input"),
		palClaveAprob: DOM.configCampos.querySelector("#palabrasClave i"),

		// Zona de productos
		asegurate: DOM.zonaProds.querySelector("#comencemos button#rojo"),
		comencemos: DOM.zonaProds.querySelector("#comencemos button#verde"),
		// Productos
		vistaProds: DOM.zonaProds.querySelector("#vistaProds"),
		productos: DOM.zonaProds.querySelector("#vistaProds #productos"),
		producto: DOM.zonaProds.querySelector("#vistaProds .producto"),
	};
	for (let icono of DOM.iconosBotonera) DOM[icono.id] = icono;
	for (let campo of DOM.camposPresenciaEstable) DOM[campo.name] = campo;
	for (let campo of DOM.camposPresenciaEventual) DOM[campo.name] = campo;
	v = {...(await obtiene.opcionesDeLayoutMasOrden()), configsDeCabecera: await obtiene.configsDeCabecera()};

	// Start-up
	await cambioDeConfig_id();
	await cambioDeCampos();
});

// Variables
const ruta = "/consultas/api/";
let configCons, DOM, v, entidad;
