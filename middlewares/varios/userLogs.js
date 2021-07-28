const funciones = require("../../modelos/funcionesVarias");

module.exports = (req, res, next) => {
	funciones.userLogs(req, res)
	next();
};