// ************ Requires ************
const API_key = "e90d1beb11c74cdf9852d97a354a6d45";
const fetch = require("node-fetch");

module.exports = async (ID, rubro) => {
	// PARTES DEL URL
	// "https://api.themoviedb.org/3/movie/     399049?api_key=e90d1beb11c74cdf9852d97a354a6d45&language=es"
	// "https://api.themoviedb.org/3/collection/97919?api_key=e90d1beb11c74cdf9852d97a354a6d45&language=es"
	// "https://api.themoviedb.org/3/tv/        61865?api_key=e90d1beb11c74cdf9852d97a354a6d45&language=es"
	let A_prefijoRubro = "https://api.themoviedb.org/3/";
	let B_rubro = rubro;
	let C_prefijoID = "/";
	let D_ID = ID;
	let E_prefijoClave = "?api_key=";
	let F_clave = API_key;
	let G_idioma = "&language=es";
	let url =
		A_prefijoRubro +
		B_rubro +
		C_prefijoID +
		D_ID +
		E_prefijoClave +
		F_clave +
		G_idioma;
	// BUSCAR LA INFO
	let resultado = await fetch(url).then((n) => n.json());
	return resultado;
};
