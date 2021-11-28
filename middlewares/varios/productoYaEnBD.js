let BD_varias = require("../../funciones/BD/varias");

module.exports = async (req, res, next) => {
	datosClaveProd = req.cookies.datosClaveProd;
	datos = {
		entidad: datosClaveProd.entidad,
		campo: datosClaveProd.fuente + "_id",
		valor: datosClaveProd[datosClaveProd.fuente + "_id"],
	};
	ELC_id = await BD_varias.obtenerELC_id(datos);
	ruta = "/producto/agregar/ya-en-bd/?entidad=" + datosClaveProd.entidad + "valor=" + ELC_id;
	if (ELC_id) return res.redirect(ruta);
	next();
};
