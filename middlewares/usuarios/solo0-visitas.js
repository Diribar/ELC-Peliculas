"use strict";

module.exports = (req, res, next) => {
	if (req.session.usuario) return res.redirect(req.session.urlSinLogin);
	next();
};
