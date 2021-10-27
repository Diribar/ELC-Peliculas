// ************ Requires ************
let validarUsuarios = require("../../funciones/varias/Usuarios-validar");

// *********** Controlador ***********
module.exports = {
	validarMail: async (req, res) => {
		let datos = req.query;
		let errores = await validarUsuarios.mail(datos.email);
		return res.json(errores);
	},
	validarPerennes: async (req, res) => {
		let datos = req.query;
		let errores = await validarUsuarios.perennes(datos);
		return res.json(errores);
	},
	validarEditables: async (req, res) => {
		let datos = req.query;
		let errores = await validarUsuarios.editables(datos);
		return res.json(errores);
	},
};
