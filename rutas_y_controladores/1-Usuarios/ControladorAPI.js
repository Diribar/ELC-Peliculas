// ************ Requires ************
let validarUsuarios = require("../../funciones/varias/Usuarios-errores");

// *********** Controlador ***********
module.exports = {
	validarMail: async (req, res) => {
		let errores = await validarUsuarios.registroMail(req.query.email);
		return res.json(errores);
	},

	validarPerennes: async (req, res) => {
		let errores = await validarUsuarios.perennes(req.query);
		return res.json(errores);
	},
	
	validarEditables: async (req, res) => {
		let errores = await validarUsuarios.editables(req.query);
		return res.json(errores);
	},
};
