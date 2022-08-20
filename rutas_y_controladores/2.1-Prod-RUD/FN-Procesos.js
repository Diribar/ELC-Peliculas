"use strict";
// Definir variables
const BD_genericas = require("../../funciones/2-BD/Genericas");
const compartidas = require("../../funciones/3-Procesos/Compartidas");

module.exports = {
	// Producto
	obtenerVersionesDelProducto: async (entidad, prodID, userID) => {
		// Definir los campos include
		let includes = [
			"idioma_original",
			"en_castellano",
			"en_color",
			"categoria",
			"subcategoria",
			"publico_sugerido",
			"personaje",
			"hecho",
			"valor",
		];
		let includesOriginal = ["creado_por", "status_registro"];
		if (entidad == "capitulos") includesOriginal.push("coleccion");
		else if (entidad == "colecciones") includesOriginal.push("capitulos");
		// Obtener el producto ORIGINAL
		let prodOriginal = await BD_genericas.obtenerPorIdConInclude(entidad, prodID, [
			...includes,
			...includesOriginal,
		]);
		// Obtener el producto EDITADO
		let prodEditado = "";
		let producto_id = compartidas.obtenerEntidad_id(entidad);
		if (prodOriginal) {
			// Quitarle los campos 'null'
			prodOriginal = compartidas.quitarLosCamposSinContenido(prodOriginal);
			// Obtener los datos EDITADOS del producto
			prodEditado = await BD_genericas.obtenerPorCamposConInclude(
				"prods_edicion",
				{[producto_id]: prodID, editado_por_id: userID},
				includes
			);
			// Quitarle los campos 'null'
			if (prodEditado) prodEditado = compartidas.quitarLosCamposSinContenido(prodEditado);
		}
		return [prodOriginal, prodEditado];
	},
};
