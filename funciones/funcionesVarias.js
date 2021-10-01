// **** Requires ***********
let nodemailer = require("nodemailer");
let BD_peliculas = require("./BD/peliculas");
let BD_colecciones = require("./BD/colecciones");

module.exports = {
	obtenerFA_id: (url) => {
		// Obtener el FA_id a partir de la dirección
		aux = url.indexOf("www.filmaffinity.com/");
		if (aux < 0) return false;
		url = url.slice(aux + 21);
		aux = url.indexOf("/");
		if (aux < 0) return false;
		url = url.slice(aux + 5);
		aux = url.indexOf(".html");
		if (aux < 0) return false;
		url = url.slice(0, aux);
		fa_id = url;
		return fa_id;
	},

	obtenerELC_id: async (datos) => {
		// Definir variables
		rubroAPI = datos.rubroAPI;
		tmdb_id = datos.tmdb_id;
		fa_id = datos.fa_id;
		// Verificar YaEnBD
		TMDB_yaEnBD = !!tmdb_id
			? await RutinaELC_id(rubroAPI, "TMDB", tmdb_id)
			: "";
		FA_yaEnBD = !!fa_id ? await RutinaELC_id(rubroAPI, "FA", fa_id) : "";
		//console.log([TMDB_YaEnBD, FA_YaEnBD]);
		// Enviar el resultado
		return [TMDB_yaEnBD, FA_yaEnBD];
	},

	validarImagenFA: (url) => {
		//renacidos_el_padre_pio_cambio_sus_vidas-850279707-large.jpg
		aux = url.indexOf("pics.filmaffinity.com/");
		if (aux < 0) return "No parece ser una imagen de FilmAffinity";
		url = url.slice(aux + 22);
		aux = url.indexOf("large.jpg");
		if (aux < 0) return "Necesitamos que consigas el link de la imagen grande"
		return "";
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
};

let RutinaELC_id = async (rubroAPI, fuente, id) => {
	// La respuesta se espera que sea 'true' or 'false'
	if (!rubroAPI || !id) return false;
	let parametro = fuente == "TMDB" ? "tmdb_id" : "fa_id";
	let resultado =
		rubroAPI == "movie"
			? await BD_peliculas.ObtenerELC_id(parametro, id)
			: await BD_colecciones.ObtenerELC_id(parametro, id);
	return resultado;
};
let funcionParentesis = (dato) => {
	desde = dato.indexOf(" (");
	hasta = dato.indexOf(")");
	return desde > 0 ? dato.slice(0, desde) + dato.slice(hasta + 1) : dato;
};
