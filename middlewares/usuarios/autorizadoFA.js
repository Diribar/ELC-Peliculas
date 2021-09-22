const path = require("path");
const BD = require(path.join(__dirname,"../../modelos/base_de_datos/BD_usuarios"));

module.exports = (req, res, next) => {
	if (!BD.autorizadoFA(req.session.usuario.id)) {
		return res.redirect("/peliculas/agregar/palabras_clave");
	}
	next();
};
