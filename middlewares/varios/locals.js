"use strict";
module.exports = async (req, res, next) => {
	// Guarda localhost
	// if (!res.locals.localhost) res.locals.localhost = global.localhost;
	if (!res.locals.titulosImgDer) res.locals.titulosImgDer = global.titulosImgDer;

	// Fin
	next();
};
