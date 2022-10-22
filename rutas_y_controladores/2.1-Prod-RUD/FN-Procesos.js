"use strict";
// Definir variables
const BD_genericas = require("../../funciones/2-BD/Genericas");
const comp = require("../../funciones/3-Procesos/Compartidas");

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
		let prodOrig = await BD_genericas.obtenerPorIdConInclude(entidad, prodID, [
			...includes,
			...includesOriginal,
		]);
		// Obtener el producto EDITADO
		let prodEdic = "";
		let producto_id = comp.obtenerEntidad_id(entidad);
		if (prodOrig) {
			// Quitarle los campos 'null'
			prodOrig = comp.quitarCamposSinContenido(prodOrig);
			// Obtener los datos EDITADOS del producto
			prodEdic = userID
				? await BD_genericas.obtenerPorCamposConInclude(
						"prods_edicion",
						{[producto_id]: prodID, editado_por_id: userID},
						includes
				  )
				: {};
			// Quitarle los campos 'null'
			if (prodEdic) prodEdic = comp.quitarCamposSinContenido(prodEdic);
		}
		return [prodOrig, prodEdic];
	},
};
