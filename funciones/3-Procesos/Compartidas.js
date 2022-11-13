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
	// Temas de Entidades
	quitaCamposSinContenido: (objeto) => {
		for (let campo in objeto) if (objeto[campo] === null || objeto[campo] === "") delete objeto[campo];
		return objeto;
	},
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

	// Temas de Edición
	puleEdicion: function (original, edicion) {
		// Funciones
		let quitaCamposQueNoSeComparan = (edicion) => {
			// Variables
			let familia = this.obtieneFamiliaEnPlural(edicion.entidad);
			let campos = [];
			// Obtiene los campos a comparar
			variables.camposRevisar[familia].forEach((campo) => {
				campos.push(campo.nombre);
				if (campo.relac_include) campos.push(campo.relac_include);
			});
			// Quitar de edicion los campos que no se comparan
			for (let campo in edicion) if (!campos.includes(campo)) delete edicion[campo];
			// Fin
			return edicion;
		};
		let quitaCoincidenciasConOriginal = (original, edicion) => {
			// Eliminar campo si se cumple alguno de estos:
			// - Edición tiene un valor significativo y coincide con el original (se usa '==' porque unos son texto y otros número)
			// - Edición es estrictamente igual al original
			for (let campo in edicion)
				if (
					(edicion[campo] && edicion[campo] == original[campo]) ||
					edicion[campo] === original[campo]
				)
					delete edicion[campo];
			return edicion;
		};
		// Variables
		edicion = {...edicion}; // Ojo acá, es una prueba aver si sale bien
		// Pulir la información a tener en cuenta
		edicion = this.quitaCamposSinContenido(edicion);
		edicion = quitaCamposQueNoSeComparan(edicion);
		edicion = quitaCoincidenciasConOriginal(original, edicion);
		// Averigua si queda algún campo
		let quedanCampos = !!Object.keys(edicion).length;
		// Fin
		return [edicion, quedanCampos];
	},

	// ABM de registros
	creaRegistro: async (entidad, datos, userID) => {
		datos.creado_por_id = userID;
		let id = await BD_genericas.agregarRegistro(entidad, datos).then((n) => n.id);
		// if (entidad == "links" && datos.gratuito==1) procesosLinks.prodCampoLG(datos.prodEntidad, datos.prodID);
		return id;
	},
	actualizaRegistro: async (entidad, id, datos) => {
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
			sugerido_en: funcionAhora(),
			motivo_id,
			status_registro_id: inactivarID,
		};
		// Actualiza el registro 'original' en la BD
		await BD_genericas.actualizaPorId(entidad, entidad_id, datos);
	},
	guardaEdicion: async function (entidadOrig, entidadEdic, original, edicion, userID) {
		// Variables
		edicion = {...edicion, entidad: entidadEdic};
		// Si existe una edición de ese original y de ese usuario --> lo elimina
		let entidad_id = this.obtieneEntidad_id(entidadOrig);
		let objeto = {[entidad_id]: original.id, editado_por_id: userID};
		let registroEdic = await BD_genericas.obtienePorCampos(entidadEdic, objeto);
		if (registroEdic) await BD_genericas.eliminaPorId(entidadEdic, registroEdic.id);
		// Quita las coincidencias con el original
		let quedanCampos;
		[edicion, quedanCampos] = this.puleEdicion(original, edicion);
		// Averigua si hay algún campo con novedad
		if (!quedanCampos) return "Edición sin novedades respecto al original";
		// Completa la información
		edicion = {...edicion, [entidad_id]: original.id, editado_por_id: userID};
		// Agrega la nueva edición
		await BD_genericas.agregarRegistro(entidadEdic, edicion);
		// Fin
		return "Edición guardada";
	},

	// Conversiones
	obtieneFamiliaEnSingular: (entidad) => {
		return entidad == "peliculas" || entidad == "colecciones" || entidad == "capitulos"
			? "producto"
			: entidad == "personajes" || entidad == "hechos" || entidad == "valores"
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
			? "RCLVs"
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
			: entidad.includes("personaje")
			? "Personaje"
			: entidad.includes("hecho")
			? "Hecho"
			: entidad.includes("valor")
			? "Valor"
			: entidad == "links"
			? "Links"
			: entidad == "usuarios"
			? "Usuarios"
			: "";
	},
	obtieneEntidad_id: (entidad) => {
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
	obtieneEntidadDesdeEdicion: (edicion) => {
		return edicion.pelicula_id
			? "peliculas"
			: edicion.coleccion_id
			? "colecciones"
			: edicion.capitulo_id
			? "capitulos"
			: edicion.personaje_id
			? "personajes"
			: edicion.hecho_id
			? "hechos"
			: edicion.valor_id
			? "valores"
			: edicion.link_id
			? "links"
			: "";
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

	// Fecha y Hora
	ahora: () => {
		return funcionAhora();
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
	fechaHorarioTexto: (horario) => {
		horario = horario ? new Date(horario) : funcionAhora();
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
			console.log("No se encuentra el archivo " + archivoOrigen);
		else
			fs.rename(archivoOrigen, archivoDestino, (error) => {
				if (!error) console.log("Archivo de imagen movido a la carpeta " + archivoDestino);
				else throw error;
			});
	},
	borraUnArchivo: function (ruta, archivo) {
		// Arma el nombre del archivo
		let rutaArchivo = path.join(ruta, archivo);

		// Se fija si encuentra el archivo
		if (this.averiguaSiExisteUnArchivo(rutaArchivo)) {
			// Borra el archivo
			fs.unlinkSync(rutaArchivo);
			// Avisa que lo borra
			console.log("Archivo '" + archivo + "' borrado");
		}
		// Mensaje si no lo encuentra
		else console.log("Archivo " + archivo + " no encontrado");
		// Fin
		return;
	},
	revisaLaImagen: (tipo, tamano) => {
		let tamanoMaximo = 2;
		return !tipo.startsWith("image/")
			? "Necesitamos un archivo de imagen"
			: parseInt(tamano) > tamanoMaximo * Math.pow(10, 6)
			? "El tamaño del archivo es superior a " + tamanoMaximo + " MB, necesitamos uno más pequeño"
			: "";
	},
	descarga: async (url, rutaYnombre) => {
		// Carpeta donde descargar
		let ruta = rutaYnombre.slice(0, rutaYnombre.lastIndexOf("/"));
		if (!fs.existsSync(ruta)) fs.mkdirSync(ruta);
		// Realiza la descarga
		let writer = fs.createWriteStream(rutaYnombre);
		let response = await axios({method: "GET", url, responseType: "stream"});
		response.data.pipe(writer);
		// Obtiene el resultado de la descarga
		let resultado = await new Promise((resolve, reject) => {
			writer.on("finish", () => {
				console.log("Imagen guardada");
				resolve("OK");
			});
			writer.on("error", (error) => {
				console.log(error);
				reject(error)
			});
		});
		// Fin
		return resultado;
	},
	avatarOrigEdic: (prodOrig, prodEdic) => {
		let aux1 = prodOrig.avatar.startsWith("http");
		let aux2 = aux1 ? prodOrig.avatar : "/imagenes/3-Productos/" + prodOrig.avatar;
		let orig = prodOrig.avatar ? aux2 : "/imagenes/8-Agregar/IM.jpg";
		let edic = prodEdic.avatar ? "/imagenes/4-ProdsRevisar/" + prodEdic.avatar : orig;
		// Fin
		return {orig, edic};
	},
	nombreAvatar: (prodOrig, prodEdic) => {
		return prodEdic.avatar
			? "/imagenes/4-ProdsRevisar/" + prodEdic.avatar
			: prodOrig.avatar
			? prodOrig.avatar.startsWith("http")
				? prodOrig.avatar
				: "/imagenes/3-Productos/" + prodOrig.avatar
			: "/imagenes/8-Agregar/IM.jpg";
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
			let formato = /^[a-záéíóúüñ ,.']+$/i;
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
		let {avatar, tamano, esImagen} = datos;
		// Funciones
		let FN_nombre = () => {
			return !avatar && esImagen == "SI" ? "Necesitamos que agregues una imagen" : "";
		};
		let FN_extension = () => {
			if (!avatar) return "";
			let ext = path.extname(avatar).toLocaleLowerCase();
			return !ext
				? "El archivo debe tener alguna extensión"
				: ![".jpg", ".png", ".jpeg"].includes(ext)
				? "Usaste un archivo con la extensión '" +
				  ext.slice(1).toUpperCase() +
				  "'. Las extensiones válidas son JPG, JPEG y PNG"
				: "";
		};
		let FN_tamano = () => {
			return tamano && tamano > 1100000
				? "El archivo tiene " + parseInt(tamano / 10000) / 100 + " MB. Necesitamos que no supere 1 MB"
				: "";
		};
		let FN_esImagen = () => {
			return esImagen == "NO" ? "El archivo no es una imagen" : "";
		};
		// Variables
		let respuesta = "";
		// Validaciones
		if (!respuesta) respuesta = FN_nombre();
		if (!respuesta) respuesta = FN_extension();
		if (!respuesta) respuesta = FN_tamano();
		if (!respuesta) respuesta = FN_esImagen();
		// Fin
		return respuesta;
	},
	cartelRepetido: function (datos) {
		return (
			"Este/a <a href='/" +
			this.obtieneFamiliaEnSingular(datos.entidad) +
			"/detalle/?entidad=" +
			datos.entidad +
			"&id=" +
			datos.id +
			"' target='_blank'><u><strong>" +
			this.obtieneEntidadNombre(datos.entidad).toLowerCase() +
			"</strong></u></a> ya se encuentra en nuestra base de datos"
		);
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
		// datos.to = "diegoiribarren2015@gmail.com";
		// await transporter.sendMail(datos);
	},
	valorNombre: (valor, alternativa) => {
		return valor ? valor.nombre : alternativa;
	},
	eliminarRepetidos: (prods) => {
		let IDs = [];
		for (let i = prods.length - 1; i >= 0; i--)
			if (!IDs.includes(prods[i].id)) IDs.push(prods[i].id);
			else prods.splice(i, 1);
		return prods;
	},
	usuario_Ficha: async (userID, ahora) => {
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
	obtieneProdsDeLinks: function (links, ahora, userID) {
		// Variables
		let peliculas = [];
		let colecciones = [];
		let capitulos = [];
		// Abrir los productos por entidad
		links.forEach((link) => {
			if (link.pelicula) peliculas.push({entidad: "peliculas", ...link.pelicula});
			if (link.coleccion) colecciones.push({entidad: "colecciones", ...link.coleccion});
			if (link.capitulo) capitulos.push({entidad: "capitulos", ...link.capitulo});
		});
		// Eliminar repetidos
		if (peliculas.length) peliculas = this.eliminarRepetidos(peliculas);
		if (colecciones.length) colecciones = this.eliminarRepetidos(colecciones);
		if (capitulos.length) capitulos = this.eliminarRepetidos(capitulos);
		// Consolidar
		let productos = [...peliculas, ...colecciones, ...capitulos];
		// Depurar los productos que no cumplen ciertas condiciones
		let limpiezaProds = (productos, ahora, userID) => {
			// Variables
			// Declarar las variables
			const aprobado_id = status_registro.find((n) => n.aprobado).id;
			const haceUnaHora = nuevoHorario(-1, ahora);
			const haceDosHoras = nuevoHorario(-2, ahora);
			// Dejar solamente los productos aprobados
			productos = productos.filter((n) => n.status_registro_id == aprobado_id);
			// Dejar solamente los productos creados hace más de una hora
			productos = productos.filter((n) => n.creado_en < haceUnaHora);
			// Dejar solamente los productos que no tengan problemas de captura
			productos = productos.filter(
				(n) =>
					// Que no esté capturado
					!n.capturado_en ||
					// Que esté capturado hace más de dos horas
					n.capturado_en < haceDosHoras ||
					// Que la captura haya sido por otro usuario y hace más de una hora
					(n.capturado_por_id != userID && n.capturado_en < haceUnaHora) ||
					// Que la captura haya sido por otro usuario y esté inactiva
					(n.capturado_por_id != userID && !n.captura_activa) ||
					// Que esté capturado por este usuario hace menos de una hora
					(n.capturado_por_id == userID && n.capturado_en > haceUnaHora)
			);
			return productos;
		};
		productos = limpiezaProds(productos, ahora, userID);
		// Fin
		return productos;
	},
	procesarRCLV: async (datos) => {
		// Variables
		let DE = {};
		// Estandarizar los campos como 'null'
		variables.camposRCLV[datos.entidad].forEach((campo) => {
			DE[campo] = null;
		});
		// Nombre
		DE.nombre = datos.nombre;
		// Día del año
		if (!datos.desconocida)
			DE.dia_del_ano_id = await BD_genericas.obtieneTodos("dias_del_ano", "id")
				.then((n) => n.find((m) => m.mes_id == datos.mes_id && m.dia == datos.dia))
				.then((n) => n.id);
		// Año
		if (datos.entidad != "valores") DE.ano = datos.ano;
		// Datos para personajes
		if (datos.entidad == "personajes") {
			// Datos sencillos
			DE.apodo = datos.apodo;
			DE.sexo_id = datos.sexo_id;
			DE.categoria_id = datos.categoria_id;
			if (datos.categoria_id == "CFC") {
				// subcategoria_id
				let santo_beato =
					datos.enProcCan == "1" &&
					(datos.proceso_id.startsWith("ST") || datos.proceso_id.startsWith("BT"));
				DE.subcategoria_id =
					datos.jss == "1" ? "JSS" : datos.cnt == "1" ? "CNT" : santo_beato ? "HAG" : "HIG";
				// Otros
				if (datos.enProcCan == "1") DE.proceso_id = datos.proceso_id;
				if (datos.ap_mar == "1") DE.ap_mar_id = datos.ap_mar_id;
				DE.rol_iglesia_id = datos.rol_iglesia_id;
			}
		}
		if (datos.entidad == "hechos") {
			DE.hasta = datos.hasta;
			DE.solo_cfc = datos.solo_cfc;
			if (datos.solo_cfc == "1") {
				DE.jss = datos.ano > 33 || datos.hasta < 0 ? 0 : 1;
				DE.cnt = datos.ano > 100 || datos.hasta < 0 ? 0 : 1;
				DE.exclusivo = datos.ano >= 0 && datos.hasta <= 100 ? 1 : 0;
				DE.ap_mar = datos.ap_mar;
			}
		}
		return DE;
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
