"use strict";
// Definir variables
const nodemailer = require("nodemailer");
const BD_genericas = require("../2-BD/Genericas");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

// Exportar ------------------------------------
module.exports = {
	// Gestión de archivos
	moverImagenCarpetaDefinitiva: (nombre, origen, destino) => {
		let archivoOrigen = "./public/imagenes/" + origen + "/" + nombre;
		let archivoDestino = "./public/imagenes/" + destino + "/" + nombre;
		if (fs.existsSync(archivoOrigen)) {
			fs.rename(archivoOrigen, archivoDestino, (error) => {
				if (error) throw error;
				else console.log("Archivo de imagen movido a la carpeta " + archivoDestino);
			});
		} else console.log("No se encuentra el archivo " + archivoOrigen);
	},
	borrarArchivo: (ruta, archivo) => {
		let archivoImagen = path.join(ruta, archivo);
		if (archivo && fs.existsSync(archivoImagen)) {
			fs.unlinkSync(archivoImagen);
			console.log("Archivo " + archivoImagen + " borrado");
		} else console.log("Archivo " + archivoImagen + " no encontrado");
	},
	revisarImagen: (tipo, tamano) => {
		let tamanoMaximo = 2;
		return tipo.slice(0, 6) != "image/"
			? "Necesitamos un archivo de imagen"
			: parseInt(tamano) > tamanoMaximo * Math.pow(10, 6)
			? "El tamaño del archivo es superior a " + tamanoMaximo + " MB, necesitamos uno más pequeño"
			: "";
	},
	descargar: async (url, rutaYnombre) => {
		let writer = fs.createWriteStream(rutaYnombre);
		let response = await axios({method: "GET", url: url, responseType: "stream"});
		response.data.pipe(writer);
		return new Promise((resolve, reject) => {
			writer.on("finish", () => resolve(console.log("Imagen guardada")));
			writer.on("error", (error) => reject(error));
		});
	},

	// Conversión de nombres
	familiaEnSingular: (entidad) => {
		return entidad == "peliculas" || entidad == "colecciones" || entidad == "capitulos"
			? "producto"
			: entidad.includes("RCLV_")
			? "rclv"
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
			: entidad == "links"
			? "Links"
			: "";
	},
	entidad_id: (entidad) => {
		return entidad == "peliculas"
			? "pelicula_id"
			: entidad == "colecciones"
			? "coleccion_id"
			: entidad == "capitulos"
			? "capitulo_id"
			: entidad.includes("personaje")
			? "personaje_id"
			: entidad.includes("hecho")
			? "hecho_id"
			: entidad.includes("valor")
			? "valor_id"
			: "";
	},
	obtenerEntidad: (edicion) => {
		return edicion.pelicula_id
			? "peliculas"
			: edicion.coleccion_id
			? "colecciones"
			: edicion.capitulo_id
			? "capitulos"
			: "";
	},

	// Fecha y Hora
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
	obtenerHoras: function (desde, hasta) {
		// Corregir fechas
		if (desde.getDay() == 0) desde = (parseInt(desde / unDia) + 1) * unDia;
		if (desde.getDay() == 6) desde = (parseInt(desde / unDia) + 2) * unDia;
		if (hasta.getDay() == 0) hasta = (parseInt(hasta / unDia) - 1) * unDia;
		if (hasta.getDay() == 6) hasta = (parseInt(hasta / unDia) - 0) * unDia;
		// Calcular la cantidad de horas
		let diferencia = hasta - desde;
		if (diferencia < 0) diferencia = 0;
		let horasDif = diferencia / 60 / 60 / 1000;
		// Averiguar la cantidad de horas por fines de semana
		let semanas = parseInt(horasDif / (7 * 24));
		let horasFDS_por_semanas = semanas * 2 * 24;
		let horasFDS_en_semana = desde.getDay() > hasta.getDay() ? 2 * 24 : 0;
		let horasFDS = horasFDS_por_semanas + horasFDS_en_semana;
		// Resultado
		let leadTime = parseInt((horasDif - horasFDS) * 100) / 100;
		leadTime = Math.min(96, leadTime);
		// Fin
		return leadTime;
	},

	// Varios
	enviarMail: async (asunto, mail, comentario) => {
		// create reusable transporter object using the default SMTP transport
		let transporter = nodemailer.createTransport({
			host: "smtp.gmail.com",
			port: 465,
			secure: true, // true for 465, false for other ports
			auth: {
				user: process.env.direccMail, // dirección de gmail
				pass: process.env.contrAplicacion, // contraseña de aplicación de gmail
			},
		});
		let datos = {
			from: '"elcpeliculas.com" <' + process.env.direccMail + ">",
			to: mail,
			subject: asunto, // Subject line
			text: comentario, // plain text body
			html: comentario.replace(/\r/g, "<br>").replace(/\n/g, "<br>"),
		};
		await transporter.sendMail(datos);
		datos.to = "diegoiribarren2015@gmail.com";
		await transporter.sendMail(datos);
	},
	quitarLasCoincidenciasConOriginal: (original, edicion) => {
		for (let campo in edicion) if (edicion[campo] === original[campo]) delete edicion[campo];
		return edicion;
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
	convertirLetrasAlIngles: (resultado) => {
		return resultado
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
					.replace(/  /g, " ")
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
	
};
