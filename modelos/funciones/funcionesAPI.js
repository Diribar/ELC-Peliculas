const TMDB_search = require("../API/1-TMDB-search");
const TMDB_details = require("../API/2-TMDB-details");

module.exports = {
	contador: (palabras_clave, rubro) => {
		return TMDB_search(palabras_clave, rubro)
			.then((n) => n.total_results);
	},

	buscarTitulos: async (palabras_clave, rubro) => {
		let entidades = await TMDB_search(palabras_clave, rubro);
		let colecciones = [];
		if (entidades.total_results > 0) {
			entidadesID = entidades.results.map((n) => n.id);
			for (n of entidadesID) {
				coleccion = await TMDB_details(n, rubro);
				colecciones.push(coleccion);
			}
		}
		return colecciones;
	},
};
