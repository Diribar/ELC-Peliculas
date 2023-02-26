"use strict";
// Definir variables
const path = require("path");
const BD_genericas = require("../../funciones/2-BD/Genericas");
const BD_especificas = require("../../funciones/2-BD/Especificas");
const comp = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");
const procsCRUD = require("../2.0-Familias-CRUD/FM-Procesos");
const validaPR = require("../2.1-Prod-RUD/PR-FN-Validar");

module.exports = {
    TC_obtieneProdsSinLink: async (ahora, userID) => {
		// Obtiene todos los productos aprobados, sin ningún link
		return [];
		// Obtiene los links 'a revisar'
		let links = await BD_especificas.TC_obtieneLinks_y_EdicsAjenas();
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
		let productos = linksAjenos.length ? comp.obtieneProdsDeLinks(linksAjenos, ahora, userID) : [];
		// Fin
		return productos;
	},

};
