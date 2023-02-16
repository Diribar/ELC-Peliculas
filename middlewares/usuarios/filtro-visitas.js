"use strict";
module.exports = (req, res, next) => {
	if (req.session.usuario) {
		delete req.session.usuario;
		res.clearCookie("email");
		return res.redirect(req.session.urlSinLogin);
	}
	next();
};
