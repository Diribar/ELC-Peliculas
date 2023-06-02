"use strict";
module.exports = (req, res, next) => {
	if (req.session.usuario) {
		delete req.session.usuario;
		res.clearCookie("email");
		console.log(6);
	}
	else next();
};
