"use strict";

module.exports = (req, res, next) => {
	console.log(4, req.session.usuario);
	if (req.session.usuario) return res.redirect(req.session.urlSinLogin);
	next();
};
