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
		let buscar = [{}];
		buscar[0] = await searchTMDB.searchTMDB(palabras_clave);
		let datos = {
			palabras_clave: palabras_clave,
			hayMas: buscar[0].hayMas,
			cantResultados: buscar[0].resultados.length,
			resultados: buscar[0].resultados,
			cantPaginasAPI: buscar[0].cantPaginasAPI,
		};
		return datos;
	},
};
