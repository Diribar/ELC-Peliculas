const funciones = require("../../modelos/funciones");

module.exports = (req, res, next) => {
	funciones.userLogs(req, res)
	next();
};