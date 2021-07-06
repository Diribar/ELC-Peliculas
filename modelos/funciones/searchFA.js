const search_FA_Heroku = require("../API/1-search-FA-Heroku");
//const search_FA_Rapid = require("../API/1-search-FA-Rapid");

module.exports = {
	search: async (nombre_original, nombre_castellano, palabras_clave) => {
		let datos = [nombre_original, nombre_castellano, palabras_clave];
		for (let i = 0; i < datos.length; i++) {
			if (datos[i].length > 1) {
				lectura = await search_FA_Heroku(datos[i]);
				if (lectura.length > 0) {
					break;
				}
			}
		}
		return lectura;
	},
};
