const searchTMDB = require("./searchTMDB");

module.exports = {
	userLogs: (req, res) => {
		let URL = req.originalUrl;
		let hasta =
			URL.slice(1).indexOf("/") > 0
				? URL.slice(1).indexOf("/") + 1
				: URL.length;
		let tema = URL.slice(1, hasta);
		tema != "login" && tema != "usuarios"
			? (req.session.urlReferencia = URL)
			: "";
		res.locals.urlReferencia = req.session.urlReferencia;
	},

	search: async (palabras_clave) => {
		let buscar = await searchTMDB.searchTMDB(palabras_clave);
		let datos = {
			palabras_clave: palabras_clave,
			hayMas: buscar.hayMas,
			cantResultados: buscar.resultados.length,
			cantPaginasAPI: buscar.cantPaginasAPI,
			cantPaginasUsadas: buscar.cantPaginasUsadas,
			resultados: buscar.resultados,
		};
		return datos;
	},
};
