"use strict";
// Definir variables
const nodemailer = require("nodemailer");
const BD_genericas = require("../BD/Genericas");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

// Exportar ------------------------------------
module.exports = {
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
		let datos = {
			from: '"Mensaje de la página web" <mensaje.web.01@gmail.com>', // sender address
			//to: mail,
			to: "diegoiribarren2015@gmail.com",
			subject: asunto, // Subject line
			text: comentario, // plain text body
			html: comentario.replace(/\r/g, "<br>").replace(/\n/g, "<br>"),
		};
		await transporter.sendMail(datos);
	},

	paises_idToNombre: async (paises_id) => {
		// Función para convertir 'string de ID' en  'string de nombres'
		let resultado = [];
		if (paises_id.length) {
			let BD_paises = await BD_genericas.obtenerTodos("paises", "nombre");
			let paises_idArray = paises_id.split(", ");
			// Convertir 'array de ID' en 'string de nombres'
			for (let pais_id of paises_idArray) {
				let aux = BD_paises.find((n) => n.id == pais_id);
				if (aux) resultado.push(aux.nombre);
			}
		}
		resultado = resultado.length ? resultado.join(", ") : "";
		return resultado;
	},

	paisNombreToId: async function (pais_nombre) {
		// Función para convertir 'string de nombre' en  'string de ID'
		let resultado = [];
		if (pais_nombre.length) {
			let BD_paises = await BD_genericas.obtenerTodos("paises", "nombre");
			pais_nombreArray = pais_nombre.split(", ");
			// Convertir 'array de nombres' en 'string de ID"
			for (let pais_nombre of pais_nombreArray) {
				let aux = BD_paises.find((n) => n.nombre == pais_nombre);
				aux ? resultado.push(aux.id) : "";
			}
		}
		resultado = resultado.length ? resultado.join(", ") : "";
		return resultado;
	},

	convertirLetrasAlIngles: (palabra) => {
		return palabra
			.toLowerCase()
			.replace(/-/g, " ")
			.replace(/á/g, "a")
			.replace(/é/g, "e")
			.replace(/í/g, "i")
			.replace(/ó/g, "o")
			.replace(/úü/g, "u")
			.replace(/ñ/g, "n")
			.replace(/:¿![.][?]/g, "")
			.replace(/ +/g, " ");
	},

	convertirLetrasAlCastellano: (resultado) => {
		let campos = Object.keys(resultado);
		let valores = Object.values(resultado);
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
					.replace(/[”“«»]/g, '"')
					.replace(/[º]/g, "°");
			}
		}
		return resultado;
	},

	letrasValidasCastellano: (dato) => {
		let formato = /^[¡¿A-ZÁÉÍÓÚÜÑ"\d][A-ZÁÉÍÓÚÜÑa-záéíóúüñ ,.&:;…"°'¿?¡!+-/()\d\r\n\#]+$/;
		// \d: any decimal
		// \r: carriage return
		// \n: new line
		return !formato.test(dato);
	},

	moverImagenCarpetaDefinitiva: (nombre, destino) => {
		let rutaProvisoria = "./public/imagenes/9-Provisorio/" + nombre;
		let rutaDefinitiva = "./public/imagenes/" + destino + "/" + nombre;
		fs.rename(rutaProvisoria, rutaDefinitiva, (err) => {
			if (err) throw err;
			else console.log("Archivo de imagen movido a la carpeta " + rutaDefinitiva);
		});
	},

	borrarArchivo: (archivo, ruta) => {
		let archivoImagen = path.join(ruta, archivo);
		console.log("Archivo " + archivoImagen + " borrado");
		if (archivo && fs.existsSync(archivoImagen)) fs.unlinkSync(archivoImagen);
	},

	revisarImagen: (tipo, tamano) => {
		let tamanoMaximo = 2;
		return tipo.slice(0, 6) != "image/"
			? "Necesitamos un archivo de imagen"
			: parseInt(tamano) > tamanoMaximo * Math.pow(10, 6)
			? "El tamaño del archivo es superior a " + tamanoMaximo + " MB, necesitamos uno más pequeño"
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

	status: function (status, capturado_en, captura_activa) {
		let id =
			captura_activa && capturado_en > this.haceUnaHora()
				? 2
				: status.pend_aprobar
				? 1
				: status.aprobado
				? 3
				: 4;
		let nombres = ["Pend. Aprobac.", "En Revisión", "Aprobado", "Inactivado"];
		return {id, nombre: nombres[id - 1]};
	},

	familiaEnSingular: (entidad) => {
		return entidad == "peliculas" || entidad == "colecciones" || entidad == "capitulos"
			? "producto"
			: entidad.includes("RCLV_")
			? "rclv"
			: "";
	},

	productoNombre: (entidad) => {
		return entidad == "peliculas"
			? "Película"
			: entidad == "colecciones"
			? "Colección"
			: entidad == "capitulos"
			? "Capítulo"
			: "";
	},

	productoEnSingular: (entidad) => {
		return entidad == "peliculas"
			? "pelicula"
			: entidad == "colecciones"
			? "coleccion"
			: entidad == "capitulos"
			? "capitulo"
			: "";
	},

	producto_id: (entidad) => {
		return entidad == "peliculas"
			? "pelicula_id"
			: entidad == "colecciones"
			? "coleccion_id"
			: "capitulo_id";
	},

	RCLV_Nombre: (input) => {
		return input.includes("personaje")
			? "Personaje Histórico"
			: input.includes("hecho")
			? "Hecho Histórico"
			: input.includes("valor")
			? "Valor"
			: "";
	},

	RCLV_id: (input) => {
		return input.includes("personaje")
			? "personaje_id"
			: input.includes("hecho")
			? "hecho_id"
			: input.includes("valor")
			? "valor_id"
			: "";
	},

	entidadNombre: (entidad) => {
		return entidad == "peliculas"
			? "Película"
			: entidad == "colecciones"
			? "Colección"
			: entidad == "capitulos"
			? "Capítulo"
			: entidad.includes("personaje")
			? "Personaje Histórico"
			: entidad.includes("hecho")
			? "Hecho Histórico"
			: entidad.includes("valor")
			? "Valor"
			: "";
	},

	ahora: () => {
		// Instante actual en horario local
		let ahora = new Date(new Date().toUTCString());
		return ahora;
	},

	haceUnaHora: function () {
		let horario = this.ahora();
		horario.setHours(horario.getHours() - 1);
		return horario;
	},

	haceDosHoras: function () {
		let horario = this.ahora();
		horario.setHours(horario.getHours() - 2);
		return horario;
	},

	borrarSessionCookies: (req, res, paso) => {
		let pasos = [
			"borrarTodo",
			"datosTerminaste",
			"palabrasClave",
			"desambiguar",
			"tipoProducto",
			"datosOriginales",
			"copiarFA",
			"datosDuros",
			"datosPers",
			"confirma",
		];
		let indice = pasos.indexOf(paso) + 1;
		for (indice; indice < pasos.length; indice++) {
			if (req.session && req.session[pasos[indice]]) delete req.session[pasos[indice]];
			if (req.cookies && req.cookies[pasos[indice]]) res.clearCookie(pasos[indice]);
		}
	},
};
