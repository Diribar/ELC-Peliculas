"use strict";
// Definir variables
const BD_genericas = require("../../funciones/2-BD/Genericas");
const compartidas = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");

module.exports = {
	// Links - Controlador Vista
	obtenerLinksActualizados: async (entidad, prodID, userID) => {
		// Obtiene para el usuario los links 'personalizados', es decir el original editado por él
		// Variables
		let producto_id = compartidas.obtenerEntidad_id(entidad);
		let includes = ["tipo", "prov", "status_registro", "ediciones", "motivo"];
		let camposARevisar = variables.camposRevisarLinks().map((n) => n.nombreDelCampo);
		// Obtener los linksOriginales
		let links = await BD_genericas.obtenerTodosPorCamposConInclude(
			"links",
			{[producto_id]: prodID},
			includes
		);
		// Ordenar por ID
		links.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
		// Combinarlos con la edición, si existe
		links.forEach((link, i) => {
			if (link.ediciones.length) {
				let edicion = link.ediciones.find((n) => n.editado_por_id == userID);
				if (edicion)
					for (let campo in edicion)
						if (edicion[campo] !== null && camposARevisar.includes(campo))
							links[i][campo] = edicion[campo];
			}
		});
		// Fin
		return links;
	},
};
