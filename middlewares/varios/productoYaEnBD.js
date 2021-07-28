const funciones = require("../../modelos/funcionesVarias");

module.exports = async (req, res, next) => {
	let [TMDB_rep, FA_rep] = await funciones.productoYaEnBD(req.cookies);
	//console.log([TMDB_rep, FA_rep]);
	if (TMDB_rep || FA_rep) return res.redirect("/peliculas/agregar/ya-en-bd")
	next();
};
