// ************ Requires ************
let funcionesVarias = require("../../funciones/funcionesVarias");
let validarUsuarios = require("../../funciones/validarUsuarios");

// *********** Controlador ***********
module.exports = {
	validarMail: async (req, res) => {
		let datos = req.query;
		let errores = await validarUsuarios.validarMail(datos.email);
		return res.json(errores);
	},
};
