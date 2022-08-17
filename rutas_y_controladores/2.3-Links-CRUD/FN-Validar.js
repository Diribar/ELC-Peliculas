"use strict";
// Definir variables
const BD_genericas = require("../../funciones/2-BD/Genericas");
const variables = require("../../funciones/3-Procesos/Variables");

module.exports = {
	// ControllerAPI (validarLinks)
	links: async (datos) => {
		let campos = Object.keys(datos);
		let errores = {};
		// url
		if (campos.includes("url")) {
			errores.url = !datos.url
				? cartelCampoVacio
				: longitud(datos.url, 5, 100)
				? longitud(datos.url, 5, 100)
				: !datos.url.includes("/")
				? "Por favor ingresá una url válida"
				: variables
						.provsQueNoRespetanCopyright()
						.map((n) => n.url)
						.some((n) => datos.url.includes(n))
				? "No nos consta que ese proveedor respete los derechos de autor."
				: variables.provsListaNegra().some((n) => datos.url.includes(n))
				? "Los videos de ese portal son ajenos a nuestro perfil"
				: "";
			if (!errores.url) {
				let repetido = await validarLinkRepetidos(datos);
				if (repetido) errores.url = repetido;
			}
		}
		// calidad
		if (campos.includes("calidad")) errores.calidad = !datos.calidad ? cartelCampoVacio : "";
		// castellano
		if (campos.includes("castellano")) {
			errores.castellano =
				datos.castellano == ""
					? cartelCampoVacio
					: datos.castellano != "0" && datos.castellano != "1"
					? "Valor inválido"
					: "";
		}
		// subtitulos castellano
		if (campos.includes("subtit_castellano")) {
			errores.subtit_castellano =
				datos.subtit_castellano == ""
					? cartelCampoVacio
					: datos.subtit_castellano != "0" && datos.subtit_castellano != "1"
					? "Valor inválido"
					: "";
		}
		// gratuito
		if (campos.includes("gratuito")) {
			errores.gratuito =
				datos.gratuito == ""
					? cartelCampoVacio
					: datos.gratuito != "0" && datos.gratuito != "1"
					? "Valor inválido"
					: "";
		}
		// tipo_id
		if (campos.includes("tipo_id")) {
			errores.tipo_id = !datos.tipo_id
				? cartelCampoVacio
				: datos.tipo_id != "1" && datos.tipo_id != "2"
				? "Por favor elegí una opción válida"
				: "";
		}
		// completo
		if (campos.includes("completo") && datos.tipo_id != "1")
			errores.completo = !datos.completo ? cartelCampoVacio : "";
		// parte
		if (campos.includes("parte") && datos.completo == "0") {
			errores.parte = !datos.parte
				? cartelCampoVacio
				: datos.parte != parseInt(datos.parte) || parseInt(datos.parte) <= 0
				? "Necesitamos que ingreses un número positivo"
				: "";
		}
		// ***** RESUMEN *******
		errores.hay = Object.values(errores).some((n) => !!n);
		return errores;
	},
};

// Variables **************************
let cartelCampoVacio = "Necesitamos que completes esta información";

let longitud = (dato, corto, largo) => {
	return dato.length < corto
		? "El contenido debe ser más largo"
		: dato.length > largo
		? "El contenido debe ser más corto. Tiene " + dato.length + " caracteres, el límite es " + largo + "."
		: "";
};
let validarLinkRepetidos = async (datos) => {
	// Obtener casos
	let averiguar = await BD_genericas.obtenerPorCampos("links", {url: datos.url});
	// Si se encontró algún caso, compara las ID
	let repetido = averiguar ? averiguar.id != datos.id : false;
	// Si hay casos --> mensaje de error con la entidad y el id
	let mensaje;
	if (repetido) {
		mensaje =
			"Este " +
			"<a href='/links/abm/?entidad=" +
			(averiguar.pelicula_id
				? "peliculas"
				: averiguar.coleccion_id
				? "colecciones"
				: averiguar.capitulo_id
				? "capitulos"
				: "") +
			"&id=" +
			(averiguar.pelicula_id
				? averiguar.pelicula_id
				: averiguar.coleccion_id
				? averiguar.coleccion_id
				: averiguar.capitulo_id
				? averiguar.capitulo_id
				: "") +
			"' target='_blank'><u><strong>link</strong></u></a>" +
			" ya se encuentra en nuestra base de datos";
	} else mensaje = "";
	return mensaje;
};
