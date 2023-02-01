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
	includes: (familia) => {
		// Obtiene todos los campos
		let campos = [...variables.camposRevisar[familia]];
		// Deja solamente los campos con vínculo
		let camposConVinculo = campos.filter((n) => n.relac_include);
		// Obtiene los vínculos
		let includes = camposConVinculo.map((n) => n.relac_include);
		// Fin
		return includes;
	},

	// ABM de registros
	creaRegistro: async ({entidad, datos, userID}) => {
		datos.creado_por_id = userID;
		let id = await BD_genericas.agregaRegistro(entidad, datos).then((n) => n.id);
		// if (entidad == "links" && datos.gratuito==1) procesosLinks.prodCampoLG(datos.prodEntidad, datos.prodID);
		return id;
	},
	actualizaRegistro: async ({entidad, id, datos}) => {
		await BD_genericas.actualizaPorId(entidad, id, datos);
		// if (entidad == "links") procesosLinks.prodCampoLG(datos.prodEntidad, datos.prodID);
		return "Registro original actualizado";
	},
	inactivaRegistro: async (entidad, entidad_id, userID, motivo_id) => {
		// Obtiene el status_id de 'inactivar'
		let inactivarID = await BD_genericas.obtienePorCampos("status_registro", {inactivar: true}).then(
			(n) => n.id
		);
		// Preparar los datos
		let datos = {
			sugerido_por_id: userID,
			sugerido_en: FN_ahora(),
			motivo_id,
			status_registro_id: inactivarID,
		};
		// Actualiza el registro 'original' en la BD
		await BD_genericas.actualizaPorId(entidad, entidad_id, datos);
	},

	// Conversiones
	obtieneFamiliaEnSingular: (entidad) => {
		return entidad == "peliculas" ||
			entidad == "colecciones" ||
			entidad == "capitulos" ||
			entidad == "prods_edicion"
			? "producto"
			: entidad == "personajes" ||
			  entidad == "hechos" ||
			  entidad == "valores" ||
			  entidad == "rclvs_edicion"
			? "rclv"
			: entidad == "links"
			? "links"
			: "";
	},
	obtieneFamiliaEnPlural: (entidad) => {
		return entidad == "peliculas" ||
			entidad == "colecciones" ||
			entidad == "capitulos" ||
			entidad == "prods_edicion"
			? "productos"
			: entidad == "personajes" ||
			  entidad == "hechos" ||
			  entidad == "valores" ||
			  entidad == "rclvs_edicion"
			? "rclvs"
			: entidad == "links" || entidad == "links_edicion"
			? "links"
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
	obtieneEntidadSingular: (entidad) => {
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
	obtieneProdDesdeEntidad_id: (edicion) => {
		return edicion.pelicula_id
			? "peliculas"
			: edicion.coleccion_id
			? "colecciones"
			: edicion.capitulo_id
			? "capitulos"
			: "";
	},
	obtieneRCLVdesdeEntidad_id: (edicion) => {
		return edicion.personaje_id
			? "personajes"
			: edicion.hecho_id
			? "hechos"
			: edicion.valor_id
			? "valores"
			: "";
	},
	obtieneEntidadDesdeEntidad_id: function (edicion) {
		let producto = this.obtieneProdDesdeEntidad_id(edicion);
		let RCLV = this.obtieneRCLVdesdeEntidad_id(edicion);
		return producto ? producto : RCLV ? RCLV : edicion.link_id ? "links" : "";
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
	obtieneEntidadProd_id: (edicion) => {
		return edicion.pelicula_id
			? "pelicula_id"
			: edicion.coleccion_id
			? "coleccion_id"
			: edicion.capitulo_id
			? "capitulo_id"
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

	// Gestión de archivos
	averiguaSiExisteUnArchivo: (archivo) => {
		return archivo && fs.existsSync(archivo);
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
	cambiaElNombreDeUnArchivo: function (ruta, nombreOrig, nombreFinal) {
		ruta = "./publico/imagenes/" + ruta + "/";
		if (!this.averiguaSiExisteUnArchivo(ruta + nombreOrig))
			console.log("No se encuentra el archivo " + nombreOrig + " para cambiarle el nombre");
		else
			fs.rename(ruta + nombreOrig, ruta + nombreFinal, (error) => {
				if (!error) console.log("Archivo " + nombreOrig + " renombrado como " + nombreFinal);
				else throw error;
			});
	},
	copiaUnArchivoDeImagen: function (archivoOrigen, archivoDestino) {
		let nombreOrigen = "./publico/imagenes/" + archivoOrigen;
		let nombreDestino = "./publico/imagenes/" + archivoDestino;
		let carpetaDestino = nombreDestino.slice(0, nombreDestino.lastIndexOf("/"));
		if (!this.averiguaSiExisteUnArchivo(carpetaDestino)) fs.mkdirSync(carpetaDestino);
		if (!this.averiguaSiExisteUnArchivo(nombreOrigen))
			console.log("No se encuentra el archivo " + archivoOrigen + " para copiarlo");
		else
			fs.copyFile(nombreOrigen, nombreDestino, (error) => {
				if (!error)
					console.log("Archivo " + archivoOrigen + " copiado a la carpeta " + archivoDestino);
				else throw error;
			});
	},
	borraUnArchivo: async function (ruta, archivo) {
		// Arma el nombre del archivo
		let rutaArchivo = path.join(ruta, archivo);

		// Se fija si encuentra el archivo
		if (this.averiguaSiExisteUnArchivo(rutaArchivo)) {
			// Borra el archivo
			await fs.unlinkSync(rutaArchivo);
			// Avisa que lo borra
			console.log("Archivo '" + archivo + "' borrado");
		}
		// Mensaje si no lo encuentra
		else console.log("Archivo " + archivo + " no encontrado para borrar");
		// Fin
		return;
	},
	descarga: async (url, rutaYnombre) => {
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
				console.log("Imagen '" + nombre + "' guardada");
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
		let info = JSON.parse(fs.readFileSync(rutaNombre, "utf8"));
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
		let dia_del_ano_id, banco_de_imagenes, imgDerecha;

		// Obtiene dia_del_ano_id y el banco_de_imagenes
		await (async () => {
			let dia = horarioLCF.getDate();
			let mes_id = horarioLCF.getMonth() + 1;
			let datos = {dia, mes_id};
			dia_del_ano_id = BD_genericas.obtienePorCampos("dias_del_ano", datos).then((n) => n.id);

			// Obtiene la tabla de 'banco_de_imagenes'
			banco_de_imagenes = BD_genericas.obtieneTodos("banco_imagenes", "dia_del_ano_id").then((n) =>
				n.map((n) => {
					return {
						dia_del_ano_id: n.dia_del_ano_id,
						nombre_archivo: n.nombre_archivo,
						nombre: n.nombre,
					};
				})
			);
			// Espera a recibir la info
			[dia_del_ano_id, banco_de_imagenes] = await Promise.all([dia_del_ano_id, banco_de_imagenes]);
		})();

		// Obtiene la imagen derecha
		(() => {
			for (let i = 0; i < banco_de_imagenes.length; i++) {
				if (dia_del_ano_id + i > 366) i -= 366;
				imgDerecha = banco_de_imagenes.find((n) => n.dia_del_ano_id == dia_del_ano_id + i);
				if (imgDerecha) break;
			}
			// Obtiene el dia_del_ano_id con imagen
			dia_del_ano_id = imgDerecha.dia_del_ano_id;
			// Obtiene todos los registros con ese 'dia_del_ano_id'
			let registros = banco_de_imagenes.filter((n) => n.dia_del_ano_id == dia_del_ano_id);
			let indice = parseInt(Math.random() * registros.length);
			if (indice == registros.length) indice--;
			imgDerecha = registros[indice];
		})();

		// Actualiza los valores de los títulos de imagenDerecha de ayer y hoy
		tituloImgDerAyer = tituloImgDerHoy;
		tituloImgDerHoy = imgDerecha.nombre;

		// 1. Borra la 'imagenAnterior'
		await this.borraUnArchivo("./publico/imagenes/0-Base", "imgDerechaAyer.jpg");
		// 2. Cambia el nombre del archivo 'imgDerecha' por 'imagenAnterior'
		await this.cambiaElNombreDeUnArchivo("0-Base", "imgDerechaHoy.jpg", "imgDerechaAyer.jpg");
		// Copia la nueva imagen como 'imgDerecha'
		await this.copiaUnArchivoDeImagen(
			"4-Banco-de-imagenes/" + imgDerecha.nombre_archivo,
			"0-Base/imgDerechaHoy.jpg"
		);
		console.log(482, this.ahora());
		// Fin
		return;
	},

	// Validaciones
	inputVacio: "Necesitamos que completes este campo",
	selectVacio: "Necesitamos que elijas un valor",
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
			(parseInt(((ahora - new Date(usuario.creado_en).getTime()) / unAno) * 10) / 10)
				.toFixed(1)
				.replace(".", ",") + " años";
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
						iconos: [
							{nombre: "fa-rotate-right", link: req.originalUrl, titulo: "Volver a intentarlo"},
						],
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
		let resultado = !hayConexionInternet.OK
			? hayConexionInternet
			: !mailEnviado.OK
			? mailEnviado
			: {OK: true};

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
		for (let prod of prods)
			if (!resultado.find((n) => n.id == prod.id && n.entidad == prod.entidad)) resultado.push(prod);
		// Fin
		return resultado;
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
