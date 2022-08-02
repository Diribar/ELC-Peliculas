"use strict";
// Definir variables
const nodemailer = require("nodemailer");
const BD_genericas = require("../2-BD/Genericas");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const variables = require("./Variables");

// Exportar ------------------------------------
module.exports = {
	// Gestión de archivos
	moverImagenCarpetaDefinitiva: (nombre, origen, destino) => {
		let archivoOrigen = "./publico/imagenes/" + origen + "/" + nombre;
		let archivoDestino = "./publico/imagenes/" + destino + "/" + nombre;
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
			: entidad == "personajes" || entidad == "hechos" || entidad == "valores"
			? "rclv"
			: entidad == "links"
			? "links"
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
			: entidad == "personajes"
			? "personaje_id"
			: entidad == "hechos"
			? "hecho_id"
			: entidad == "valores"
			? "valor_id"
			: entidad == "links"
			? "links"
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
			? "personajes"
			: entidad.hecho_id
			? "hechos"
			: entidad.valor_id
			? "valores"
			: "";
	},

	// Entidades
	quitarLosCamposSinContenido: (objeto) => {
		for (let campo in objeto) if (objeto[campo] === null) delete objeto[campo];
		return objeto;
	},
	quitarLosCamposQueNoSeComparan: (edicion, ent) => {
		// Obtener los campos a comparar
		let camposAComparar = variables["camposRevisar" + ent]().map((n) => n.nombreDelCampo);
		// Quitar de edicion los campos que no se comparan
		for (let campo in edicion) if (!camposAComparar.includes(campo)) delete edicion[campo];
		// Fin
		return edicion;
	},
	quitarLasCoincidenciasConOriginal: (original, edicion) => {
		// Eliminar campo si:
		// - edición tiene un valor significativo y coincide con el original (se usa '==' porque unos son texto y otros número)
		// - edición es estrictamente igual al original
		for (let campo in edicion)
			if ((edicion[campo] && edicion[campo] == original[campo]) || edicion[campo] === original[campo])
				delete edicion[campo];
		return edicion;
	},
	eliminarEdicionSiEstaVacio: async (entidadEdic, entidadEdic_id, datos) => {
		// Averiguar si queda algún campo
		let quedanCampos = !!Object.keys(datos).length;
		// Eliminar el registro de la edición
		if (!quedanCampos) await BD_genericas.eliminarPorId(entidadEdic, entidadEdic_id);
		return quedanCampos;
	},
	actualizarProdConLinkGratuito: async function (prodEntidad, prodID) {
		// Variables
		let datos = {};
		let entidad_id = this.obtenerEntidad_id(prodEntidad);
		// Obtener el producto con include a links
		let producto = await BD_genericas.obtenerPorIdConInclude(prodEntidad, prodID, [
			"links_gratuitos_cargados",
			"links_gratuitos_en_la_web",
			"links",
			"status_registro",
		]);
		// Obtener los links gratuitos de películas del producto
		let links = await BD_genericas.obtenerTodosPorCamposConInclude("links", {[entidad_id]: prodID}, [
			"status_registro",
			"tipo",
		])
			.then((n) => (n.length ? n.filter((n) => n.gratuito) : ""))
			.then((n) => (n.length ? n.filter((n) => n.tipo.pelicula) : ""));
		// Obtener los links 'Aprobados' y 'TalVez'
		let linksActivos = links.length ? links.filter((n) => n.status_registro.aprobado) : [];
		let linksTalVez = links.length ? links.filter((n) => n.status_registro.gr_pend_aprob) : [];
		if (linksActivos.length || linksTalVez.length) {
			// Obtener los ID de si, no y TalVez
			let si_no_parcial = await BD_genericas.obtenerTodos("si_no_parcial", "id");
			let si = si_no_parcial.find((n) => n.si).id;
			let talVez = si_no_parcial.find((n) => !n.si && !n.no).id;
			let no = si_no_parcial.find((n) => n.no).id;
			// Acciones para LINKS GRATUITOS EN LA WEB
			datos.links_gratuitos_en_la_web_id = linksActivos.length
				? si
				: producto.links_gratuitos_en_la_web_id != no
				? talVez
				: no;
			// Acciones para LINKS GRATUITOS CARGADOS
			datos.links_gratuitos_cargados_id = linksActivos.length ? si : linksTalVez.length ? talVez : no;
			// Actualizar la BD
			BD_genericas.actualizarPorId(prodEntidad, prodID, datos);
		}
		return;
	},

	// Middleware/RevisarUsuario
	buscaAlgunaCapturaVigenteDelUsuario: async (entidadActual, regID, userID) => {
		// Se revisa solamente en la familia de entidades
		// Asociaciones
		let entidades = ["peliculas", "colecciones", "capitulos"].includes(entidadActual)
			? ["peliculas", "colecciones", "capitulos"]
			: ["personajes", "hechos", "valores"];
		let asociaciones = [];
		entidades.forEach((entidad) => {
			asociaciones.push("captura_" + entidad);
		});
		// Variables
		let ahora = funcionAhora();
		let haceUnaHora = nuevoHorario(-1, ahora);
		let haceDosHoras = nuevoHorario(-2, ahora);
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
					// Si fue capturado hace más de 2 horas y no es el registro actual, limpiar los tres campos
					if (registro.capturado_en < haceDosHoras && registro.id != regID) {
						BD_genericas.actualizarPorId(entidades[i], registro.id, objeto);
						// Si fue capturado hace menos de 1 hora, informar el caso
					} else if (
						registro.capturado_en > haceUnaHora &&
						registro.captura_activa &&
						(entidades[i] != entidadActual || registro.id != regID)
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
	horario = horario ? horario : funcionAhora();
	let nuevoHorario = new Date(horario);
	nuevoHorario.setHours(nuevoHorario.getHours() + delay);
	return nuevoHorario;
};
