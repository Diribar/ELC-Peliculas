"use strict";
// Definir variables
const internetAvailable = require("internet-available");
const nodemailer = require("nodemailer");
const BD_genericas = require("../2-BD/Genericas");
const axios = require("axios");
const variables = require("./Variables");

// Exportar ------------------------------------
module.exports = {
	// Temas de Entidades
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
		let familias = this.obtieneFamiliasDesdeEntidad(entidad);

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

	// Conversiones
	obtieneFamiliaDesdeEntidad: (entidad) => {
		return [...variables.entidadesProd, "prods_edicion"].includes(entidad)
			? "producto"
			: [...variables.entidadesRCLV, "rclvs_edicion"].includes(entidad)
			? "rclv"
			: ["links", "links_edicion"].includes(entidad)
			? "link"
			: "";
	},
	obtieneFamiliasDesdeEntidad: (entidad) => {
		return [...variables.entidadesProd, "prods_edicion"].includes(entidad)
			? "productos"
			: [...variables.entidadesRCLV, "rclvs_edicion"].includes(entidad)
			? "rclvs"
			: ["links", "links_edicion"].includes(entidad)
			? "links"
			: entidad == "usuarios"
			? "usuarios"
			: "";
	},
	obtienePetitFamiliaDesdeEntidad: (entidad) => {
		return false
			? null
			: entidad == "links"
			? "links"
			: variables.entidadesRCLV.includes(entidad)
			? "rclvs"
			: variables.entidadesProd.includes(entidad)
			? "prods"
			: "";
	},
	obtieneEntidadNombreDesdeEntidad: (entidad) => {
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
			? "Epocas del Año"
			: entidad == "links"
			? "Links"
			: entidad == "usuarios"
			? "Usuarios"
			: "";
	},
	obtieneCampo_idDesdeEntidad: (entidad) => {
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
	obtieneAsociacion: (entidad) => {
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
	obtieneNombreEdicionDesdeEntidad: (entidad) => {
		return variables.entidadesProd.includes(entidad)
			? "prods_edicion"
			: variables.entidadesRCLV.includes(entidad)
			? "rclvs_edicion"
			: entidad == "links"
			? "links_edicion"
			: "";
	},
	obtieneProdEntidadDesdeProd_id: (edicion) => {
		return edicion.pelicula_id ? "peliculas" : edicion.coleccion_id ? "colecciones" : edicion.capitulo_id ? "capitulos" : "";
	},
	obtieneRclvEntidadDesdeRclv_id: (edicion) => {
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
	obtieneEntidadDesdeEnt_id: function (edicion) {
		const producto = this.obtieneProdEntidadDesdeProd_id(edicion);
		const RCLV = this.obtieneRclvEntidadDesdeRclv_id(edicion);
		return edicion.link_id ? "links" : RCLV ? RCLV : producto ? producto : "";
	},
	obtieneProducto_id: (edicion) => {
		return edicion.pelicula_id
			? "pelicula_id"
			: edicion.coleccion_id
			? "coleccion_id"
			: edicion.capitulo_id
			? "capitulo_id"
			: "";
	},
	obtieneRCLV_id: (edicion) => {
		return edicion.personaje_id ? "personaje_id" : edicion.hecho_id ? "hecho_id" : edicion.tema_id ? "tema_id" : "";
	},
	convierteLetrasAlIngles: (resultado) => {
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
	convierteLetrasAlCastellano: function (objeto) {
		// Variables
		let campos = Object.keys(objeto);
		let valores = Object.values(objeto);

		// Rutina por campo
		for (let campo in objeto)
			if (typeof objeto[campo] == "string") objeto[campo] = this.convierteLetrasAlCastellano_campo(objeto[campo]);

		// Fin
		return objeto;
	},
	convierteLetrasAlCastellano_campo: (valor) => {
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
			.replace(/[ţťŧ]/g, "t")
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
			.replace(/ +/g, " ")
			.replace(/\t/g, " ")
			.replace(/ /g, "")
			.replace(/–/g, "-")
			.replace("[", "(")
			.replace("]", ")")
			.replace(/#/g, "");
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

	// Fecha y Hora
	ahora: () => {
		return FN_ahora();
	},
	nuevoHorario: (delay, horario) => {
		return nuevoHorario(delay, horario);
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
	fechaHorario: (horario) => {
		horario = horario ? new Date(horario) : FN_ahora();
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

	// Gestión de archivos
	averiguaSiExisteUnArchivo: (rutaNombre) => {
		return rutaNombre && fs.existsSync(rutaNombre);
	},
	garantizaLaCarpetaProvisorio: function () {
		// Averigua si existe la carpeta
		if (!this.averiguaSiExisteUnArchivo("./publico/imagenes/9-Provisorio"))
			// Si no existe, la crea
			fs.mkdirSync("./publico/imagenes/9-Provisorio");
		// Fin
		return;
	},
	mueveUnArchivoImagen: function (nombre, origen, destino, output) {
		let archivoOrigen = "./publico/imagenes/" + origen + "/" + nombre;
		let carpetaDestino = "./publico/imagenes/" + destino + "/";
		let archivoDestino = carpetaDestino + nombre;
		if (!this.averiguaSiExisteUnArchivo(carpetaDestino)) fs.mkdirSync(carpetaDestino);
		if (!this.averiguaSiExisteUnArchivo(archivoOrigen))
			console.log("No se encuentra el archivo " + archivoOrigen + " para moverlo");
		else
			fs.rename(archivoOrigen, archivoDestino, (error) => {
				if (!error) {
					if (output) console.log("Archivo de imagen movido a la carpeta " + archivoDestino);
				} else throw error;
			});
	},
	cambiaElNombreDeUnArchivo: function (ruta, nombreOrig, nombreFinal, output) {
		ruta = "./publico/imagenes/" + ruta + "/";
		if (!this.averiguaSiExisteUnArchivo(ruta + nombreOrig))
			console.log("No se encuentra el archivo " + nombreOrig + " para cambiarle el nombre");
		else
			fs.rename(ruta + nombreOrig, ruta + nombreFinal, (error) => {
				if (!error) {
					if (output) console.log("Archivo " + nombreOrig + " renombrado como " + nombreFinal);
				} else throw error;
			});
	},
	copiaUnArchivoDeImagen: function (archivoOrigen, archivoDestino, output) {
		let nombreOrigen = "./publico/imagenes/" + archivoOrigen;
		let nombreDestino = "./publico/imagenes/" + archivoDestino;
		let carpetaDestino = nombreDestino.slice(0, nombreDestino.lastIndexOf("/"));
		if (!this.averiguaSiExisteUnArchivo(carpetaDestino)) fs.mkdirSync(carpetaDestino);
		if (!this.averiguaSiExisteUnArchivo(nombreOrigen))
			console.log("No se encuentra el archivo " + archivoOrigen + " para copiarlo");
		else
			fs.copyFile(nombreOrigen, nombreDestino, (error) => {
				if (!error) {
					if (output) console.log("Archivo " + archivoOrigen + " copiado a la carpeta " + archivoDestino);
				} else throw error;
			});
	},
	borraUnArchivo: async function (ruta, archivo, output) {
		// Arma el nombre del archivo
		let rutaArchivo = path.join(ruta, archivo);

		// Se fija si encuentra el archivo
		if (this.averiguaSiExisteUnArchivo(rutaArchivo)) {
			// Borra el archivo
			await fs.unlinkSync(rutaArchivo);
			// Avisa que lo borra
			if (output) console.log("Archivo '" + archivo + "' borrado");
		}
		// Mensaje si no lo encuentra
		else if (output) console.log("Archivo " + archivo + " no encontrado para borrar");
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

	// Validaciones
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
		sinopsis: (dato) => {
			let formato = /^[a-záéíóúüñ ,.'&$:;…"°¿?¡!+/()\d\r\n\-]+$/i;
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
			const MN_esImagen = esImagen == "NO" ? "El archivo no es una imagen" : "";
			const MN_extension = !ext
				? "El archivo debe tener alguna extensión"
				: ![".jpg", ".png", ".jpeg"].includes(ext)
				? "Usaste un archivo con la extensión '" +
				  ext.slice(1).toUpperCase() +
				  "'. Las extensiones válidas son JPG, JPEG y PNG"
				: "";
			const MN_tamano =
				tamano && tamano > 1100000
					? "El archivo tiene " + parseInt(tamano / 10000) / 100 + " MB. Necesitamos que no supere 1 MB"
					: "";

			// Respuesta
			if (!respuesta) respuesta = MN_esImagen ? MN_esImagen : MN_nombre ? MN_nombre : "";
			if (!respuesta) respuesta = MN_extension ? MN_extension : MN_tamano ? MN_tamano : "";
		}
		// Mensajes si no existe un avatar
		else if (!opcional) respuesta = "Necesitamos que agregues una imagen";

		// Fin
		return respuesta;
	},
	cartelRepetido: function (datos) {
		// Variables
		const {entidad, id} = datos;
		let entidadNombre = datos.entidadNombre; // Para links
		if (entidadNombre) entidadNombre = this.obtieneEntidadNombreDesdeEntidad(entidad).toLowerCase();

		// 1. Inicio
		let genero = ["capitulos", "links"].includes(entidad) ? "e" : "a";
		let inicio = "Est" + genero + " ";

		// 2. Anchor
		let url = "?entidad=" + entidad + "&id=" + id;
		let link = "/" + this.obtieneFamiliaDesdeEntidad(entidad) + "/detalle/" + url;
		let entidadHTML = "<u><strong>" + entidadNombre + "</strong></u>";
		let anchor = " <a href='" + link + "' target='_blank' tabindex='-1'> " + entidadHTML + "</a>";

		// 3. Final
		let final = " ya se encuentra en nuestra base de datos";

		// Fin
		return inicio + anchor + final;
	},

	// Usuarios
	usuarioPenalizAcum: (userID, motivo, petitFamilia) => {
		// Variables
		let duracion = motivo.duracion;
		let objeto = {};

		// Aumenta la penalización acumulada
		BD_genericas.aumentaElValorDeUnCampo("usuarios", userID, "penalizac_acum", duracion);

		// Si corresponde, que se muestre el cartel de responsabilidad
		if (duracion > 1 && petitFamilia) {
			let cartel = "cartel_resp_" + petitFamilia;
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
				return {
					OK: false,
					informacion: {
						mensajes: ["No hay conexión a internet"],
						iconos: [{nombre: "fa-rotate-right", link: req.originalUrl, titulo: "Volver a intentarlo"}],
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
			from: '"Emprendimiento a bautizar" <' + process.env.direccMail + ">",
			to: mail,
			subject: asunto, // Subject line
			text: comentario, // plain text body
			html: comentario.replace(/\r/g, "<br>").replace(/\n/g, "<br>"),
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
	valorNombre: (valor, alternativa) => {
		return valor ? valor.nombre : alternativa;
	},
	eliminaRepetidos: (prods) => {
		// Variables
		let resultado = [];
		// Agrega los productos con edición más antigua
		for (let prod of prods) if (!resultado.find((n) => n.id == prod.id && n.entidad == prod.entidad)) resultado.push(prod);
		// Fin
		return resultado;
	},
	rutaSalir: (tema, codigo, datos) => {
		// Variables
		let rutaSalir;
		// Obtiene la ruta
		if (tema == "rclv_crud" && codigo == "agregar") {
			// Desde vista 'agregar' no hace falta inactivar

			// 1. Obtiene la ruta a la cual ir
			let rutaOrigen =
				datos.origen == "DA" ? "/producto/agregar/datos-adicionales" : datos.origen == "EDP" ? "/producto/edicion/" : "/";
			// Obtiene los parámetros de entidad + ID, en la ruta de origen
			let entidadIdOrigen =
				datos.origen && datos.origen != "DA" ? "?entidad=" + datos.prodEntidad + "&id=" + datos.prodID : "";

			// Fin - Consolida la información
			rutaSalir = rutaOrigen + entidadIdOrigen;
		} else {
			// Desde otras vistas, hace falta inactivar
			// Obtiene la ruta a la cual ir
			let rutaOrigen = "/inactivar-captura/";

			// Obtiene la vista de origen
			let vistaOrigen = "?origen=" + (datos.origen ? datos.origen : "TE");

			// Obtiene los parámetros de entidad + ID, a inactivar
			let entidadId_inactivar = "&entidad=" + datos.entidad + "&id=" + datos.id;

			// Datos sólo si el origen es 'EDP'
			let soloSiOrigenED = datos.origen == "EDP" ? "&prodEntidad=" + datos.prodEntidad + "&prodID=" + datos.prodID : "";

			// Fin - Consolida la información
			rutaSalir = rutaOrigen + vistaOrigen + entidadId_inactivar + soloSiOrigenED;
		}
		// Fin
		return rutaSalir;
	},
	inicialMayus: (texto) => {
		return texto.slice(0, 1).toUpperCase() + texto.slice(1);
	},
};

// Funciones
let FN_ahora = () => {
	return new Date(new Date().toUTCString()); // <-- para convertir en 'horario local'
};
let nuevoHorario = (delay, horario) => {
	horario = horario ? horario : FN_ahora();
	let nuevoHorario = new Date(horario);
	nuevoHorario.setHours(nuevoHorario.getHours() + delay);
	return nuevoHorario;
};
