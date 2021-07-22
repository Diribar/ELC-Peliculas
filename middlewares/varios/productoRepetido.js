const funciones = require("../../modelos/funciones");

module.exports = async (req, res, next) => {
	let [TMDB_rep, FA_rep] = await funciones.productoRepetido(req.cookies);
	//console.log([TMDB_rep, FA_rep]);
	if (TMDB_rep || FA_rep) return res.redirect("/peliculas/repetido")
	next();
};
