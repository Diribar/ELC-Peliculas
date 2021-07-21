const details_TMDB = require("./details_TMDB_fetch");

module.exports = {
	API: async (id, rubroAPI) => {
		let lectura = await details_TMDB(id, rubroAPI);
		return lectura;
	},

	procesarPelicula: async (id, rubroAPI) => {},

	procesarTV: async (id, rubroAPI) => {},

	procesarColeccion: async (id, rubroAPI) => {},
};

// let resultado = {
// tmdb_id: id,
// };
// res.cookie("fuente", req.body.fuente, { maxAge: 60 * 60 * 1000 });
