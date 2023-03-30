"use strict";
module.exports = async (req, res, next) => {
	// Guarda localhost
	// if (!res.locals.localhost) res.locals.localhost = global.localhost;
	// if (!res.locals.TitulosImgDer) res.locals.TitulosImgDer = global.TitulosImgDer;

	// Fin
	next();
};
