let procesarProd = require("../../funciones/Productos/2-PROD-procesar");

module.exports = async (req, res, next) => {
	ELC_id = await procesarProd.obtenerELC_id({
		rubroAPI: req.cookies.rubroAPI,
		campo: "tmdb_id",
		id: req.cookies.tmdb_id,
	});
	if (ELC_id) return res.redirect("/productos/agregar/ya-en-bd");
	ELC_id = await procesarProd.obtenerELC_id({
		rubroAPI: req.cookies.rubroAPI,
		campo: "fa_id",
		id: req.cookies.fa_id,
	});
	if (ELC_id) return res.redirect("/productos/agregar/ya-en-bd");
	next();
};
