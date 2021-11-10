let procesarProd = require("../../funciones/Productos/2-Procesar");

module.exports = async (req, res, next) => {
	datosClaveProd = req.cookies.datosClaveProd;
	ruta = "/agregar/productos/ya-en-bd/?valor=";
	ELC_id = await procesarProd.obtenerELC_id(datosClaveProd);
	if (ELC_id) return res.redirect(ruta + ELC_id);
	next();
};
