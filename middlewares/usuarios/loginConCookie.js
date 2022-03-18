let BD_especificas = require("../../funciones/BD/especificas");

module.exports = async (req, res, next) => {
	// Uso de cookies para identificar al usuario
	if (!req.session.usuario && req.cookies && req.cookies.email) {
		let usuario = await BD_especificas.obtenerUsuarioPorMail(req.cookies.email);
		if (usuario) req.session.usuario = usuario;
	}
	// Graba a Locals los datos del usuario
	if (req.session.usuario && !res.locals.usuario)
		res.locals.usuario = req.session.usuario;
	next();
};
