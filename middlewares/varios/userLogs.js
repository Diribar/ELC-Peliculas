const funciones = require("../../funciones/varias/funcionesVarias");

module.exports = (req, res, next) => {
	funciones.userLogs(req, res)
	next();
};