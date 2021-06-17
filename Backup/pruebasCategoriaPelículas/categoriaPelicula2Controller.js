// ************ Requires ************
const path = require('path');
const metodosPelicula = require(path.join(__dirname, "../../modelos/BD_peliculas"));
const metodosOtros = require(path.join(__dirname, "../../modelos/BD_varios"));

// *********** Controlador ***********
module.exports = {

	listado: async (req,res) => {
		//let categoria = await metodosOtros.obtenerPorId("CFC", "categoria", "peliculas")
		//return res.send(categoria.peliculas[0].titulo_castellano)

		let peli = await metodosPelicula.obtenerPorId(1);
		return res.send(peli.categoria.nombre)
	},
};
