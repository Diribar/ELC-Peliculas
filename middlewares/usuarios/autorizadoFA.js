const path = require("path");
const BD = require(path.join(__dirname,"../../funciones/BD/usuarios"));

module.exports = (req, res, next) => {
	if (!BD.obtenerAutorizadoFA(req.session.usuario.id)) {
		return res.redirect("/peliculas/agregar/palabras-clave");
	}
	next();
};
