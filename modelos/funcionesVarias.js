// **** Requires ***********
const nodemailer = require("nodemailer");
const BD_peliculas = require("./base_de_datos/BD_peliculas");
const BD_colecciones = require("./base_de_datos/BD_colecciones");

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
		res.locals.urlReferencia = req.session.urlReferencia
			? req.session.urlReferencia
			: "/";
		//console.log(res.locals.urlReferencia);
	},

	procesarContenidoFA: (contenido) => {
		// Limpiar espacios innecesarios
		for (let i = 0; i < contenido.length; i++) {
			contenido[i] = contenido[i].trim();
		}
		// Armar el objeto literal
		let resultado = {};
		contenido.indexOf("Ficha") > 0
			? (resultado.nombre_castellano = funcionParentesis(
					contenido[contenido.indexOf("Ficha") - 1]
			  ))
			: "";
		contenido.indexOf("Título original") > 0
			? (resultado.nombre_original = funcionParentesis(
					contenido[contenido.indexOf("Título original") + 1]
			  ))
			: "";
		contenido.indexOf("Año") > 0
			? (resultado.ano_estreno = parseInt(
					contenido[contenido.indexOf("Año") + 1]
			  ))
			: "";
		if (contenido.indexOf("Duración") > 0) {
			let duracion = contenido[contenido.indexOf("Duración") + 1];
			resultado.duracion = parseInt(
				duracion.slice(0, duracion.indexOf(" "))
			);
		}
		if (contenido.indexOf("País") > 0) {
			let pais_nombre = contenido[contenido.indexOf("País") + 1];
			resultado.pais_nombre = pais_nombre.slice(
				(pais_nombre.length + 1) / 2
			);
		}
		contenido.indexOf("Dirección") > 0
			? (resultado.director =
					contenido[contenido.indexOf("Dirección") + 1])
			: "";
		contenido.indexOf("Guion") > 0
			? (resultado.guion = contenido[contenido.indexOf("Guion") + 1])
			: "";
		contenido.indexOf("Música") > 0
			? (resultado.musica = contenido[contenido.indexOf("Música") + 1])
			: "";
		contenido.indexOf("Reparto") > 0
			? (resultado.actores = contenido[contenido.indexOf("Reparto") + 1])
			: "";
		contenido.indexOf("Productora") > 0
			? (resultado.productor =
					contenido[contenido.indexOf("Productora") + 1])
			: "";
		if (contenido.indexOf("Sinopsis") > 0) {
			aux = contenido[contenido.indexOf("Sinopsis") + 1];
			!aux.includes("(FILMAFFINITY)")
				? (aux = aux + " (FILMAFFINITY)")
				: "";
			resultado.sinopsis = aux.replace(/"/g, "'");
		}
		// Enviar la información
		return resultado;
	},

	productoYaEnBD: async (datos) => {
		// Definir variables
		rubroAPI = datos.rubroAPI;
		tmdb_id = datos.tmdb_id;
		fa_id = datos.fa_id;
		// Verificar YaEnBD
		yaEnBD = await AveriguarSiYaEnBD(rubroAPI, tmdb_id, fa_id);
		if (!!tmdb_id) {
			TMDB_yaEnBD = yaEnBD;
			FA_yaEnBD = "";
		} else {
			TMDB_yaEnBD = "";
			FA_yaEnBD = yaEnBD;
		}
		//console.log([TMDB_YaEnBD, FA_YaEnBD]);
		// Enviar el resultado
		return [TMDB_yaEnBD, FA_yaEnBD];
	},

	enviarMail: async (asunto, mail, comentario) => {
		// create reusable transporter object using the default SMTP transport
		let transporter = nodemailer.createTransport({
			host: "smtp.gmail.com",
			port: 465,
			secure: true, // true for 465, false for other ports
			auth: {
				user: "mensaje.web.01@gmail.com", // generated mail address
				pass: "rudhfurovpjsjjzp", // generated  password
			},
		});
		datos = {
			from: '"Mensaje de la página web" <mensaje.web.01@gmail.com>', // sender address
			//to: mail,
			to: "diegoiribarren2015@gmail.com",
			subject: asunto, // Subject line
			text: comentario, // plain text body
			html: comentario.replace(/\r/g, "<br>").replace(/\n/g, "<br>"),
		};
		await transporter.sendMail(datos);
	},
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

let funcionParentesis = (dato) => {
	desde = dato.indexOf(" (");
	hasta = dato.indexOf(")");
	return desde > 0 ? dato.slice(0, desde) + dato.slice(hasta + 1) : "";
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
