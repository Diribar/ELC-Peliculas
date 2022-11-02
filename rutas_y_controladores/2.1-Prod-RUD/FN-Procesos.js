"use strict";
// Definir variables
const BD_genericas = require("../../funciones/2-BD/Genericas");
const comp = require("../../funciones/3-Procesos/Compartidas");

module.exports = {
	// Producto
	obtieneVersionesDelProducto: async (entidad, prodID, userID) => {
		// Definir los campos include
		let includes = comp.includes("productos");
		let includesOriginal = ["creado_por", "status_registro"];
		if (entidad == "capitulos") includesOriginal.push("coleccion");
		else if (entidad == "colecciones") includesOriginal.push("capitulos");
		// Obtiene el producto ORIGINAL
		let prodOrig = await BD_genericas.obtienePorIdConInclude(entidad, prodID, [
			...includes,
			...includesOriginal,
		]);
		// Obtiene el producto EDITADO
		let prodEdic = "";
		let producto_id = comp.obtieneEntidad_id(entidad);
		if (prodOrig) {
			// Quitarle los campos 'null'
			prodOrig = comp.quitarCamposSinContenido(prodOrig);
			// Obtiene los datos EDITADOS del producto
			prodEdic = userID
				? await BD_genericas.obtienePorCamposConInclude(
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
