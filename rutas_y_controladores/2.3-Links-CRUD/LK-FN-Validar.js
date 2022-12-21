"use strict";
// Definir variables
const BD_especificas = require("../../funciones/2-BD/Especificas");
const BD_genericas = require("../../funciones/2-BD/Genericas");
const comp = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");

module.exports = {
	// ControllerAPI (validaLinks)
	links: async (datos) => {
		let campos = Object.keys(datos);
		let errores = {};
		// url
		if (campos.includes("url")) {
			let longitud = datos.url ? comp.longitud(datos.url, 5, 100) : "";
			errores.url = !datos.url
				? comp.inputVacio
				: longitud
				? longitud
				: !datos.url.includes("/")
				? "Por favor ingresá una url válida"
				: variables.provsQueNoRespetanCopyright.map((n) => n.url).some((n) => datos.url.includes(n))
				? "No nos consta que ese proveedor respete los derechos de autor."
				: variables.provsListaNegra.some((n) => datos.url.includes(n))
				? "Los videos de ese portal son ajenos a nuestro perfil"
				: "";
			if (!errores.url) {
				let repetido = await validaLinkRepetidos(datos);
				if (repetido) errores.url = repetido;
			}
		}
		// calidad
		if (campos.includes("calidad")) errores.calidad = !datos.calidad ? comp.inputVacio : "";
		// castellano
		if (campos.includes("castellano")) {
			errores.castellano = !datos.castellano
				? comp.inputVacio
				: datos.castellano != "0" && datos.castellano != "1"
				? "Valor inválido"
				: "";
		}
		// subtitulos castellano
		if (campos.includes("subtit_castellano") && datos.castellano != "1") {
			errores.subtit_castellano = !datos.subtit_castellano
				? comp.inputVacio
				: datos.subtit_castellano != "0" && datos.subtit_castellano != "1"
				? "Valor inválido"
				: "";
		}
		// gratuito
		if (campos.includes("gratuito")) {
			errores.gratuito = !datos.gratuito
				? comp.inputVacio
				: datos.gratuito != "0" && datos.gratuito != "1"
				? "Valor inválido"
				: "";
		}
		// tipo_id
		if (campos.includes("tipo_id")) {
			errores.tipo_id = !datos.tipo_id
				? comp.inputVacio
				: datos.tipo_id != "1" && datos.tipo_id != "2"
				? "Por favor elegí una opción válida"
				: "";
		}
		// completo
		if (campos.includes("completo") && datos.tipo_id != "1")
			errores.completo = !datos.completo ? comp.inputVacio : "";
		// parte
		if (campos.includes("parte") && datos.completo == "0") {
			errores.parte = !datos.parte
				? comp.inputVacio
				: datos.parte != parseInt(datos.parte) || parseInt(datos.parte) <= 0
				? "Necesitamos que ingreses un número positivo"
				: "";
		}
		// ***** RESUMEN *******
		errores.hay = Object.values(errores).some((n) => !!n);
		return errores;
	},
};

// Funciones **************************
let validaLinkRepetidos = async (datos) => {
	// Variables
	datos = {...datos, entidad: "links"};
	let respuesta = "";
	// Obtiene casos
	let id = await BD_especificas.validaRepetidos(["url"], datos);
	if (id) {
		let link = await BD_genericas.obtienePorId("links", id);
		let prodEntidad = comp.obtieneEntidadDesdeEdicion(link);
		let entidadId = comp.obtieneEntidad_id(prodEntidad);
		let prodId = link[entidadId];
		datos = {entidad: prodEntidad, id: prodId};
		respuesta = comp.cartelRepetido(datos);
	}
	// Fin
	return respuesta;
};
