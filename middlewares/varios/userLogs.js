const funciones = require("../../funciones/Varias/varias");

module.exports = (req, res, next) => {
	funciones.userLogs(req, res)
	next();
};