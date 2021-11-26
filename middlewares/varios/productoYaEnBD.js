let procesarProd = require("../../funciones/Productos/2-Procesar");

module.exports = async (req, res, next) => {
	datosClaveProd = req.cookies.datosClaveProd;
	ELC_id = await procesarProd.obtenerELC_id(datosClaveProd);
	ruta = "/producto/agregar/ya-en-bd/?entidad=" + datosClaveProd.entidad + "valor=" + ELC_id;
	if (ELC_id) return res.redirect(ruta);
	next();
};
