const funciones = require("../../funciones/varias/funcionesVarias");

module.exports = (req, res, next) => {
	if (!req.session.usuario) {
		funciones.userLogs(req, res);
		return res.redirect("/usuarios/login");
	}
	next();
};