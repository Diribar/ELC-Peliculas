const funciones = require("../../funciones/funcionesVarias");

module.exports = (req, res, next) => {
	funciones.userLogs(req, res)
	next();
};