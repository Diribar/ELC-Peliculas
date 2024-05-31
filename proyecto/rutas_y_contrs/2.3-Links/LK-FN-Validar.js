"use strict";
// Variables
const procsCRUD = require("../2.0-Familias/FM-Procesos");

module.exports = {
	// ControllerAPI (validaLinks)
	links: async (datos) => {
		let campos = Object.keys(datos);
		let errores = {};
		// url
		if (campos.includes("url")) {
			let longitud = datos.url ? comp.validacs.longitud(datos.url, 5, 120) : "";
			errores.url = !datos.url
				? variables.inputVacio
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
		if (campos.includes("calidad")) errores.calidad = !datos.calidad ? variables.inputVacio : "";
		// castellano
		if (campos.includes("castellano"))
			errores.castellano = !datos.castellano
				? variables.inputVacio
				: datos.castellano != "0" && datos.castellano != "1"
				? "Valor inválido"
				: "";

		// subtitulos castellano
		if (campos.includes("subtitulos") && datos.castellano != "1")
			errores.subtitulos = !datos.subtitulos
				? variables.inputVacio
				: datos.subtitulos != "0" && datos.subtitulos != "1"
				? "Valor inválido"
				: "";

		// gratuito
		if (campos.includes("gratuito"))
			errores.gratuito = !datos.gratuito
				? variables.inputVacio
				: datos.gratuito != "0" && datos.gratuito != "1"
				? "Valor inválido"
				: "";

		// tipo_id
		if (campos.includes("tipo_id"))
			errores.tipo_id = !datos.tipo_id
				? variables.inputVacio
				: datos.tipo_id != "1" && datos.tipo_id != "2"
				? "Por favor elegí una opción válida"
				: "";

		// completo
		if (campos.includes("completo") && datos.tipo_id != "1") errores.completo = !datos.completo ? variables.inputVacio : "";

		// parte
		if (campos.includes("parte") && datos.completo == "0")
			errores.parte = !datos.parte
				? variables.inputVacio
				: datos.parte != parseInt(datos.parte) || parseInt(datos.parte) <= 0
				? "Necesitamos que ingreses un número positivo"
				: "";

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
		let prodEntidad = comp.obtieneDesdeCampo_id.entidadProd(link);
		let campo_id = comp.obtieneDesdeEntidad.campo_id(prodEntidad);
		let prodID = link[campo_id];
		datos = {entidad: prodEntidad, id: prodID, entidadNombre: "link"};
		respuesta = comp.validacs.cartelRepetido(datos);
	}
	// Fin
	return respuesta;
};
