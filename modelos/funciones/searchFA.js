const details_Heroku = require("../API/2-details-FA (Heroku)");
//const search_FA_Rapid = require("../API/1-search-FA-Rapid");

module.exports = {
	detail: async (nombre_original, nombre_castellano, palabras_clave) => {
		let datos = [nombre_original, nombre_castellano, palabras_clave];
		let lectura = []
		for (let i = 0; i < datos.length; i++) {
			if (datos[i].length > 1) {
				dato = letrasIngles(datos[2]);
				console.log(dato)
				lectura = await search_FA_Heroku(dato);
				console.log(lectura)
				if (lectura.length > 0) {
					break;
				}
			}
		}
		return lectura;
	},
};

let letrasIngles = (palabra) => {
	let word = palabra
		.toLowerCase()
		.replace(/-/g, " ")
		.replace(/á/g, "a")
		.replace(/é/g, "e")
		.replace(/í/g, "i")
		.replace(/ó/g, "o")
		.replace(/ú/g, "u")
		.replace(/ü/g, "u")
		.replace(/ñ/g, "n")
		.replace(/:/g, "")
		.replace(/¿/g, "")
		.replace(/[?]/g, "")
		.replace(/!/g, "");

	return word;
};
