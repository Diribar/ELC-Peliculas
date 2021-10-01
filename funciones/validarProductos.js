// **** Requires ***********
const BD_peliculas = require("./BD/peliculas");
const BD_colecciones = require("./BD/colecciones");

module.exports = {
	palabrasClave: (dato) => {
		cartelCampoVacio = "Necesitamos que completes este campo";
		let errores = {};
		errores.palabras_clave = campoVacio(dato)
			? cartelCampoVacio
			: longitud(dato, 2, 20)
			? longitud(dato, 2, 20)
			: "";
		return errores;
	},

	datosDuros: async (datos) => {
		cartelCampoVacio = "Necesitamos que completes este campo";
		cartelCastellano =
			"Sólo se admiten letras del abecedario castellano, y la primera letra debe ser en mayúscula";
		let errores = {};
		errores.nombre_original = campoVacio(datos.nombre_original)
			? cartelCampoVacio
			: longitud(datos.nombre_original, 2, 50)
			? longitud(datos.nombre_original, 2, 50)
			: castellano(datos.nombre_original)
			? cartelCastellano
			: (await AveriguarSiYaEnBD(
					datos.rubroAPI,
					datos.tmdb_id,
					datos.fa_id
			  ))
			? "El título original ya está en nuestra base de datos"
			: "";
		errores.nombre_castellano = campoVacio(datos.nombre_castellano)
			? cartelCampoVacio
			: longitud(datos.nombre_castellano, 2, 50)
			? longitud(datos.nombre_castellano, 2, 50)
			: castellano(datos.nombre_castellano)
			? cartelCastellano
			: "";
		errores.ano_estreno = campoVacio(datos.ano_estreno)
			? cartelCampoVacio
			: formatoAno(datos.ano_estreno)
			? "Debe ser un número de 4 dígitos"
			: datos.ano_estreno < 1900
			? "El año debe ser mayor a 1900"
			: datos.ano_estreno > new Date().getFullYear()
			? "El número no puede superar al año actual"
			: "";
		errores.duracion = campoVacio(datos.duracion, 20)
			? cartelCampoVacio
			: formatoNumero(datos.duracion, 20)
			? formatoNumero(datos.duracion, 20)
			: datos.duracion > 300
			? "Debe ser un número menor"
			: "";
		errores.pais_id = campoVacio(datos.pais_id) ? cartelCampoVacio : "";
		errores.director = campoVacio(datos.director)
			? cartelCampoVacio
			: longitud(datos.director, 2, 50)
			? longitud(datos.director, 2, 50)
			: castellano(datos.director)
			? cartelCastellano
			: "";
		errores.guion = campoVacio(datos.guion)
			? cartelCampoVacio
			: longitud(datos.guion, 2, 50)
			? longitud(datos.guion, 2, 50)
			: castellano(datos.guion)
			? cartelCastellano
			: "";
		errores.musica = campoVacio(datos.musica)
			? cartelCampoVacio
			: longitud(datos.musica, 2, 50)
			? longitud(datos.musica, 2, 50)
			: castellano(datos.musica)
			? cartelCastellano
			: "";
		errores.actores = campoVacio(datos.actores)
			? cartelCampoVacio
			: longitud(datos.actores, 2, 500)
			? longitud(datos.actores, 2, 500)
			: castellano(datos.actores)
			? cartelCastellano
			: "";
		errores.productor = campoVacio(datos.productor)
			? cartelCampoVacio
			: longitud(datos.productor, 2, 100)
			? longitud(datos.productor, 2, 100)
			: castellano(datos.productor)
			? cartelCastellano
			: "";
		errores.avatar =
			datos.avatar == "/imagenes/0-Base/Agregá una imagen.jpg"
				? "Necesitamos que agregues una imagen"
				: extensiones(datos.avatar)
				? "Las extensiones de archivo válidas son jpg, png, gif, bmp"
				: "";
		return errores;
	},
};

let AveriguarSiYaEnBD = async (rubroAPI, tmdb_id, fa_id) => {
	// La respuesta se espera que sea 'true' or 'false'
	if (!rubroAPI || (!tmdb_id && !fa_id)) return false;
	let parametro = tmdb_id != null ? "tmdb_id" : "fa_id";
	let id = tmdb_id != null ? tmdb_id : fa_id;
	return rubroAPI == "movie"
		? await BD_peliculas.ObtenerELC_id(parametro, id)
		: await BD_colecciones.ObtenerELC_id(parametro, id);
};
let campoVacio = (dato) => {
	return dato == "" || dato == null || dato == undefined || dato == 0;
};
let longitud = (dato, corto, largo) => {
	return dato.length < corto
		? "El nombre debe ser más largo"
		: dato.length > largo
		? "El nombre debe ser más corto"
		: "";
};
let castellano = (dato) => {
	formato = /^[A-Z][A-ZÁÉÍÓÚÜÑa-z ,.:áéíóúüñ'/()\d+-]+$/;
	return !formato.test(dato);
};
let formatoAno = (dato) => {
	formato = /^\d{4}$/;
	return !formato.test(dato);
};
let formatoNumero = (dato, minimo) => {
	formato = /^\d+$/;
	return !formato.test(dato)
		? "Debe ser un número"
		: dato < minimo
		? "Debe ser un número mayor a " + minimo
		: "";
};

let extensiones = (nombre) => {
	if (!nombre) return false;
	ext = nombre.slice(nombre.length - 4);
	return ![".jpg", ".png", ".gif", ".bmp"].includes(ext);
};
