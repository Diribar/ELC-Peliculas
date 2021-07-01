const funciones = require("../../modelos/funciones/funciones");

module.exports = (req, res, next) => {
	funciones.userLogs(req, res)
	next();
};