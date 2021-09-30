const funciones = require("../../funciones/funcionesVarias");

module.exports = (req, res, next) => {
	if (!req.session.usuario) {
		funciones.userLogs(req, res);
		return res.redirect("/login");
	}
	else if (req.session.usuario.rol_usuario_id < 4) {
		return res.redirect("/peliculas/agregar/palabras_clave");
	}
	next();
};
