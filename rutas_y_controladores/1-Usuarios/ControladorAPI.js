// ************ Requires ************
let validarUsuarios = require("../../funciones/varias/Usuarios-errores");
let BD_usuarios = require("../../funciones/BD/usuarios");

// *********** Controlador ***********
module.exports = {
	validarMail: async (req, res) => {
		let errores = await validarUsuarios.registroMail(req.query.email);
		return res.json(errores);
	},

	validarLogin: async (req, res) => {
		usuario =
			req.query.email && req.query.contrasena
				? await BD_usuarios.obtenerPorMail(req.query.email)
				: "";
		contrasena = usuario ? usuario.contrasena : ""
		let errores = validarUsuarios.login(req.query, contrasena);
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
