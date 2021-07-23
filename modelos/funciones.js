const BD_peliculas = require("./bases_de_datos/BD_peliculas");
const BD_colecciones = require("./bases_de_datos/BD_colecciones");

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

	procesarTextareaFA: (contenido) => {
		// Limpiar espacios innecesarios
		for (let i = 0; i < contenido.length; i++) {
			contenido[i] = contenido[i].trim();
		}
		// Armar el objeto literal
		let resultado = {};
		resultado.nombre_castellano = contenido[contenido.indexOf("Ficha") - 1];
		resultado.nombre_original =
			contenido[contenido.indexOf("Título original") + 1];
		resultado.ano_estreno = parseInt(
			contenido[contenido.indexOf("Año") + 1]
		);
		let duracion = contenido[contenido.indexOf("Duración") + 1];
		resultado.duracion = parseInt(duracion.slice(0, duracion.indexOf(" ")));
		let pais_nombre = contenido[contenido.indexOf("País") + 1];
		resultado.pais_nombre = pais_nombre.slice((pais_nombre.length + 1) / 2);
		resultado.director = contenido[contenido.indexOf("Dirección") + 1];
		resultado.musica = contenido[contenido.indexOf("Música") + 1];
		resultado.actores = contenido[contenido.indexOf("Reparto") + 1];
		resultado.productor = contenido[contenido.indexOf("Productora") + 1];
		resultado.sinopsis = contenido[contenido.indexOf("Sinopsis") + 1];
		return resultado;
	},

	productoRepetido: async (datos) => {
		// Definir variables
		rubroAPI = datos.rubroAPI;
		tmdb_id = datos.tmdb_id;
		fa_id = datos.fa_id;
		// Verificar repetidos
		TMDB_repetido = !!tmdb_id ? await verificarRepetidos(rubroAPI, "TMDB", tmdb_id) : "";
		FA_repetido = !!fa_id ? await verificarRepetidos(rubroAPI, "FA", fa_id) : "";
		//console.log([TMDB_repetido, FA_repetido]);
		// Enviar el resultado
		return [TMDB_repetido, FA_repetido];
	},
};

const verificarRepetidos = async (rubroAPI, fuente, id) => {
	// La respuesta se espera que sea 'true' or 'false'
	if (!rubroAPI || !id) return false;
	let parametro = (fuente == "TMDB") ? "tmdb_id" : "fa_id"
	let resultado = (rubroAPI == "movie")
		? await BD_peliculas.AveriguarSiYaExiste(parametro, id)
		: await BD_colecciones.AveriguarSiYaExiste(parametro, id);
	return resultado
};
