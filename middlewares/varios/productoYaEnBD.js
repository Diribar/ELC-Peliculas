let BD_varias = require("../../funciones/BD/varias");

module.exports = async (req, res, next) => {
	datosTerminaste = req.session.datosTerminaste
		? req.session.datosTerminaste
		: req.cookies.datosTerminaste
		? req.cookies.datosTerminaste
		: "";
	if (datosTerminaste != "" && datosTerminaste.fuente != "IM") {
		datos = {
			entidad: datosTerminaste.entidad,
			campo: datosTerminaste.fuente + "_id",
			valor: datosTerminaste[datosTerminaste.fuente + "_id"],
		};
		ELC_id = await BD_varias.obtenerELC_id(datos);
		ruta = "/producto/agregar/ya-en-bd/?entidad=" + datosTerminaste.entidad + "valor=" + ELC_id;
		if (ELC_id) return res.redirect(ruta);
	}
	next();
};
