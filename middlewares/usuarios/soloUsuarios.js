const funciones = require("../../funciones/funcionesVarias");

module.exports = (req, res, next) => {
	if (!req.session.usuario) {
		funciones.userLogs(req, res);
		return res.redirect("/login");
	}
	next();
};