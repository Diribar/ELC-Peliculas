const varias = require("../../funciones/Varias/Varias");

module.exports = (req, res, next) => {
	if (!req.session.usuario) {
		varias.userLogs(req, res);
		return res.redirect("/usuarios/login");
	}
	next();
};