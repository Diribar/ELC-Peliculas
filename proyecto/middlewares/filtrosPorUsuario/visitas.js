"use strict";
module.exports = (req, res, next) => {
	// Desloguea al usuario
	if (req.session.usuario) {
		delete req.session.usuario;
		res.clearCookie("email");
	}
	
	// Fin
	next();
};
