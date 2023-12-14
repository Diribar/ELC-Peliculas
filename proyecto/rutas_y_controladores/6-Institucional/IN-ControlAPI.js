"use strict";
// Variables
const valida = require("./IN-FN-Validar");

// *********** Controlador ***********
module.exports = {
	validaContactanos: async (req, res) => {
		// Averigua los errores solamente para esos campos
		let errores = await valida.contactanos(req.query);

		// Devuelve el resultado
		return res.json(errores);
	},
};
