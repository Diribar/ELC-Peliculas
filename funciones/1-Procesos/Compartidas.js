"use strict";
// Definir variables
const internetAvailable = require("internet-available");
const nodemailer = require("nodemailer");
const BD_genericas = require("../2-BD/Genericas");
const axios = require("axios");
const variables = require("./Variables");

// Exportar ------------------------------------
module.exports = {
	obtieneDesdeFamilias: {
		familia: (familias) => {
			return familias == "productos"
				? "producto"
				: familias == "rclvs"
				? "rclv"
				: familias == "links"
				? "link"
				: familias == "usuarios"
				? "usuario"
				: "";
		},
		petitFamilias: (familias) => {
			return familias == "links" ? "links" : familias == "rclvs" ? "rclvs" : familias == "productos" ? "prods" : "";
		},
		entidadEdic: (familias) => {
			return familias == "productos"
				? "prods_edicion"
				: familias == "rclvs"
				? "rclvs_edicion"
				: familias == "links"
				? "links_edicion"
				: "";
		},
	},
	obtieneDesdeEntidad: {
		familia: (entidad) => {
			return FN.familia(entidad);
		},
		familias: (entidad) => {
			return [...variables.entidades.prods, "prods_edicion"].includes(entidad)
				? "productos"
				: [...variables.entidades.rclvs, "rclvs_edicion"].includes(entidad)
				? "rclvs"
				: ["links", "links_edicion"].includes(entidad)
				? "links"
				: entidad == "usuarios"
				? "usuarios"
				: "";
		},
		petitFamilias: (entidad) => {
			return false
				? null
				: entidad == "links"
				? "links"
				: variables.entidades.rclvs.includes(entidad)
				? "rclvs"
				: variables.entidades.prods.includes(entidad)
				? "prods"
				: "";
		},
		entidadNombre: (entidad) => {
			return FN.entidadNombre(entidad);
		},
		campo_id: (entidad) => {
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
				: entidad == "temas"
				? "tema_id"
				: entidad == "eventos"
				? "evento_id"
				: entidad == "epocas_del_ano"
				? "epoca_del_ano_id"
				: entidad == "links"
				? "link_id"
				: "";
		},
		asociacion: (entidad) => {
			return entidad == "peliculas"
				? "pelicula"
				: entidad == "colecciones"
				? "coleccion"
				: entidad == "capitulos"
				? "capitulo"
				: entidad == "personajes"
				? "personaje"
				: entidad == "hechos"
				? "hecho"
				: entidad == "temas"
				? "tema"
				: entidad == "eventos"
				? "evento"
				: entidad == "epocas_del_ano"
				? "epoca_del_ano"
				: entidad == "links"
				? "link"
				: "";
		},
		entidadEdic: (entidad) => {
			return variables.entidades.prods.includes(entidad)
				? "prods_edicion"
				: variables.entidades.rclvs.includes(entidad)
				? "rclvs_edicion"
				: entidad == "links"
				? "links_edicion"
				: "";
		},
	},
	obtieneDesdeEdicion: {
		entidadProd: (edicion) => {
			return edicion.pelicula_id
				? "peliculas"
				: edicion.coleccion_id
				? "colecciones"
				: edicion.capitulo_id
				? "capitulos"
				: "";
		},
		entidadRCLV: (edicion) => {
			return edicion.personaje_id
				? "personajes"
				: edicion.hecho_id
				? "hechos"
				: edicion.tema_id
				? "temas"
				: edicion.evento_id
				? "eventos"
				: edicion.epoca_del_ano_id
				? "epocas_del_ano"
				: "";
		},
		entidad: function (edicion) {
			const producto = this.entidadProd(edicion);
			const RCLV = this.entidadRCLV(edicion);
			return edicion.link_id ? "links" : RCLV ? RCLV : producto ? producto : "";
		},
		campo_idProd: (edicion) => {
			return edicion.pelicula_id
				? "pelicula_id"
				: edicion.coleccion_id
				? "coleccion_id"
				: edicion.capitulo_id
				? "capitulo_id"
				: "";
		},
		campo_idRCLV: (edicion) => {
			return edicion.personaje_id
				? "personaje_id"
				: edicion.hecho_id
				? "hecho_id"
				: edicion.tema_id
				? "tema_id"
				: edicion.evento_id
				? "evento_id"
				: edicion.epoca_del_ano_id
				? "epoca_del_ano_id"
				: "";
		},
		asocProd: (edicion) => {
			return edicion.pelicula_id ? "pelicula" : edicion.coleccion_id ? "coleccion" : edicion.capitulo_id ? "capitulo" : "";
		},
		asocRCLV: (edicion) => {
			return edicion.personaje_id
				? "personaje"
				: edicion.hecho_id
				? "hecho"
				: edicion.tema_id
				? "tema"
				: edicion.evento_id
				? "evento"
				: edicion.epoca_del_ano_id
				? "epoca_del_ano"
				: "";
		},
	},
	convierteLetras: {
		alIngles: (resultado) => {
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
		alCastellano: function (objeto) {
			// Variables
			let campos = Object.keys(objeto);
			let valores = Object.values(objeto);

			// Rutina por campo
			for (let campo in objeto)
				if (typeof objeto[campo] == "string") objeto[campo] = this.alCastellano_campo(objeto[campo]);

			// Fin
			return objeto;
		},
		alCastellano_campo: (valor) => {
			return valor
				.replace(/[ÀÂÃÄÅĀĂĄ]/g, "A")
				.replace(/[àâãäåāăą]/g, "a")
				.replace(/á/g, "á")
				.replace(/Æ/g, "Ae")
				.replace(/æ/g, "ae")
				.replace(/ß/g, "b")
				.replace(/[ÇĆĈĊČ]/g, "C")
				.replace(/[çćĉċč]/g, "c")
				.replace(/[ÐĎĐ]/g, "D")
				.replace(/[đď]/g, "d")
				.replace(/[ÈÊËĒĔĖĘĚ]/g, "E")
				.replace(/[èêëēĕėęě]/g, "e")
				.replace(/[ĜĞĠĢ]/g, "G")
				.replace(/[ĝğġģ]/g, "g")
				.replace(/[ĦĤ]/g, "H")
				.replace(/[ħĥ]/g, "h")
				.replace(/[ÌÎÏĨĪĬĮİ]/g, "I")
				.replace(/[ìîïĩīĭįı]/g, "i")
				.replace(/í/g, "í")
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
				.replace(/[òôõōðōŏőö]/g, "o")
				.replace(/ó/g, "ó")
				.replace(/[ÖŒ]/g, "Oe")
				.replace(/[œ]/g, "oe")
				.replace(/[ŔŖŘ]/g, "R")
				.replace(/[ŕŗř]/g, "r")
				.replace(/[ŚŜŞŠ]/g, "S")
				.replace(/[śŝşš]/g, "s")
				.replace(/[ŢŤŦ]/g, "T")
				.replace(/[țţťŧ]/g, "t")
				.replace(/[ÙÛŨŪŬŮŰŲ]/g, "U")
				.replace(/[ùûũūŭůűų]/g, "u")
				.replace(/Ŵ/g, "W")
				.replace(/ŵ/g, "w")
				.replace(/[ÝŶŸ]/g, "Y")
				.replace(/[ýŷÿ]/g, "y")
				.replace(/[ŽŹŻŽ]/g, "Z")
				.replace(/[žźżž]/g, "z")
				.replace(/[`‘“’”«»]/g, '"')
				.replace(/[º]/g, "°")
				.replace(/ /g, "")
				.replace(/–/g, "-")
				.replace("[", "(")
				.replace("]", ")")
				.replace(/#/g, "")
				.replace(/\t/g, " ") // previene el uso de 'tab'
				.replace(/\n/g, " ") // previene el uso de 'return'
				.replace(/ +/g, " ");
		},
	},
	fechaHora: {
		ahora: () => {
			return FN.ahora();
		},
		nuevoHorario: (delay, horario) => {
			return FN.nuevoHorario(delay, horario);
		},
		fechaDiaMes: (fecha) => {
			fecha = new Date(fecha);
			let dia = fecha.getUTCDate();
			let mes = mesesAbrev[fecha.getUTCMonth()];
			fecha = dia + "/" + mes;
			return fecha;
		},
		fechaDiaMesAno: function (fecha) {
			fecha = new Date(fecha);
			let ano = fecha.getUTCFullYear().toString().slice(-2);
			return this.fechaDiaMes(fecha) + "/" + ano;
		},
		fechaFormatoBD: (fecha) => {
			fecha = new Date(fecha);
			let dia = ("0" + fecha.getUTCDate()).slice(-2);
			let mes = ("0" + (fecha.getUTCMonth() + 1)).slice(-2);
			let ano = fecha.getUTCFullYear();
			return ano + "-" + mes + "-" + dia;
		},
		fechaHorario: (horario) => {
			horario = horario ? new Date(horario) : FN.ahora();
			return (
				horario.getDate() +
				"/" +
				mesesAbrev[horario.getMonth()] +
				" a las " +
				horario.getHours() +
				":" +
				String(horario.getMinutes()).padStart(2, "0") +
				"hs"
			);
		},
		diaDelAno: (dataEntry) => {
			let datos = {};
			if (dataEntry.dia_del_ano_id && dataEntry.dia_del_ano_id <= 366) {
				let dia_del_ano = dias_del_ano.find((n) => n.id == dataEntry.dia_del_ano_id);
				datos.dia = dia_del_ano.dia;
				datos.mes_id = dia_del_ano.mes_id;
			}
			// Fin
			return datos;
		},
	},
	gestionArchivos: {
		existe: (rutaNombre) => {
			return rutaNombre && fs.existsSync(rutaNombre);
		},
		carpetaProvisorio: function () {
			// Averigua si existe la carpeta
			if (!this.existe("./publico/imagenes/9-Provisorio"))
				// Si no existe, la crea
				fs.mkdirSync("./publico/imagenes/9-Provisorio");
			// Fin
			return;
		},
		elimina: function (ruta, archivo, output) {
			// Arma el nombre del archivo
			let rutaArchivo = path.join(ruta, archivo);
			output = true;

			// Se fija si encuentra el archivo
			if (this.existe(rutaArchivo)) {
				// Borra el archivo
				fs.unlinkSync(rutaArchivo);
				// Avisa que lo borra
				if (output) console.log("Archivo '" + rutaArchivo + "' borrado");
			}
			// Mensaje si no lo encuentra
			else if (output) console.log("Archivo " + rutaArchivo + " no encontrado para borrar");

			// Fin
			return;
		},
		descarga: async (url, rutaYnombre, output) => {
			// Carpeta donde descargar
			let ruta = rutaYnombre.slice(0, rutaYnombre.lastIndexOf("/"));
			let nombre = rutaYnombre.slice(rutaYnombre.lastIndexOf("/") + 1);
			if (!fs.existsSync(ruta)) fs.mkdirSync(ruta);
			// Realiza la descarga
			let writer = fs.createWriteStream(rutaYnombre);
			let response = await axios({method: "GET", url, responseType: "stream"});
			response.data.pipe(writer);
			// Obtiene el resultado de la descarga
			let resultado = await new Promise((resolve, reject) => {
				writer.on("finish", () => {
					if (output) console.log("Imagen '" + nombre + "' guardada");
					resolve("OK");
				});
				writer.on("error", (error) => {
					console.log(388, error);
					reject("Error");
				});
			});
			// Fin
			return resultado;
		},
		mueveImagen: function (nombre, origen, destino, output) {
			let archivoOrigen = "./publico/imagenes/" + origen + "/" + nombre;
			let carpetaDestino = "./publico/imagenes/" + destino + "/";
			let archivoDestino = carpetaDestino + nombre;
			if (!this.existe(carpetaDestino)) fs.mkdirSync(carpetaDestino);
			if (!this.existe(archivoOrigen)) console.log("No se encuentra el archivo " + archivoOrigen + " para moverlo");
			else
				fs.renameSync(archivoOrigen, archivoDestino, (error) => {
					if (!error) {
						if (output) console.log("Archivo de imagen movido a la carpeta " + archivoDestino);
					} else throw error;
				});
		},
		copiaImagen: function (archivoOrigen, archivoDestino, output) {
			let nombreOrigen = "./publico/imagenes/" + archivoOrigen;
			let nombreDestino = "./publico/imagenes/" + archivoDestino;
			let carpetaDestino = nombreDestino.slice(0, nombreDestino.lastIndexOf("/"));
			if (!this.existe(carpetaDestino)) fs.mkdirSync(carpetaDestino);
			if (!this.existe(nombreOrigen)) console.log("No se encuentra el archivo " + archivoOrigen + " para copiarlo");
			else
				fs.copyFile(nombreOrigen, nombreDestino, (error) => {
					if (!error) {
						if (output) console.log("Archivo " + archivoOrigen + " copiado a la carpeta " + archivoDestino);
					} else throw error;
				});
		},
		imagenAlAzar: (carpeta) => {
			// Obtiene el listado de archivos
			const archivos = fs.readdirSync("./publico/imagenes/" + carpeta);

			// Elije al azar el n° de imagen
			const indice = parseInt(Math.random() * archivos.length);

			// Genera el nombre del archivo
			const imagenAlAzar = archivos[indice];

			// Fin
			return imagenAlAzar;
		},
	},
	validacs: {
		longitud: (dato, corto, largo) => {
			return dato.length < corto
				? "El contenido debe ser más largo"
				: dato.length > largo
				? "El contenido debe ser más corto"
				: "";
		},
		castellano: {
			basico: (dato) => {
				let formato = /^[a-záéíóúüñ ,.'\-]+$/i;
				return !formato.test(dato) ? "Sólo se admiten letras del abecedario castellano" : "";
			},
			completo: (dato) => {
				let formato = /^[a-záéíóúüñ ,.'&$:;…"°¿?¡!+/()\d\-]+$/i;
				return !formato.test(dato) ? "Sólo se admiten letras del abecedario castellano" : "";
			},
		},
		inicial: {
			basico: (dato) => {
				let formato = /^[A-ZÁÉÍÓÚÜÑ]/;
				return !formato.test(dato) ? "La primera letra debe ser en mayúscula" : "";
			},
			completo: (dato) => {
				let formato = /^[A-ZÁÉÍÓÚÜÑ¡¿"\d]/;
				return !formato.test(dato) ? "La primera letra debe ser en mayúscula" : "";
			},
			sinopsis: (dato) => {
				let formato = /^[A-ZÁÉÍÓÚÜÑ¡¿"\d]/;
				return !formato.test(dato) ? "La primera letra debe ser en mayúscula" : "";
			},
		},
		avatar: (datos) => {
			// Variables
			const {avatar_url, docum_avatar, tamano, esImagen, opcional} = datos;
			const avatar = datos.avatar ? datos.avatar : avatar_url ? avatar_url : docum_avatar ? docum_avatar : "";
			const ext = avatar ? path.extname(avatar).toLowerCase() : "";
			let respuesta = "";

			// Mensajes si existe un avatar
			if (avatar) {
				// Valida si es una imagen
				if (!respuesta && esImagen == "NO") respuesta = "El archivo no es una imagen";

				// Valida la extensión
				if (!respuesta)
					respuesta = !ext
						? "El archivo debe tener alguna extensión"
						: ![".jpg", ".png", ".jpeg"].includes(ext)
						? "Usaste un archivo con la extensión '" +
						  ext.slice(1).toUpperCase() +
						  "'. Las extensiones válidas son JPG, JPEG y PNG"
						: "";

				// Valida el tamaño
				if (!respuesta && tamano && tamano > 1100000)
					respuesta = "El archivo tiene " + parseInt(tamano / 10000) / 100 + " MB. Necesitamos que no supere 1 MB";
			}
			// Mensajes si no existe un avatar
			else if (!opcional) respuesta = "Necesitamos que agregues una imagen";

			// Fin
			return respuesta;
		},
		cartelRepetido: function (datos) {
			// Variables
			const {entidad, id} = datos;

			const entidadNombre = (
				datos.entidadNombre
					? datos.entidadNombre // Para links
					: FN.entidadNombre(entidad)
			).toLowerCase();

			// 1. Inicio
			let genero = ["capitulos", "links"].includes(entidad) ? "e" : "a";
			let inicio = "Est" + genero + " ";

			// 2. Anchor
			let url = "?entidad=" + entidad + "&id=" + id;
			let link = "/" + FN.familia(entidad) + "/detalle/" + url;
			let entidadHTML = "<u><b>" + entidadNombre + "</b></u>";
			let anchor = " <a href='" + link + "' target='_blank' tabindex='-1'> " + entidadHTML + "</a>";

			// 3. Final
			let final = " ya se encuentra en nuestra base de datos";

			// Fin
			return inicio + anchor + final;
		},
	},

	// Usuarios
	usuarioPenalizAcum: (userID, motivo, petitFamilias) => {
		// Variables
		let duracion = motivo.duracion;
		let objeto = {};

		// Aumenta la penalización acumulada
		BD_genericas.aumentaElValorDeUnCampo("usuarios", userID, "penalizac_acum", duracion);

		// Si corresponde, que se muestre el cartel de responsabilidad
		if (duracion > 1 && petitFamilias) {
			let cartel = "cartel_resp_" + petitFamilias;
			objeto[cartel] = true;
		}
		// Si corresponde, se le baja el rol a 'Consultas'
		if (motivo.bloqueoInput) objeto.rol_usuario_id = roles_us.find((n) => !n.perm_inputs).id;

		// Si corresponde, actualiza el usuario
		if (Object.keys(objeto).length) BD_genericas.actualizaPorId("usuarios", userID, objeto);

		// Fin
		return;
	},
	nombreApellido: (usuario) => {
		return usuario.nombre + " " + usuario.apellido;
	},

	// Internet
	conectividadInternet: async (req) => {
		return await internetAvailable()
			.then(async () => {
				return {OK: true};
			})
			.catch(async () => {
				const link = req ? req.originalUrl : "/";
				return {
					OK: false,
					informacion: {
						mensajes: ["No hay conexión a internet"],
						iconos: [{nombre: "fa-rotate-right", link, titulo: "Volver a intentarlo"}],
					},
				};
			});
	},
	enviarMail: async function (asunto, mail, comentario, req) {
		// Verifica la conexión a internet
		let hayConexionInternet = this.conectividadInternet(req);

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
			from: '"DADI" <' + process.env.direccMail + ">",
			to: mail,
			subject: asunto, // Subject line
			//text: comentario, // plain text body
			html: comentario, //.replace(/\r/g, "<br>").replace(/\n/g, "<br>"),
		};
		// Envío del mail
		let mailEnviado = transporter
			.sendMail(datos)
			.then(() => {
				return {OK: true};
			})
			.catch(() => {
				return {
					OK: false,
					informacion: {
						mensajes: ["No se envió el e-mail"],
						iconos: [variables.vistaAnterior(req.session.urlAnterior)],
					},
				};
			});

		// datos.to = "diegoiribarren2015@gmail.com";
		// await transporter.sendMail(datos);

		// Espera a recibir el feedback
		[hayConexionInternet, mailEnviado] = await Promise.all([hayConexionInternet, mailEnviado]);
		let resultado = !hayConexionInternet.OK ? hayConexionInternet : !mailEnviado.OK ? mailEnviado : {OK: true};

		// Fin
		return resultado;
	},

	// Varias
	obtieneLeadTime: (desdeOrig, hastaOrig) => {
		// Variables
		let desdeFinal = desdeOrig;
		let hastaFinal = hastaOrig;
		// Pasa el 'desde' del sábado/domingo al lunes siguiente
		if (desdeOrig.getDay() == 6) desdeFinal = desdeOrig + 2 * unDia;
		else if (desdeOrig.getDay() == 0) desdeFinal = desdeOrig + 1 * unDia;
		// Pasa el 'hasta' del sábado/domingo al viernes anterior
		if (hastaOrig.getDay() == 6) hastaFinal = hastaOrig - 1 * unDia;
		else if (hastaOrig.getDay() == 0) hastaFinal = hastaOrig - 2 * unDia;
		// Calcula la cantidad de horas
		let diferencia = hastaFinal - desdeFinal;
		if (diferencia < 0) diferencia = 0;
		let horasDif = diferencia / unaHora;
		// Averigua la cantidad de fines de semana
		let semanas = parseInt(horasDif / (7 * 24));
		horasDif -= semanas * 2 * 24;
		// Resultado
		let leadTime = parseInt(horasDif * 100) / 100; // Redondea a 2 digitos
		leadTime = Math.min(96, leadTime);
		// Fin
		return leadTime;
	},
	obtieneTodosLosCamposInclude: function (entidad) {
		// Obtiene la familia
		let familias = this.obtieneDesdeEntidad.familias(entidad);

		// Obtiene todos los campos de la familia
		let campos = [...variables.camposRevisar[familias]];

		// Deja solamente los que tienen que ver con la entidad
		let camposEntidad = campos.filter((n) => n[entidad] || n[familias]);

		// Deja solamente los campos con vínculo
		let camposConVinculo = camposEntidad.filter((n) => n.relacInclude);

		// Obtiene una matriz con los vínculos
		let include = camposConVinculo.map((n) => n.relacInclude);

		// Fin
		return include;
	},
	valorNombre: (valor, alternativa) => {
		return valor ? valor.nombre : alternativa;
	},
	nombresPosibles: (registro) => {
		return registro.nombre_castellano
			? registro.nombre_castellano
			: registro.nombre_original
			? registro.nombre_original
			: registro.nombre
			? registro.nombre
			: "";
	},
	eliminaRepetidos: (prods) => {
		// Variables
		let resultado = [];

		// Agrega los nuevos
		for (let prod of prods) if (!resultado.find((n) => n.id == prod.id && n.entidad == prod.entidad)) resultado.push(prod);
		
		// Fin
		return resultado;
	},
	inicialMayus: (texto) => {
		return texto.slice(0, 1).toUpperCase() + texto.slice(1);
	},
	paises_idToNombre: (paises_id) => {
		// Función para convertir 'string de ID' en 'string de nombres'
		let paisesNombre = [];
		if (paises_id.length) {
			let paises_idArray = paises_id.split(" ");
			// Convertir 'IDs' en 'nombres'
			for (let pais_id of paises_idArray) {
				let paisNombre = paises.find((n) => n.id == pais_id);
				if (paisNombre) paisesNombre.push(paisNombre.nombre);
			}
		}
		// Fin
		return paisesNombre.join(", ");
	},
	sinProblemasDeCaptura: function (familia, revID, ahora) {
		// Variables
		const haceUnaHora = this.fechaHora.nuevoHorario(-1, ahora);
		const haceDosHoras = this.fechaHora.nuevoHorario(-2, ahora);

		// Fin
		return familia.filter(
			(n) =>
				// Que no esté capturado
				!n.capturado_en ||
				// Que esté capturado hace más de dos horas
				n.capturado_en < haceDosHoras ||
				// Que la captura haya sido por otro usuario y hace más de una hora
				(n.capturado_por_id != revID && n.capturado_en < haceUnaHora) ||
				// Que la captura haya sido por otro usuario y esté inactiva
				(n.capturado_por_id != revID && !n.captura_activa) ||
				// Que esté capturado por este usuario hace menos de una hora
				(n.capturado_por_id == revID && n.capturado_en > haceUnaHora)
		);
	},
};

// Funciones
let FN = {
	ahora: () => {
		return new Date(new Date().toUTCString()); // <-- para convertir en 'horario local'
	},
	nuevoHorario: (delay, horario) => {
		horario = horario ? horario : FN.ahora();
		let nuevoHorario = new Date(horario);
		nuevoHorario.setHours(nuevoHorario.getHours() + delay);
		return nuevoHorario;
	},
	entidadNombre: (entidad) => {
		return entidad == "peliculas"
			? "Película"
			: entidad == "colecciones"
			? "Colección"
			: entidad == "capitulos"
			? "Capítulo"
			: entidad == "personajes"
			? "Personaje"
			: entidad == "hechos"
			? "Hecho"
			: entidad == "temas"
			? "Tema"
			: entidad == "eventos"
			? "Evento del Año"
			: entidad == "epocas_del_ano"
			? "Epoca del Año"
			: entidad == "links"
			? "Link"
			: entidad == "usuarios"
			? "Usuarios"
			: "";
	},
	familia: (entidad) => {
		return [...variables.entidades.prods, "prods_edicion"].includes(entidad)
			? "producto"
			: [...variables.entidades.rclvs, "rclvs_edicion"].includes(entidad)
			? "rclv"
			: ["links", "links_edicion"].includes(entidad)
			? "link"
			: "";
	},
};
