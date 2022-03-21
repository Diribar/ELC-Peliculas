"use strict";
const varias = require("../../funciones/Varias/varias");

module.exports = (req, res, next) => {
	varias.userLogs(req, res)
	next();
};