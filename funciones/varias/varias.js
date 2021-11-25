// **** Requires ***********
let nodemailer = require("nodemailer");
let BD_varias = require("../BD/varias");
let fs = require("fs");

module.exports = {
	userLogs: (req, res) => {
		let URL = req.originalUrl;
		let hasta = URL.slice(1).indexOf("/") > 0 ? URL.slice(1).indexOf("/") + 1 : URL.length;
		let tema = URL.slice(1, hasta);
		tema != "login" && tema != "usuarios" ? (req.session.urlReferencia = URL) : "";
		res.locals.urlReferencia = req.session.urlReferencia ? req.session.urlReferencia : "/";
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

	pais_idToNombre: async (pais_id) => {
		// Función para convertir 'string de ID' en  'string de nombres'
		let resultado = [];
		if (pais_id.length) {
			BD_paises = await BD_varias.obtenerTodos("paises", "nombre");
			pais_idArray = pais_id.split(", ");
			// Convertir 'array de ID' en 'string de nombres"
			for (pais_id of pais_idArray) {
				aux = BD_paises.find((n) => n.id == pais_id);
				aux ? resultado.push(aux.nombre) : "";
			}
		}
		resultado = resultado.length ? resultado.join(", ") : "";
		return resultado;
	},

	paisNombreToId: async function (pais_nombre) {
		// Función para convertir 'string de nombre' en  'string de ID'
		let resultado = [];
		if (pais_nombre.length) {
			BD_paises = await BD_varias.obtenerTodos("paises", "nombre");
			pais_nombreArray = pais_nombre.split(", ");
			// Convertir 'array de nombres' en 'string de ID"
			for (pais_nombre of pais_nombreArray) {
				aux = BD_paises.find((n) => n.nombre == pais_nombre);
				aux ? resultado.push(aux.id) : "";
			}
		}
		resultado = resultado.length ? resultado.join(", ") : "";
		return resultado;
	},

	convertirLetrasAlCastellano: (resultado) => {
		campos = Object.keys(resultado);
		valores = Object.values(resultado);
		for (let i = 0; i < campos.length; i++) {
			if (typeof valores[i] == "string") {
				resultado[campos[i]] = valores[i]
					.replace(/[ÀÂÃÄÅĀĂĄ]/g, "A")
					.replace(/[àâãäåāăą]/g, "a")
					.replace(/Æ/g, "Ae")
					.replace(/æ/g, "ae")
					.replace(/[ÇĆĈĊČ]/g, "C")
					.replace(/[çćĉċč]/g, "c")
					.replace(/[ÐĎ]/g, "D")
					.replace(/[đď]/g, "d")
					.replace(/[ÈÊËĒĔĖĘĚ]/g, "E")
					.replace(/[èêëēĕėęě]/g, "e")
					.replace(/[ĜĞĠĢ]/g, "G")
					.replace(/[ĝğġģ]/g, "g")
					.replace(/[ĦĤ]/g, "H")
					.replace(/[ħĥ]/g, "h")
					.replace(/[ÌÎÏĨĪĬĮİ]/g, "I")
					.replace(/[ìîïĩīĭįı]/g, "i")
					.replace(/Ĳ/g, "Ij")
					.replace(/ĳ/g, "ij")
					.replace(/Ĵ/g, "J")
					.replace(/ĵ/g, "j")
					.replace(/Ķ/g, "K")
					.replace(/[ķĸ]/g, "k")
					.replace(/[ĹĻĽĿŁ]/g, "L")
					.replace(/[ĺļľŀł]/g, "l")
					.replace(/[ŃŅŇ]/g, "N")
					.replace(/[ńņňŉ]/g, "n")
					.replace(/[ÒÔÕŌŌŎŐ]/g, "O")
					.replace(/[òôõōðōŏő]/g, "o")
					.replace(/[ÖŒ]/g, "Oe")
					.replace(/[ö]/g, "o")
					.replace(/[œ]/g, "oe")
					.replace(/[ŔŖŘ]/g, "R")
					.replace(/[ŕŗř]/g, "r")
					.replace(/[ŚŜŞŠ]/g, "S")
					.replace(/[śŝşš]/g, "s")
					.replace(/[ŢŤŦ]/g, "T")
					.replace(/[ţťŧ]/g, "t")
					.replace(/[ÙÛŨŪŬŮŰŲ]/g, "U")
					.replace(/[ùûũūŭůűų]/g, "u")
					.replace(/Ŵ/g, "W")
					.replace(/ŵ/g, "w")
					.replace(/[ÝŶŸ]/g, "Y")
					.replace(/[ýŷÿ]/g, "y")
					.replace(/[ŽŹŻŽ]/g, "Z")
					.replace(/[žźżž]/g, "z")
					.replace(/[”“]/g, '"')
					.replace(/[º]/g, "°");
			}
		}
		return resultado;
	},

	moverImagenCarpetaDefinitiva: (nombre, destino) => {
		let rutaProvisoria = "./public/imagenes/9-Provisorio/" + nombre;
		let rutaDefinitiva = "./public/imagenes/" + destino + "/" + nombre;
		fs.rename(rutaProvisoria, rutaDefinitiva, (err) => {
			if (err) throw err;
			else console.log("Archivo de imagen movido a su carpeta definitiva");
		});
	},

	revisarImagen: (tipo, tamano) => {
		tamanoMaximo = 2;
		return tipo.slice(0, 6) != "image/"
			? "Necesitamos un archivo de imagen"
			: parseInt(tamano) > tamanoMaximo * Math.pow(10, 6)
			? "El tamaño del archivo es superior a " +
			  tamanoMaximo +
			  " MB, necesitamos uno más pequeño"
			: "";
	},

	download: async (url, rutaYnombre) => {
		let writer = fs.createWriteStream(rutaYnombre);
		let response = await axios({
			method: "GET",
			url: url,
			responseType: "stream",
		});
		response.data.pipe(writer);
		return new Promise((resolve, reject) => {
			writer.on("finish", () => resolve(console.log("Imagen guardada")));
			writer.on("error", (err) => reject(err));
		});
	},
		
};
