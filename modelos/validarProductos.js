// **** Requires ***********
const nodemailer = require("nodemailer");
const BD_peliculas = require("./base_de_datos/BD_peliculas");
const BD_colecciones = require("./base_de_datos/BD_colecciones");

module.exports = {
	validarDatosDuros: (datos) => {
		cartelCampoVacio = "Tenés que completar este campo"
		cartelCastellano = "Sólo se admiten letras del abecedario castellano";
		let errores = {};
		errores.nombre_original = campoVacio(datos.nombre_original)
			? cartelCampoVacio
			: longitud(datos.nombre_original, 2, 50)
			? longitud(datos.nombre_original, 2, 50)
			: castellano(datos.nombre_original)
			? cartelCastellano
			: AveriguarSiYaEnBD(castellano(datos.nombre_original))
			? "El título original ya está en nuestra base de datos"
			: "";
		errores.nombre_castellano = ""
		errores.ano_estreno = ""
		errores.duracion = ""
		errores.pais_id = ""
		errores.director =""
		errores.guion = ""
		errores.musica = ""
		errores.actores=""
		errores.productor=""
		errores.avatar=""
		return errores
	},
};

let AveriguarSiYaEnBD = async (rubroAPI, tmdb_id, fa_id) => {
	// La respuesta se espera que sea 'true' or 'false'
	if (!rubroAPI || (!tmdb_id && !fa_id)) return false;
	let parametro = tmdb_id != null ? "tmdb_id" : "fa_id";
	let id = tmdb_id != null ? tmdb_id : fa_id;
	return rubroAPI == "movie"
		? await BD_peliculas.AveriguarSiYaEnBD(parametro, id)
		: await BD_colecciones.AveriguarSiYaEnBD(parametro, id);
};

let campoVacio = (dato) => {
	return dato == "" || dato == null || dato == undefined
};

let longitud = (dato, corto, largo) => {
	return dato.length < corto
		? "El nombre debe ser más largo"
		: dato.length > largo
		? "El nombre debe ser más corto"
		: "";
};

let castellano = (dato) => {
	formato = /^[A-Z][A-ZÁÉÍÓÚÜÑa-z ,.áéíóúüñ/()\d+-]+$/;
	return !formato.test(dato)
};
