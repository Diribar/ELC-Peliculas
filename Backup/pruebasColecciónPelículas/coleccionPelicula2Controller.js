// ************ Requires ************
const path = require('path');
const metodosPelicula = require(path.join(__dirname, "../../modelos/BD_peliculas"));
const metodosOtros = require(path.join(__dirname, "../../modelos/BD_varios"));

// *********** Controlador ***********
module.exports = {

	listado: async (req,res) => {
		let peli = await metodosPelicula.obtenerPorId(1)
		let coleccion_peli = await metodosOtros.obtenerPorId(1, "coleccion_pelicula", "coleccion_titulo")
		// return res.send(coleccion_peli)
		return res.render("./coleccionPelicula3Vista", {peli, coleccion_peli})
	},
};
