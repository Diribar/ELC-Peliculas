"use strict";
// Definir variables
const validaUsuarios = require("./FN-Validar");

module.exports = {
	validaMail: async (req, res) => {
		let errores = await validaUsuarios.altaMail(req.query.email);
		return res.json(errores);
	},
	validaPerennes: async (req, res) => {
		let errores = await validaUsuarios.perennes(req.query);
		return res.json(errores);
	},
	validaEditables: async (req, res) => {
		let errores = await validaUsuarios.editables(req.query);
		return res.json(errores);
	},
	validaDocumento: async (req, res) => {
		let errores = await validaUsuarios.documentoFE(req.query);
		return res.json(errores);
	},
	validaLogin: async (req, res) => {
		let errores = validaUsuarios.login(req.query);
		return res.json(errores);
	},
};
