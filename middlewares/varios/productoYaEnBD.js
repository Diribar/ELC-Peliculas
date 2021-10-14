let procesarProd = require("../../funciones/Productos/2-PROD-procesar");

module.exports = async (req, res, next) => {
	let [TMDB_rep, FA_rep] = await procesarProd.obtenerELC_id(req.cookies);
	if (TMDB_rep || FA_rep) return res.redirect("/productos/agregar/ya-en-bd")
	next();
};
