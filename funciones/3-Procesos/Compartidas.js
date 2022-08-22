"use strict";
// Definir variables
const nodemailer = require("nodemailer");
const BD_genericas = require("../2-BD/Genericas");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const variables = require("./Variables");
const procesosLinks = require("../../rutas_y_controladores/2.3-Links-CRUD/FN-Procesos");

// Exportar ------------------------------------
module.exports = {
	// Temas de Entidades
	todos_quitarCamposSinContenido: (objeto) => {
		for (let campo in objeto) if (objeto[campo] === null || objeto[campo] === "") delete objeto[campo];
		return objeto;
	},
	todos_obtenerLeadTime: (desde, hasta) => {
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

	// Temas de Edición
	quitarLosCamposQueNoSeComparan: (edicion, ent) => {
		// Obtener los campos a comparar
		let campos = [];
		variables["camposRevisar" + ent]().forEach((campo) => {
			campos.push(campo.nombreDelCampo);
			if (campo.relac_include) campos.push(campo.relac_include);
		});

		// Quitar de edicion los campos que no se comparan
		for (let campo in edicion) if (!campos.includes(campo)) delete edicion[campo];

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
	quedanCampos: (datos) => {
		// Averiguar si queda algún campo
		return !!Object.keys(datos).length;
	},
	pulirEdicion: function (original, edicion) {
		// Pulir la información a tener en cuenta
		edicion = this.todos_quitarCamposSinContenido(edicion);
		edicion = this.quitarLosCamposQueNoSeComparan(edicion, "Prod");
		//edicion = this.corregirErroresComunesDeEscritura(edicion); // Hacer
		edicion = this.quitarLasCoincidenciasConOriginal(original, edicion);
		let quedanCampos = this.quedanCampos(edicion);
		// Fin
		return [edicion, quedanCampos];
	},
	// ABM de registros
	crear_registro: async (entidad, datos, userID) => {
		datos.creado_por_id = userID;
		let id = await BD_genericas.agregarRegistro(entidad, datos).then((n) => n.id);
		// if (entidad == "links" && datos.gratuito==1) procesosLinks.prodCampoLG(datos.prodEntidad, datos.prodID);
		return id;
	},
	actualizar_registro: async (entidad, id, datos) => {
		await BD_genericas.actualizarPorId(entidad, id, datos);
		// if (entidad == "links") procesosLinks.prodCampoLG(datos.prodEntidad, datos.prodID);
		return "Registro original actualizado";
	},
	inactivar_registro: async (entidad, entidad_id, userID, motivo_id) => {
		// Obtener el status_id de 'inactivar'
		let inactivarID = await BD_genericas.obtenerPorCampos("status_registro", {inactivar: true}).then(
			(n) => n.id
		);
		// Preparar los datos
		let datos = {
			sugerido_por_id: userID,
			sugerido_en: funcionAhora(),
			motivo_id,
			status_registro_id: inactivarID,
		};
		// Actualiza el registro 'original' en la BD
		await BD_genericas.actualizarPorId(entidad, entidad_id, datos);
	},
	guardar_edicion: async function (entidadOrig, entidadEdic, original, edicion, userID) {
		// Variables
		let quedanCampos
		// Quitar los coincidencias con el original
		[edicion, quedanCampos] = this.pulirEdicion(original, edicion);
		// Averiguar si hay algún campo con novedad
		if (!quedanCampos) return "Edición sin novedades respecto al original";
		// Obtener el campo 'entidad_id'
		let entidad_id = this.obtenerEntidad_id(entidadOrig);
		// Si existe una edición de ese original y de ese usuario --> eliminarlo
		let objeto = {[entidad_id]: original.id, editado_por_id: userID};
		let registroEdic = await BD_genericas.obtenerPorCampos(entidadEdic, objeto);
		if (registroEdic) await BD_genericas.eliminarPorId(entidadEdic, registroEdic.id);
		// Completar la información
		edicion = {...edicion, [entidad_id]: original.id, editado_por_id: userID};
		// Agregar la nueva edición
		await BD_genericas.agregarRegistro(entidadEdic, edicion);
		// Fin
		return "Edición guardada";
	},

	// Conversión de nombres
	obtenerFamiliaEnSingular: (entidad) => {
		return entidad == "peliculas" || entidad == "colecciones" || entidad == "capitulos"
			? "producto"
			: entidad == "personajes" || entidad == "hechos" || entidad == "valores"
			? "rclv"
			: entidad == "links"
			? "link"
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
			? "link_id"
			: "";
	},
	obtieneEntidadOrigDesdeEdicion: (entidad) => {
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
			: entidad.link_id
			? "links"
			: "";
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

	// Gestión de archivos
	moverImagen: (nombre, origen, destino) => {
		let archivoOrigen = "./publico/imagenes/" + origen + "/" + nombre;
		let carpetaDestino = "./publico/imagenes/" + destino + "/";
		let archivoDestino = carpetaDestino + nombre;
		if (!fs.existsSync(carpetaDestino)) fs.mkdirSync(carpetaDestino);
		if (!fs.existsSync(archivoOrigen)) console.log("No se encuentra el archivo " + archivoOrigen);
		else
			fs.rename(archivoOrigen, archivoDestino, (error) => {
				if (!error) console.log("Archivo de imagen movido a la carpeta " + archivoDestino);
				else throw error;
			});
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
		let ruta = rutaYnombre.slice(0, rutaYnombre.lastIndexOf("/"));
		if (!fs.existsSync(ruta)) fs.mkdirSync(ruta);
		let writer = fs.createWriteStream(rutaYnombre);
		let response = await axios({method: "GET", url: url, responseType: "stream"});
		response.data.pipe(writer);
		return new Promise((resolve, reject) => {
			writer.on("finish", () => resolve(console.log("Imagen guardada")));
			writer.on("error", (error) => reject(error));
		});
	},

	// Varios
	nombreAvatar: (prodOriginal, prodEditado) => {
		return prodEditado.avatar
			? "/imagenes/3-ProdRevisar/" + prodEditado.avatar
			: prodOriginal.avatar
			? !prodOriginal.avatar.startsWith("http")
				? "/imagenes/2-Productos/" + prodOriginal.avatar
				: prodOriginal.avatar
			: "/imagenes/8-Agregar/IM.jpg";
	},
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
		let paisesNombre = [];
		if (paises_id.length) {
			let BD_paises = await BD_genericas.obtenerTodos("paises", "nombre");
			let paises_idArray = paises_id.split(" ");
			// Convertir 'IDs' en 'nombres'
			for (let pais_id of paises_idArray) {
				let paisNombre = BD_paises.find((n) => n.id == pais_id).nombre;
				if (paisNombre) paisesNombre.push(paisNombre);
			}
		}
		// Fin
		return paisesNombre.join(", ");
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
