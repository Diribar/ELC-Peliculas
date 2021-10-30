const path = require("path");
const metodosUsuario = require("../../funciones/BD/usuarios");

module.exports = async (req, res, next) => {
	// Uso de cookies para identificar al usuario
	if (!req.session.usuario && req.cookies && req.cookies.email) {
		let usuario = await metodosUsuario.obtenerPorMail(req.cookies.email);
		if (usuario) req.session.usuario = usuario;
	}
	// Graba a Locals los datos del usuario
	if (req.session.usuario && !res.locals.usuario)
		res.locals.usuario = req.session.usuario;
	next();
};
