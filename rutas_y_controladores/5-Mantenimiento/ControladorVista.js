"use strict";
// ************ Requires ************
const BD_genericas = require("../../funciones/2-BD/Genericas");
const BD_especificas = require("../../funciones/2-BD/Especificas");
const comp = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");
const procesos = require("./FN-Procesos");

module.exports = {
	TC_obtenerProdsSinLink: async (ahora, userID) => {
		// Obtiene todos los productos aprobados, sin ningún link
		return [];
		// Obtiene los links 'a revisar'
		let links = await BD_especificas.TC_obtenerLinks_y_Edics();
		// Si no hay => salir
		if (!links.length) return [];
		// Obtiene los links ajenos
		let linksAjenos = links.filter(
			(n) =>
				(n.status_registro &&
					((n.status_registro.creado && n.creado_por_id != userID) ||
						((n.status_registro.inactivar || n.status_registro.recuperar) &&
							n.sugerido_por_id != userID))) ||
				(!n.status_registro && n.editado_por_id != userID)
		);
		// Obtiene los productos
		let productos = linksAjenos.length ? comp.obtenerProdsDeLinks(linksAjenos, ahora, userID) : [];
		// Fin
		return productos;
	},
};
