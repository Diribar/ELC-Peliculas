let BD_varias = require("../../funciones/BD/varias");

module.exports = async (req, res, next) => {
	datosClaveProd = req.cookies.datosClaveProd;
	ELC_id = await BD_varias.obtenerELC_id(datosClaveProd);
	ruta = "/producto/agregar/ya-en-bd/?entidad=" + datosClaveProd.entidad + "valor=" + ELC_id;
	if (ELC_id) return res.redirect(ruta);
	next();
};
