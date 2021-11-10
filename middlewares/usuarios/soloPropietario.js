const funciones = require("../../funciones/Varias/varias");

module.exports = (req, res, next) => {
	if (!req.session.usuario) {
		funciones.userLogs(req, res);
		return res.redirect("/usuarios/login");
	}
	else if (req.session.usuario.rol_usuario_id < 4) {
		return res.redirect("/agregar/producto/palabras-clave");
	}
	next();
};
