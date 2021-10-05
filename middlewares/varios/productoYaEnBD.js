let procesarProd = require("../../funciones/PROD-procesar");

module.exports = async (req, res, next) => {
	let [TMDB_rep, FA_rep] = await procesarProd.obtenerELC_id(req.cookies);
	if (TMDB_rep || FA_rep) return res.redirect("/peliculas/agregar/ya-en-bd")
	next();
};
