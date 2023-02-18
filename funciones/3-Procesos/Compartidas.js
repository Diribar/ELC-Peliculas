"use strict";
// Definir variables
const internetAvailable = require("internet-available");
const nodemailer = require("nodemailer");
const BD_genericas = require("../2-BD/Genericas");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const variables = require("./Variables");

// Exportar ------------------------------------
module.exports = {
	// Temas de Entidades
	obtieneLeadTime: (desdeOrig, hastaOrig) => {
		// Variables
		let desdeFinal, hastaFinal;
		// Corregir sábado
		if (desdeOrig.getDay() == 6) desdeFinal = (parseInt(desdeOrig / unDia) + 2) * unDia;
		else if (desdeOrig.getDay() == 0) desdeFinal = (parseInt(desdeOrig / unDia) + 1) * unDia;
		// Corregir domingo
		if (hastaOrig.getDay() == 6) hastaFinal = (parseInt(hastaOrig / unDia) - 0) * unDia;
		else if (hastaOrig.getDay() == 0) hastaFinal = (parseInt(hastaOrig / unDia) - 1) * unDia;
		// Calcular la cantidad de horas
		let diferencia = hastaFinal - desdeFinal;
		if (diferencia < 0) diferencia = 0;
		let horasDif = diferencia / unaHora;
		// Averigua la cantidad de horas por fines de semana
		let semanas = parseInt(horasDif / (7 * 24));
		let horasFDS_por_semanas = semanas * 2 * 24;
		let horasFDS_en_semana = desdeOrig.getDay() >= hastaOrig.getDay() ? 2 * 24 : 0;
		let horasFDS = horasFDS_por_semanas + horasFDS_en_semana;
		// Resultado
		let leadTime = parseInt((horasDif - horasFDS) * 100) / 100;
		leadTime = Math.min(96, leadTime);
		// Fin
		return leadTime;
	},
	obtieneTodosLosCamposInclude: function (entidad) {
		// Obtiene la familia
		let familia = this.obtieneFamiliaEnPlural(entidad);

		// Obtiene todos los campos de la familia
		let campos = [...variables.camposRevisar[familia]];

		// Deja solamente los que tienen que ver con la entidad
		let camposEntidad = campos.filter((n) => n[entidad] || n[familia]);

		// Deja solamente los campos con vínculo
		let camposConVinculo = camposEntidad.filter((n) => n.relac_include);

		// Obtiene una matriz con los vínculos
		let includes = camposConVinculo.map((n) => n.relac_include);

		// Fin
		return includes;
	},

	// Conversiones
	obtieneFamiliaEnSingular: (entidad) => {
		return entidad == "peliculas" || entidad == "colecciones" || entidad == "capitulos" || entidad == "prods_edicion"
			? "producto"
			: entidad == "personajes" || entidad == "hechos" || entidad == "valores" || entidad == "rclvs_edicion"
			? "rclv"
			: entidad == "links"
			? "links"
			: "";
	},
	obtieneFamiliaEnPlural: (entidad) => {
		return entidad == "peliculas" || entidad == "colecciones" || entidad == "capitulos" || entidad == "prods_edicion"
			? "productos"
			: entidad == "personajes" || entidad == "hechos" || entidad == "valores" || entidad == "rclvs_edicion"
			? "rclvs"
			: entidad == "links" || entidad == "links_edicion"
			? "links"
			: entidad == "usuarios"
			? "usuarios"
			: "";
	},
	obtieneNombreEdicionDesdeEntidad: (entidad) => {
		return entidad == "peliculas" || entidad == "colecciones" || entidad == "capitulos"
			? "prods_edicion"
			: entidad == "personajes" || entidad == "hechos" || entidad == "valores"
			? "rclvs_edicion"
			: entidad == "links"
			? "links_edicion"
			: "";
	},
	obtieneEntidadNombre: (entidad) => {
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
			: entidad == "valores"
			? "Valor"
			: entidad == "links"
			? "Links"
			: entidad == "usuarios"
			? "Usuarios"
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
			: entidad == "valores"
			? "valor"
			: entidad == "links"
			? "link"
			: "";
	},
	obtieneProdDesdeProducto_id: (edicion) => {
		return edicion.pelicula_id ? "peliculas" : edicion.coleccion_id ? "colecciones" : edicion.capitulo_id ? "capitulos" : "";
	},
	obtieneRCLVdesdeRCLV_id: (edicion) => {
		return edicion.personaje_id ? "personajes" : edicion.hecho_id ? "hechos" : edicion.valor_id ? "valores" : "";
	},
	obtieneEntidadDesdeEntidad_id: function (edicion) {
		let producto = this.obtieneProdDesdeProducto_id(edicion);
		let RCLV = this.obtieneRCLVdesdeRCLV_id(edicion);
		return producto ? producto : RCLV ? RCLV : edicion.link_id ? "links" : "";
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
		return edicion.personaje_id ? "personaje_id" : edicion.hecho_id ? "hecho_id" : edicion.valor_id ? "valor_id" : "";
	},
	obtieneEntidad_idDesdeEntidad: (entidad) => {
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
	convierteLetrasAlCastellano: (resultado) => {
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
					.replace(/ +/g, " ")
					.replace(/[‘“’”«»]/g, '"')
					.replace(/[º]/g, "°")
					.replace(/\t/g, " ")
					.replace(/#/g, "");
			}
		}
		return resultado;
	},
	paises_idToNombre: async (paises_id) => {
		// Función para convertir 'string de ID' en 'string de nombres'
		let paisesNombre = [];
		if (paises_id.length) {
			let BD_paises = await BD_genericas.obtieneTodos("paises", "nombre");
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

	// Fecha y Hora
	ahora: () => {
		return FN_ahora();
	},
	nuevoHorario: (delay, horario) => {
		return nuevoHorario(delay, horario);
	},
	fechaTexto: (fecha) => {
		fecha = new Date(fecha);
		let dia = fecha.getDate();
		let mes = mesesAbrev[fecha.getMonth()];
		let ano = fecha.getFullYear().toString().slice(-2);
		fecha = dia + "/" + mes + "/" + ano;
		return fecha;
	},
	fechaTextoCorta: (fecha) => {
		fecha = new Date(fecha);
		let dia = fecha.getDate();
		let mes = mesesAbrev[fecha.getMonth()];
		fecha = dia + "/" + mes;
		return fecha;
	},
	fechaHorarioTexto: (horario) => {
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
		if (dataEntry.dia_del_ano_id && dataEntry.dia_del_ano_id <= 366) {
			let dia_del_ano = dias_del_ano.find((n) => n.id == dataEntry.dia_del_ano_id);
			dataEntry.dia = dia_del_ano.dia;
			dataEntry.mes_id = dia_del_ano.mes_id;
		}
		// Fin
		return dataEntry;
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
	mueveUnArchivoImagen: function (nombre, origen, destino) {
		let archivoOrigen = "./publico/imagenes/" + origen + "/" + nombre;
		let carpetaDestino = "./publico/imagenes/" + destino + "/";
		let archivoDestino = carpetaDestino + nombre;
		if (!this.averiguaSiExisteUnArchivo(carpetaDestino)) fs.mkdirSync(carpetaDestino);
		if (!this.averiguaSiExisteUnArchivo(archivoOrigen))
			console.log("No se encuentra el archivo " + archivoOrigen + " para moverlo");
		else
			fs.rename(archivoOrigen, archivoDestino, (error) => {
				if (!error) console.log("Archivo de imagen movido a la carpeta " + archivoDestino);
				else throw error;
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
		else console.log("Archivo " + archivo + " no encontrado para borrar");
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
				console.log(error);
				reject("Error");
			});
		});
		// Fin
		return resultado;
	},

	// Tareas diarias y horarias
	horarioLCF: () => {
		// Obtiene la fecha actual - es imprescindible el 'getTime' para poder sumarle las 12 horas luego
		let milisegs = new Date().getTime();

		// Obtiene el horario de la "línea de cambio de fecha"
		let milisegsLCF = milisegs + unaHora * 12;
		horarioLCF = new Date(milisegsLCF);

		// Fin
		return;
	},
	tareasDiarias: async function () {
		// Variables
		let rutaNombre = path.join(__dirname, "fecha.json");
		let info = this.averiguaSiExisteUnArchivo(rutaNombre) ? JSON.parse(fs.readFileSync(rutaNombre, "utf8")) : {};
		let fechaGuardada = info.fechaLCF;
		let fechaReal;

		// Actualiza la fechaReal
		this.horarioLCF();
		fechaReal = horarioLCF.getUTCDate() + "/" + mesesAbrev[horarioLCF.getUTCMonth()];

		// Tareas si cambió la fecha
		if (fechaReal != fechaGuardada) {
			// Actualiza el archivo de la imagen derecha y sus datos
			await this.actualizaImagenDerecha();

			// Actualiza los valores del archivo
			let datos = {
				fechaLCF: fechaReal,
				hora: this.fechaHorarioTexto(),
				tituloImgDerAyer,
				tituloImgDerHoy,
			};
			fs.writeFile(rutaNombre, JSON.stringify(datos), function writeJSON(err) {
				if (err) return console.log(304, err);
			});
		}

		// Fin
		return;
	},
	actualizaImagenDerecha: async function () {
		// Variables
		let imgDerecha;

		// Obtiene el dia_del_ano_id
		let dia = horarioLCF.getUTCDate();
		let mes_id = horarioLCF.getUTCMonth() + 1;
		let dia_del_ano_id = dias_del_ano.find((n) => n.dia == dia && n.mes_id == mes_id).id;

		// Obtiene la imagen derecha
		(() => {
			// Variable de la nueva fecha
			let nuevaFecha_id;
			// Rutina para encontrar la fecha más cercana a la actual, que tenga una imagen
			for (let i = 0; i < banco_de_imagenes.length; i++) {
				// Si terminó el año, continúa desde el 1/ene
				if (dia_del_ano_id + i > 366) i -= 366;
				// Busca una imagen con la fecha
				let imagen = banco_de_imagenes.find((n) => n.dia_del_ano_id == dia_del_ano_id + i);
				// Si la encuentra, termina de buscar
				if (imagen) {
					nuevaFecha_id = imagen.dia_del_ano_id;
					break;
				}
			}

			// Obtiene todos los registros con esa nueva fecha
			let registros = banco_de_imagenes.filter((n) => n.dia_del_ano_id == nuevaFecha_id);
			let indice = parseInt(Math.random() * registros.length);
			if (indice == registros.length) indice--; // Por si justo tocó el '1' en el sorteo
			imgDerecha = registros[indice];
		})();

		// Guarda la nueva imagen
		await (async () => {
			// Actualiza los valores de los títulos de imagenDerecha de ayer y hoy
			tituloImgDerAyer = tituloImgDerHoy;
			tituloImgDerHoy = imgDerecha.nombre;
			// Borra la 'imagenAnterior'
			await this.borraUnArchivo("./publico/imagenes/0-Base", "imgDerechaAyer.jpg");
			// Cambia el nombre del archivo 'imgDerecha' por 'imagenAnterior'
			await this.cambiaElNombreDeUnArchivo("0-Base", "imgDerechaHoy.jpg", "imgDerechaAyer.jpg");
			// Copia la nueva imagen como 'imgDerecha'
			await this.copiaUnArchivoDeImagen("4-Banco-de-imagenes/" + imgDerecha.nombre_archivo, "0-Base/imgDerechaHoy.jpg");
			console.log("Imagen derecha actualizada: " + this.fechaHorarioTexto());
		})();

		// Fin
		return;
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
		// console.log(datos);
		// Variables
		let {avatar, avatar_url, docum_avatar, tamano, esImagen} = datos;
		avatar = avatar ? avatar : avatar_url ? avatar_url : docum_avatar ? docum_avatar : "";
		let ext = path.extname(avatar).toLocaleLowerCase();

		// Mensajes
		let MN_esImagen = esImagen == "NO" ? "El archivo no es una imagen" : "";

		let MN_nombre = !avatar ? "Necesitamos que agregues una imagen" : "";

		let MN_extension = !ext
			? "El archivo debe tener alguna extensión"
			: ![".jpg", ".png", ".jpeg"].includes(ext)
			? "Usaste un archivo con la extensión '" +
			  ext.slice(1).toUpperCase() +
			  "'. Las extensiones válidas son JPG, JPEG y PNG"
			: "";

		let MN_tamano =
			tamano && tamano > 1100000
				? "El archivo tiene " + parseInt(tamano / 10000) / 100 + " MB. Necesitamos que no supere 1 MB"
				: "";

		// Variables
		let respuesta = "";
		// Validaciones
		if (!respuesta) respuesta = MN_esImagen;
		if (!respuesta) respuesta = MN_nombre;
		if (!respuesta) respuesta = MN_extension;
		if (!respuesta) respuesta = MN_tamano;
		// Fin
		return respuesta;
	},
	cartelRepetido: function (datos) {
		// Variables
		// 1. Inicio
		let genero = datos.entidad == "capitulos" ? "o" : "a";
		let inicio = "Est" + genero + " ";

		// 2. Anchor
		let url = "?entidad=" + datos.entidad + "&id=" + datos.id;
		let link = "/" + this.obtieneFamiliaEnSingular(datos.entidad) + "/detalle/" + url;
		let entidadNombre = this.obtieneEntidadNombre(datos.entidad).toLowerCase();
		let entidadHTML = "<u><strong>" + entidadNombre + "</strong></u>";
		let anchor = " <a href='" + link + "' target='_blank'> " + entidadHTML + "</a>";

		// 3. Final
		let final = " ya se encuentra en nuestra base de datos";

		// Fin
		return inicio + anchor + final;
	},

	// Usuarios
	usuarioAumentaPenaliz: (userID, motivo, familia) => {
		// Variables
		let duracion = motivo.duracion;
		let objeto = {};

		// Aumenta la penalización acumulada
		BD_genericas.aumentaElValorDeUnCampo("usuarios", userID, "penalizac_acum", duracion);

		// Si corresponde, que se muestre el cartel de responsabilidad
		if (duracion > 1 && familia) {
			let cartel = "cartel_resp_" + (familia == "productos" ? "prods" : familia);
			objeto[cartel] = true;
		}
		// Si corresponde, se le baja el rol a 'Consultas'
		if (motivo.bloqueo_perm_inputs) objeto.rol_usuario_id = roles_us.find((n) => !n.perm_inputs).id;

		// Si corresponde, actualiza el usuario
		if (Object.keys(objeto).length) BD_genericas.actualizaPorId("usuarios", userID, objeto);

		// Fin
		return;
	},
	usuarioFicha: async (userID, ahora) => {
		// Obtiene los datos del usuario
		let includes = "rol_iglesia";
		let usuario = await BD_genericas.obtienePorIdConInclude("usuarios", userID, includes);
		// Variables
		let unAno = unDia * 365;
		let enviar = {apodo: ["Apodo", usuario.apodo]};
		// Edad
		if (usuario.fecha_nacimiento) {
			let edad = parseInt((ahora - new Date(usuario.fecha_nacimiento).getTime()) / unAno) + " años";
			enviar.edad = ["Edad", edad];
		}
		// Antigüedad
		let antiguedad =
			(parseInt(((ahora - new Date(usuario.creado_en).getTime()) / unAno) * 10) / 10).toFixed(1).replace(".", ",") +
			" años";
		enviar.antiguedad = ["Tiempo en ELC", antiguedad];
		// Rol en la iglesia
		if (usuario.rol_iglesia) enviar.rolIglesia = ["Vocación", usuario.rol_iglesia.nombre];
		// Fin
		return enviar;
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
				datos.origen == "DA" ? "/producto/agregar/datos-adicionales" : datos.origen == "ED" ? "/producto/edicion/" : "/";
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
			let vistaOrigen = "?origen=" + (datos.origen ? datos.origen : "tableroEnts");

			// Obtiene los parámetros de entidad + ID, a inactivar
			let entidadId_inactivar = "&entidad=" + datos.entidad + "&id=" + datos.id;

			// Datos sólo si el origen es 'ED'
			let soloSiOrigenED = datos.origen == "ED" ? "&prodEntidad=" + datos.prodEntidad + "&prodID=" + datos.prodID : "";

			// Fin - Consolida la información
			rutaSalir = rutaOrigen + vistaOrigen + entidadId_inactivar + soloSiOrigenED;
		}
		// Fin
		return rutaSalir;
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
