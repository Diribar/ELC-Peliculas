"use strict";
// ************ Requires *************
const BD_genericas = require("../../funciones/2-BD/Genericas");
const BD_especificas = require("../../funciones/2-BD/Especificas");
const comp = require("../../funciones/3-Procesos/Compartidas");

// *********** Controlador ***********
module.exports = {
	inactivar: async (req, res) => {
		// 1. Tema y Código
		const tema = "crud";
		const codigo = "inactivar";

		// Más variables
		const {entidad, id} = req.query;
		const familia = comp.obtieneFamiliaEnPlural(entidad);

		// Obtiene el título
		const a = entidad == "peliculas" || entidad == "coleccion" ? "a " : " ";
		const entidadNombre = comp.obtieneEntidadNombre(entidad);
		const titulo = "Inactivar un" + a + entidadNombre;

		// Obtiene el avatar
		let registro = await BD_genericas.obtienePorId(entidad, id);

		// Render del formulario
		return res.send({
			...{tema, codigo, titulo},
			avatar,
		});
	},
	recuperar: (req, res) => {
		return res.send("recuperar");
	},
};
