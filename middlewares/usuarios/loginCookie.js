const path = require('path');
const metodosUsuario = require(path.join(__dirname, "../../modelos/BD_usuarios"));

module.exports = async (req,res,next) => {
	// Uso de cookies para identificar al usuario
	if (!req.session.usuario) {
		let usuario = await metodosUsuario.obtener_el_usuario_a_partir_del_email(req.cookies.email)
		if (usuario) {req.session.usuario = usuario}
	}
	// Graba a Locals los datos del usuario
	if (req.session.usuario && !res.locals.usuario) {
		res.locals.usuario = req.session.usuario;
	};
	next();
}
