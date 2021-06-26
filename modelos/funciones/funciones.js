const funcionesAPI = require("./funcionesAPI");

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
		buscar[0] = await funcionesAPI.searchTMDB(palabras_clave);
		let datos = {
			palabras_clave: palabras_clave,
			resultados: buscar[0].resultados,
			masDe20: buscar[0].masDe20,
			menor: Math.max(buscar[0].resultados.length, 0),
			mayor: buscar[0].resultados.length + 0,
		};
		return datos;
	},
};
