"use strict";
// Definir variables
const BD_genericas = require("../../funciones/2-BD/Genericas");
const comp = require("../../funciones/3-Procesos/Compartidas");

module.exports = {
	// Producto
	obtieneVersionesDelProducto: async (entidad, prodID, userID) => {
		// Variables
		let includesEdic = comp.includes("productos");
		let includesOrig = ["creado_por", "status_registro"];
		if (entidad == "capitulos") includesOrig.push("coleccion");
		if (entidad == "colecciones") includesOrig.push("capitulos");
		let prodEdic = "";

		// Obtiene el producto ORIGINAL
		let prodOrig = await BD_genericas.obtienePorIdConInclude(entidad, prodID, [
			...includesEdic,
			...includesOrig,
		]);
		prodOrig = comp.quitarCamposSinContenido(prodOrig);

		// Obtiene el producto EDITADO
		let producto_id = comp.obtieneEntidad_id(entidad);
		let datos = ["prods_edicion", {[producto_id]: prodID, editado_por_id: userID}, includesEdic];
		if (userID) prodEdic = await BD_genericas.obtienePorCamposConInclude(...datos);
		if (prodEdic) prodEdic = comp.quitarCamposSinContenido(prodEdic);
		// Fin
		return [prodOrig, prodEdic];
	},
};
