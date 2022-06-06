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
	obtenerFamiliaEnSingular: (entidad) => {
		return entidad == "peliculas" || entidad == "colecciones" || entidad == "capitulos"
			? "producto"
			: entidad.includes("RCLV_")
			? "rclv"
			: "";
	},
	obtenerEntidadNombre: (entidad) => {
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
	obtenerEntidad_id: (entidad) => {
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
	obtenerEntidad: (entidad) => {
		return entidad.pelicula_id
			? "peliculas"
			: entidad.coleccion_id
			? "colecciones"
			: entidad.capitulo_id
			? "capitulos"
			: entidad.personaje_id
			? "RCLV_personajes"
			: entidad.hecho_id
			? "RCLV_hechos"
			: entidad.valor_id
			? "RCLV_valores"
			: "";
	},

	// Entidades
	inactivarCaptura: async (entidad, prodID, userID) => {
		// Obtener producto
		let registro = await BD_genericas.obtenerPorId(entidad, prodID);
		// Verificar que tenga una captura activa del usuario
		if (
			registro &&
			registro.capturado_en &&
			registro.capturado_por_id &&
			registro.capturado_por_id == userID &&
			registro.captura_activa
		) {
			// En caso afirmativo, actualizarlo inactivando la captura
			await BD_genericas.actualizarPorId(entidad, prodID, {captura_activa: false});
		}
		return;
	},
	quitarLasCoincidenciasConOriginal: (original, edicion) => {
		for (let campo in edicion) if (edicion[campo] === original[campo]) delete edicion[campo];
		return edicion;
	},
	quitarLosCamposSinContenido: (objeto) => {
		for (let campo in objeto) if (objeto[campo] === null || objeto[campo] === "") delete objeto[campo];
		return objeto;
	},

	// Middleware/RevisarUsuario
	buscaAlgunaCapturaVigenteDelUsuario: async (entidadActual, prodID, userID) => {
		// Variables
		let entidades = [
			"peliculas",
			"colecciones",
			"capitulos",
			"RCLV_personajes",
			"RCLV_hechos",
			"RCLV_valores",
		];
		let asociaciones = [
			"captura_peliculas",
			"captura_colecciones",
			"captura_capitulos",
			"captura_personajes",
			"captura_hechos",
			"captura_valores",
		];
		let ahora = funcionAhora();
		let haceUnaHora = funcionHaceUnaHora(ahora);
		let haceDosHoras = funcionHaceDosHoras(ahora);
		let objeto = {capturado_en: null, capturado_por_id: null, captura_activa: null};
		let resultado;
		// Obtener el usuario con los includes
		let usuario = await BD_genericas.obtenerPorIdConInclude("usuarios", userID, asociaciones);
		// Rutina por cada asociación
		let i = 0;
		for (let asociacion of asociaciones) {
			if (usuario[asociacion].length) {
				// Rutina por cada entidad dentro de la asociación
				for (let registro of usuario[asociacion]) {
					// Si fue capturado hace más de 2 horas, limpiar los tres campos
					if (registro.capturado_en < haceDosHoras) {
						BD_genericas.actualizarPorId(entidades[i], registro.id, objeto);
						// Si fue capturado hace menos de 1 hora, informar el caso
					} else if (
						registro.capturado_en > haceUnaHora &&
						registro.captura_activa &&
						(entidades[i] != entidadActual || registro.id != prodID)
					) {
						resultado = {
							entidad: entidades[i],
							id: registro.id,
							capturado_en: registro.capturado_en,
							nombre: registro.nombre,
							nombre_castellano: registro.nombre_castellano,
							nombre_original: registro.nombre_original,
						};
						break;
					}
				}
			}
			if (resultado) break;
			else i++;
		}
		// Fin
		return resultado;
	},

	// Fecha y Hora
	ahora: () => {
		return funcionAhora();
	},
	nuevoHorario: (delay, horario) => {
		horario = horario ? horario : funcionAhora();
		return nuevoHorario(delay, horario);
	},
	horarioTexto: (horario) => {
		return (
			horario.getDate() +
			"/" +
			meses[horario.getMonth()] +
			" a las " +
			horario.getHours() +
			":" +
			String(horario.getMinutes()).padStart(2, "0") +
			"hs"
		);
	},
	obtenerLeadTime: (desde, hasta) => {
		// Corregir domingo
		if (desde.getDay() == 0) desde = (parseInt(desde / unDia) + 1) * unDia;
		if (hasta.getDay() == 0) hasta = (parseInt(hasta / unDia) - 1) * unDia;
		// Corregir sábado
		if (desde.getDay() == 6) desde = (parseInt(desde / unDia) + 2) * unDia;
		if (hasta.getDay() == 6) hasta = (parseInt(hasta / unDia) - 0) * unDia;
		// Calcular la cantidad de horas
		let diferencia = hasta - desde;
		if (diferencia < 0) diferencia = 0;
		let horasDif = diferencia / unaHora;
		// Averiguar la cantidad de horas por fines de semana
		let semanas = parseInt(horasDif / (7 * 24));
		let horasFDS_por_semanas = semanas * 2 * 24;
		let horasFDS_en_semana = desde.getDay() >= hasta.getDay() ? 2 * 24 : 0;
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

	// Convertir letras
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

// Funciones
let funcionAhora = () => {
	// Instante actual en horario local
	return new Date(new Date().toUTCString());
};
let nuevoHorario = (delay, horario) => {
	let nuevoHorario = new Date(horario ? horario : funcionAhora());
	nuevoHorario.setHours(nuevoHorario.getHours() + delay);
	return nuevoHorario;
};
