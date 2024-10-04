"use strict";

module.exports = async (req, res, next) => {
	// Impide que fake GETs avancen
	if (!req.headers["user-agent"]) return;
	else next();
};
