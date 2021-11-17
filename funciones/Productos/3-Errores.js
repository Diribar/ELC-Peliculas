// ************ Requires ************
let procesarProd = require("./2-Procesar");

module.exports = {
	// ControllerAPI (validarPalabrasClave)
	palabrasClave: (dato) => {
		cartelCampoVacio = "Necesitamos que completes este campo";
		let errores = {};
		errores.palabrasClave = !dato
			? cartelCampoVacio
			: longitud(dato, 2, 50)
			? longitud(dato, 2, 50)
			: "";
		return errores;
	},

	// ControllerAPI (validarPalabrasClave)
	desambiguar: (dato) => {
		// Detectar si es una película, que pertenece a una colección y cuya colección no está en la BD
		if (dato.entidad_TMDB == "movie" && dato.en_coleccion && !dato.en_colec_id) {
			console.log("SI");
			errores = {
				// Datos originales
				peli_entidad_TMDB: "movie",
				peli_TMDB_id: dato.TMDB_id,
				// Datos nuevos
				colec_entidad_TMDB: "collection",
				colec_TMDB_id: dato.en_colec_TMDB_id,
				colec_nombre: dato.en_colec_nombre,
				hay: true,
			};
		} else errores = {hay: false};
		// Enviar el feedback
		return errores;
	},

	// ControllerAPI (validarCopiarFA)
	copiarFA: (datos) => {
		let errores = {};
		// Entidad
		errores.entidad = !datos.entidad ? "Elegí una opción" : "";
		// En colección
		errores.en_coleccion =
			!datos.en_coleccion && datos.entidad == "peliculas" ? "Elegí una opción" : "";
		// Dirección
		url = datos.direccion;
		errores.direccion = !url
			? cartelCampoVacio
			: !url.includes("www.filmaffinity.com/") ||
			  !(
					url.indexOf("www.filmaffinity.com/") + 21 < url.indexOf("/film") &&
					url.indexOf("/film") + 5 < url.indexOf(".html")
			  )
			? "No parece ser una dirección de Film Affinity"
			: "";
		// Avatar
		errores.avatar = !datos.avatar
			? "Necesitamos que agregues una imagen"
			: !datos.avatar.includes("pics.filmaffinity.com/")
			? "No parece ser una imagen de FilmAffinity"
			: !datos.avatar.includes("large.jpg")
			? "Necesitamos que consigas el link de la imagen grande"
			: "";
		// Contenido
		aux = datos.contenido ? procesarProd.contenidoFA(datos.contenido) : {};
		errores.contenido = !datos.contenido
			? cartelCampoVacio
			: !Object.keys(aux).length
			? "No se obtuvo ningún dato"
			: "";
		// Final
		errores.hay = hayErrores(errores);
		errores.campos = Object.keys(aux).length;
		return errores;
	},

	// ControllerAPI (validarDatosDuros)
	datosDuros: (datos, camposDD) => {
		// Averiguar cuáles son los campos a verificar
		if (datos.entidad) {
			camposAVerificar = camposDD.filter((n) => n[datos.entidad]).map((n) => n.campo);
		} else camposAVerificar = camposDD;
		// Comenzar con las revisiones
		let errores = {};
		// En colección
		errores.en_coleccion =
			!datos.en_coleccion && datos.entidad == "peliculas" && datos.fuente == "IM"
				? "Elegí una opción"
				: "";
		errores.nombre_original =
			camposAVerificar.indexOf("nombre_original") == -1
				? ""
				: !datos.nombre_original
				? cartelCampoVacio
				: longitud(datos.nombre_original, 2, 50)
				? longitud(datos.nombre_original, 2, 50)
				: castellano(datos.nombre_original)
				? cartelCastellano
				: "";
		errores.nombre_castellano =
			camposAVerificar.indexOf("nombre_castellano") == -1
				? ""
				: !datos.nombre_castellano
				? cartelCampoVacio
				: longitud(datos.nombre_castellano, 2, 50)
				? longitud(datos.nombre_castellano, 2, 50)
				: castellano(datos.nombre_castellano)
				? cartelCastellano
				: "";
		errores.ano_estreno =
			camposAVerificar.indexOf("ano_estreno") == -1
				? ""
				: !datos.ano_estreno
				? cartelCampoVacio
				: formatoAno(datos.ano_estreno)
				? "Debe ser un número de 4 dígitos"
				: datos.ano_estreno < 1900
				? "El año debe ser mayor a 1900"
				: datos.ano_estreno > new Date().getFullYear()
				? "El número no puede superar al año actual"
				: "";
		errores.ano_fin =
			camposAVerificar.indexOf("ano_fin") == -1
				? ""
				: !datos.ano_fin
				? cartelCampoVacio
				: formatoAno(datos.ano_fin)
				? "Debe ser un número de 4 dígitos"
				: datos.ano_fin < 1900
				? "El año debe ser mayor a 1900"
				: datos.ano_fin > new Date().getFullYear()
				? "El número no puede superar al año actual"
				: !errores.ano_estreno && datos.ano_estreno && datos.ano_estreno > datos.ano_fin
				? "El año de finalización debe ser igual o mayor que el año de estreno"
				: "";
		errores.duracion =
			camposAVerificar.indexOf("duracion") == -1
				? ""
				: !datos.duracion
				? cartelCampoVacio
				: formatoNumero(datos.duracion, 20)
				? formatoNumero(datos.duracion, 20)
				: datos.duracion > 300
				? "Debe ser un número menor"
				: "";
		errores.pais_id = !datos.pais_id ? cartelCampoVacio : "";
		errores.director =
			camposAVerificar.indexOf("director") == -1
				? ""
				: !datos.director
				? cartelCampoVacio
				: longitud(datos.director, 2, 100)
				? longitud(datos.director, 2, 100)
				: castellano(datos.director)
				? cartelCastellano
				: "";
		errores.guion =
			camposAVerificar.indexOf("guion") == -1
				? ""
				: !datos.guion
				? cartelCampoVacio
				: longitud(datos.guion, 2, 100)
				? longitud(datos.guion, 2, 100)
				: castellano(datos.guion)
				? cartelCastellano
				: "";
		errores.musica =
			camposAVerificar.indexOf("musica") == -1
				? ""
				: !datos.musica
				? cartelCampoVacio
				: longitud(datos.musica, 2, 100)
				? longitud(datos.musica, 2, 100)
				: castellano(datos.musica)
				? cartelCastellano
				: "";
		errores.actores =
			camposAVerificar.indexOf("actores") == -1
				? ""
				: !datos.actores
				? cartelCampoVacio
				: longitud(datos.actores, 2, 500)
				? longitud(datos.actores, 2, 500)
				: castellano(datos.actores)
				? cartelCastellano
				: "";
		errores.productor =
			camposAVerificar.indexOf("productor") == -1
				? ""
				: !datos.productor
				? cartelCampoVacio
				: longitud(datos.productor, 2, 100)
				? longitud(datos.productor, 2, 100)
				: castellano(datos.productor)
				? cartelCastellano
				: "";
		errores.sinopsis = !datos.sinopsis
			? cartelCampoVacio
			: longitud(datos.sinopsis, 15, 1000)
			? longitud(datos.sinopsis, 15, 1000)
			: castellano(datos.sinopsis)
			? cartelCastellano
			: "";
		errores.avatar = !datos.avatar
			? "Necesitamos que agregues una imagen"
			: extensiones(datos.avatar)
			? "Las extensiones de archivo válidas son jpg, png, gif, bmp"
			: "";
		errores.hay = hayErrores(errores);
		return errores;
	},

	// ControllerAPI (validarDatosPers)
	datosPers: (datos, camposDP) => {
		// Averiguar cuáles son los campos a verificar
		camposAVerificar = datos.entidad
			? camposDP.filter((n) => n[datos.entidad]).map((n) => n.campo)
			: camposDP;
		// Comenzar con las revisiones
		let errores = {};
		// Datos generales
		errores.en_castellano_id =
			camposAVerificar.indexOf("en_castellano_id") == -1
				? ""
				: !datos.en_castellano_id
				? cartelSelectVacio
				: "";
		errores.color =
			camposAVerificar.indexOf("color") == -1 ? "" : !datos.color ? cartelSelectVacio : "";
		errores.categoria_id =
			camposAVerificar.indexOf("categoria_id") == -1
				? ""
				: !datos.categoria_id
				? cartelSelectVacio
				: "";
		errores.subcategoria_id =
			camposAVerificar.indexOf("subcategoria_id") == -1
				? ""
				: !datos.subcategoria_id
				? cartelSelectVacio
				: "";
		errores.publico_sugerido_id =
			camposAVerificar.indexOf("publico_sugerido_id") == -1
				? ""
				: !datos.publico_sugerido_id
				? cartelSelectVacio
				: "";
		// Relación con la vida
		if (
			!datos.personaje_historico_id &&
			!datos.hecho_historico_id &&
			(datos.subcategoria_id == 4 || datos.subcategoria_id == 5 || datos.subcategoria_id == 9)
		) {
			errores.personaje_historico_id = relacionConLaVidaVacio;
			errores.hecho_historico_id = relacionConLaVidaVacio;
		}
		// Links gratuitos
		errores.link_trailer =
			camposAVerificar.indexOf("link_trailer") == -1
				? ""
				: !datos.link_trailer
				? ""
				: !validarFuente(datos.link_trailer)
				? "Debe ser de una fuente confiable"
				: "";
		errores.link_pelicula =
			camposAVerificar.indexOf("link_pelicula") == -1
				? ""
				: !datos.link_pelicula
				? ""
				: !validarFuente(datos.link_pelicula)
				? "Debe ser de una fuente confiable"
				: "";
		// Tu calificación
		errores.fe_valores_id =
			camposAVerificar.indexOf("fe_valores_id") == -1
				? ""
				: !datos.fe_valores_id
				? cartelSelectVacio
				: "";
		errores.entretiene_id =
			camposAVerificar.indexOf("entretiene_id") == -1
				? ""
				: !datos.entretiene_id
				? cartelSelectVacio
				: "";
		errores.calidad_tecnica_id =
			camposAVerificar.indexOf("calidad_tecnica_id") == -1
				? ""
				: !datos.calidad_tecnica_id
				? cartelSelectVacio
				: "";
		errores.hay = hayErrores(errores);
		return errores;
	},
};

// Variables **************************
let cartelCampoVacio = "Necesitamos que completes esta información";
let cartelCastellano =
	"Sólo se admiten letras del abecedario castellano, y la primera letra debe ser en mayúscula";
let cartelSelectVacio = "Necesitamos que elijas una opción";
let relacionConLaVidaVacio =
	"Necesitamos que elijas una opción en alguno de estos dos campos o en ambos";

let longitud = (dato, corto, largo) => {
	return dato.length < corto
		? "El contenido debe ser más largo"
		: dato.length > largo
		? "El contenido debe ser más corto"
		: "";
};
let castellano = (dato) => {
	formato = /^[A-Z][A-ZÁÉÍÓÚÜÑa-z ,.:;…"°áéíóúüñ'¿?¡!/()\d+-]+$/;
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
let hayErrores = (errores) => {
	resultado = false;
	valores = Object.values(errores);
	for (valor of valores) {
		valor ? (resultado = true) : "";
	}
	return resultado;
};
let validarFuente = (link) => {
	aux = link.indexOf("youtube.com/watch");
	return aux >= 0 && aux <= 12;
};
