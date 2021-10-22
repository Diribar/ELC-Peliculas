let procesarProd = require("../../funciones/Productos/2-PROD-procesar");

module.exports = async (req, res, next) => {
	rubroAPI = req.cookies.rubroAPI;
	campo = rubroAPI == "movie" ? "peli_tmdb_id" : "colec_tmdb_id";
	ruta = "/productos/agregar/ya-en-bd/?id=";
	ELC_id = await procesarProd.obtenerELC_id({
		rubroAPI: rubroAPI,
		campo: campo,
		id: req.cookies[campo],
	});
	if (ELC_id) return res.redirect(ruta + ELC_id);
	campo = rubroAPI == "movie" ? "peli_fa_id" : "colec_fa_id";
	ELC_id = await procesarProd.obtenerELC_id({
		rubroAPI: req.cookies.rubroAPI,
		campo: campo,
		id: req.cookies[campo],
	});
	if (ELC_id) return res.redirect(ruta + ELC_id);
	next();
};
