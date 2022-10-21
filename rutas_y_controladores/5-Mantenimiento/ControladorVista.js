"use strict";
// ************ Requires ************
const BD_genericas = require("../../funciones/2-BD/Genericas");
const BD_especificas = require("../../funciones/2-BD/Especificas");
const compartidas = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");
const procesos = require("./FN-Procesos");

module.exports = {
	TC_obtenerProdsSinLink: async (ahora, userID) => {
		// Obtener todos los productos aprobados, sin ningún link
		return [];
		// Obtener los links 'a revisar'
		let links = await BD_especificas.TC_obtenerLinks_y_Edics();
		// Si no hay => salir
		if (!links.length) return [];
		// Obtener los links ajenos
		let linksAjenos = links.filter(
			(n) =>
				(n.status_registro &&
					((n.status_registro.creado && n.creado_por_id != userID) ||
						((n.status_registro.inactivar || n.status_registro.recuperar) &&
							n.sugerido_por_id != userID))) ||
				(!n.status_registro && n.editado_por_id != userID)
		);
		// Obtener los productos
		let productos = linksAjenos.length ? obtenerProdsDeLinks(linksAjenos, ahora, userID) : [];
		// Fin
		return productos;
	},
};
