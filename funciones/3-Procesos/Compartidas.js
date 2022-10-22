"use strict";
// Definir variables
const nodemailer = require("nodemailer");
const BD_genericas = require("../2-BD/Genericas");
const BD_especificas = require("../2-BD/Especificas");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const variables = require("./Variables");

// Exportar ------------------------------------
module.exports = {
	// Temas de Entidades
	quitarCamposSinContenido: (objeto) => {
		for (let campo in objeto) if (objeto[campo] === null || objeto[campo] === "") delete objeto[campo];
		return objeto;
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

	// Temas de Edición
	pulirEdicion: function (original, edicion) {
		// Funciones
		let quitarLosCamposQueNoSeComparan = (edicion, ent) => {
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
		};
		let quitarLasCoincidenciasConOriginal = (original, edicion) => {
			// Eliminar campo si:
			// - edición tiene un valor significativo y coincide con el original (se usa '==' porque unos son texto y otros número)
			// - edición es estrictamente igual al original
			for (let campo in edicion)
				if (
					(edicion[campo] && edicion[campo] == original[campo]) ||
					edicion[campo] === original[campo]
				)
					delete edicion[campo];
			return edicion;
		};
		let quedanCampos = (datos) => {
			// Averiguar si queda algún campo
			return !!Object.keys(datos).length;
		};
		// Pulir la información a tener en cuenta
		edicion = this.quitarCamposSinContenido(edicion);
		edicion = quitarLosCamposQueNoSeComparan(edicion, "Prod");
		//edicion = this.corregirErroresComunesDeEscritura(edicion); // Hacer
		edicion = quitarLasCoincidenciasConOriginal(original, edicion);
		// Fin
		return [edicion, quedanCampos(edicion)];
	},
	accionesSiNoQuedanCampos: async function (prodOrig, prodEdic) {
		// Variables
		let statusAprob = false;
		let ahora = comp.ahora();
		// 1. Elimina el registro de la edición
		await BD_genericas.eliminarPorId("prod_edicion", prodEdic.id);
		// 2. Averigua si tiene errores
		let entidadOrig = this.obtieneEntidadDesdeEdicion(prodEdic);
		let errores = await validar.consolidado(null, {...prodOrig, entidad: entidadOrig});
		// 2. Acciones si el original no tiene errores y está en status 'gr_creado'
		if (!errores.hay && prodOrig.status_registro.gr_creado) {
			// Genera la información a actualizar en el registro original
			let datos = {
				alta_terminada_en: funcionAhora(),
				lead_time_creacion: this.obtenerLeadTime(prodOrig.creado_en, ahora),
				status_registro_id: await BD_especificas.obtenerELC_id("status_registro", {aprobado: 1}),
			};
			// Cambia el status del producto e inactiva la captura
			await BD_genericas.actualizarPorId(entidadOrig, prodOrig.id, {...datos, captura_activa: 0});
			// Si es una colección, le cambia el status también a los capítulos
			if (entidadOrig == "colecciones") {
				datos = {...datos, alta_analizada_por_id: 2, alta_analizada_en: ahora}; // Amplía los datos
				BD_genericas.actualizarTodosPorCampos("capitulos", {coleccion_id: prodOrig.id}, datos); // Actualiza el status de los capitulos
			}
			// Cambia el valor de la variable que se informará
			statusAprob = true;
		}
		return statusAprob;
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
		let quedanCampos;
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

	// Conversiones
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
	nombreAvatar: (prodOrig, prodEdic) => {
		return prodEdic.avatar
			? "/imagenes/4-ProdsRevisar/" + prodEdic.avatar
			: prodOrig.avatar
			? !prodOrig.avatar.startsWith("http")
				? "/imagenes/3-Productos/" + prodOrig.avatar
				: prodOrig.avatar
			: "/imagenes/8-Agregar/IM.jpg";
	},

	// Validaciones
	inicialMayuscula: (dato) => {
		let formato = /^[A-ZÁÉÍÓÚÜÑ]/;
		return !formato.test(dato) ? "La primera letra debe ser en mayúscula" : "";
	},
	inicialEspeciales: (dato) => {
		let formato = /^[¡¿"\d]/;
		return !formato.test(dato);
	},
	cartelVacio: "Necesitamos que completes este campo",
	longitud: (dato, corto, largo) => {
		return dato.length < corto
			? "El contenido debe ser más largo"
			: dato.length > largo
			? "El contenido debe ser más corto"
			: "";
	},
	extension: (nombre) => {
		if (!nombre) return "";
		let ext = path.extname(nombre);
		if (ext) ext = ext.slice(1).toUpperCase();
		return !ext || ![".jpg", ".png", ".jpeg"].includes(ext)
			? "Usaste un archivo con la extensión '" + ext + "'. Las extensiones válidas son JPG, JPEG y PNG"
			: "";
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
			if (!IDs.includes(prod.id)) IDs.push(prods[i].id);
			else prods.splice(i, 1);
		return prods;
	},
	usuario_Ficha: async (userID, ahora) => {
		// Obtener los datos del usuario
		let includes = "rol_iglesia";
		let usuario = await BD_genericas.obtenerPorIdConInclude("usuarios", userID, includes);
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
	obtenerProdsDeLinks: function (links, ahora, userID) {
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
		productos = limpiezaProds(productos, ahora, userID);
		// Fin
		return productos;
	},
	limpiezaProds: (productos, ahora, userID) => {
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
