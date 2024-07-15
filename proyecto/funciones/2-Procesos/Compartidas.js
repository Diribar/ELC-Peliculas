"use strict";
// Definir variables
const nodemailer = require("nodemailer");
const axios = require("axios");

// Exportar
module.exports = {
	// Header
	quickSearch: {
		registros: async (condicion, dato) => {
			// Obtiene los registros
			const registros = await baseDeDatos.obtieneTodosPorCondicionConLimite(dato.entidad, condicion, 10).then((n) =>
				n.map((m) => {
					let respuesta = {
						id: m.id,
						nombre: m[dato.campos[0]],
						entidad: dato.entidad,
						familia: dato.familia,
						avatar: m.avatar, // específicos para PA-Desambiguar
					};
					if (m.anoEstreno) respuesta.anoEstreno = m.anoEstreno;
					if (m.nombreOriginal) respuesta.nombreOriginal = m.nombreOriginal; // específicos para PA-Desambiguar

					return respuesta;
				})
			);

			// Fin
			return registros;
		},
		ediciones: async (condicion, dato) => {
			// Obtiene los registros
			const registros = await baseDeDatos
				.obtieneTodosPorCondicionConLimite(dato.entidad, condicion, 10, dato.include)
				.then((n) =>
					n.map((m) => {
						const entidad = comp.obtieneDesdeCampo_id.entidad(m, dato.entidad);
						const asoc = comp.obtieneDesdeEntidad.asociacion(entidad);
						return {
							entidad,
							id: m[comp.obtieneDesdeEntidad.campo_id(entidad)],
							anoEstreno: m.anoEstreno ? m.anoEstreno : m[asoc].anoEstreno,
							nombre: m[dato.campos[0]] ? m[dato.campos[0]] : m[dato.campos[1]],
							familia: dato.familia,
						};
					})
				);

			// Fin
			return registros;
		},
	},

	// Entidades
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
			return familias == "links"
				? "links"
				: familias == "rclvs"
				? "rclvs"
				: familias == "productos"
				? "prods"
				: familias == "usuarios" // Hace falta para la eliminación de avatars
				? "usuarios"
				: "";
		},
		entidadEdic: (familias) => {
			return familias == "productos"
				? "prodsEdicion"
				: familias == "rclvs"
				? "rclvsEdicion"
				: familias == "links"
				? "linksEdicion"
				: "";
		},
	},
	obtieneDesdeEntidad: {
		familia: (entidad) => {
			return FN.familia(entidad);
		},
		familias: (entidad) => {
			return [...variables.entidades.prods, "prodsEdicion"].includes(entidad)
				? "productos"
				: [...variables.entidades.rclvs, "rclvsEdicion"].includes(entidad)
				? "rclvs"
				: ["links", "linksEdicion"].includes(entidad)
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
		entidadNombre: (entidad) => FN.entidadNombre(entidad),
		delLa: (entidad) => {
			return ["peliculas", "colecciones", "epocasDelAno"].includes(entidad)
				? " de la "
				: ["capitulos", "personajes", "hechos", "temas", "eventos", "links", "usuarios"].includes(entidad)
				? " del "
				: "";
		},
		elLa: (entidad) => {
			return ["peliculas", "colecciones", "epocasDelAno"].includes(entidad)
				? " la "
				: ["capitulos", "personajes", "hechos", "temas", "eventos", "links", "usuarios"].includes(entidad)
				? " el "
				: "";
		},
		oa: (entidad) => (["peliculas", "colecciones", "epocasDelAno"].includes(entidad) ? "a" : "o"),
		ea: (entidad) => (["peliculas", "colecciones", "epocasDelAno"].includes(entidad) ? "a" : "e"),
		unaUn: (entidad) => (["peliculas", "colecciones", "epocasDelAno"].includes(entidad) ? "una" : "un"),
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
				: entidad == "epocasDelAno"
				? "epocaDelAno_id"
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
				: entidad == "epocasDelAno"
				? "epocaDelAno"
				: entidad == "links"
				? "link"
				: "";
		},
		entidadEdic: (entidad) => {
			return variables.entidades.prods.includes(entidad)
				? "prodsEdicion"
				: variables.entidades.rclvs.includes(entidad)
				? "rclvsEdicion"
				: entidad == "links"
				? "linksEdicion"
				: "";
		},
	},
	obtieneDesdeCampo_id: {
		entidadProd: (registro) => {
			return registro.pelicula_id
				? "peliculas"
				: registro.capitulo_id // debe ir antes de la colección por sus ediciones
				? "capitulos"
				: registro.coleccion_id
				? "colecciones"
				: "";
		},
		entidadRCLV: (registro) => {
			return registro.personaje_id
				? "personajes"
				: registro.hecho_id
				? "hechos"
				: registro.tema_id
				? "temas"
				: registro.evento_id
				? "eventos"
				: registro.epocaDelAno_id
				? "epocasDelAno"
				: "";
		},
		entidad: function (registro, familiaEdic) {
			const entProd = this.entidadProd(registro);
			const entRCLV = this.entidadRCLV(registro);

			// Fin
			return familiaEdic == "prodsEdicion"
				? entProd
				: familiaEdic == "rclvsEdicion"
				? entRCLV
				: registro.link_id
				? "links"
				: entProd // debe ir antes de los entRCLV por sus ediciones
				? entProd
				: entRCLV
				? entRCLV
				: "";
		},
		campo_idProd: (registro) => {
			return registro.pelicula_id
				? "pelicula_id"
				: registro.capitulo_id // debe ir antes de la colección por sus ediciones
				? "capitulo_id"
				: registro.coleccion_id
				? "coleccion_id"
				: "";
		},
		campo_idRCLV: (registro) => {
			return registro.personaje_id
				? "personaje_id"
				: registro.hecho_id
				? "hecho_id"
				: registro.tema_id
				? "tema_id"
				: registro.evento_id
				? "evento_id"
				: registro.epocaDelAno_id
				? "epocaDelAno_id"
				: "";
		},
		campo_id: function (registro) {
			// Variables
			const producto_id = this.campo_idProd(registro);
			const rclv_id = this.campo_idRCLV(registro);

			// Fin
			return registro.link_id // debe ir antes de los productos por sus ediciones
				? "link_id"
				: producto_id // debe ir antes de los rclv_id por sus ediciones
				? producto_id
				: rclv_id
				? rclv_id
				: "";
		},
		asocProd: (registro) => {
			return registro.pelicula_id
				? "pelicula"
				: registro.capitulo_id // debe ir antes de la colección por sus ediciones
				? "capitulo"
				: registro.coleccion_id
				? "coleccion"
				: "";
		},
		asocRCLV: (registro) => {
			return registro.personaje_id
				? "personaje"
				: registro.hecho_id
				? "hecho"
				: registro.tema_id
				? "tema"
				: registro.evento_id
				? "evento"
				: registro.epocaDelAno_id
				? "epocaDelAno"
				: "";
		},
		asociacion: function (registro) {
			const producto_id = this.asocProd(registro);
			const rclv_id = this.asocRCLV(registro);
			return registro.link_id
				? "link_id"
				: producto_id // debe ir antes de los rclv_id por sus ediciones
				? producto_id
				: rclv_id
				? rclv_id
				: "";
		},
	},
	puleEdicion: async (entidad, original, edicion) => {
		// Variables
		const familias = comp.obtieneDesdeEntidad.familias(entidad);
		const entidadEdic = comp.obtieneDesdeEntidad.entidadEdic(entidad);
		const edicID = edicion.id;
		let camposNull = {};
		let camposRevisar = [];

		// Obtiene los campos a revisar
		for (let campo of variables.camposRevisar[familias]) {
			// Agrega el campo simple
			camposRevisar.push(campo.nombre);
			// Agrega el campo include
			if (campo.relacInclude) camposRevisar.push(campo.relacInclude);
		}

		// Quita de edición los campos que correspondan
		for (let prop in edicion) {
			// Quita de edición los campos que no se comparan o que sean 'null'
			if (!camposRevisar.includes(prop) || edicion[prop] === null) {
				delete edicion[prop];
				continue;
			}

			// Corrige errores de data-entry
			if (typeof edicion[prop] == "string") edicion[prop] = edicion[prop].trim();

			// CONDICION 1: Los valores de original y edición son significativos e idénticos
			const condic1 =
				edicion[prop] === original[prop] || // son estrictamente iguales
				(typeof original[prop] == "number" && edicion[prop] == original[prop]) || // coincide el número
				(edicion[prop] === "1" && original[prop] === true) || // coincide el boolean
				(edicion[prop] === "0" && original[prop] === false); // coincide el boolean
			if (condic1) camposNull[prop] = null;

			// CONDICION 2: El objeto vinculado tiene el mismo ID
			const condic2 = !!edicion[prop] && !!edicion[prop].id && !!original[prop] && edicion[prop].id === original[prop].id;

			// Si se cumple alguna de las condiciones, se elimina ese método
			if (condic1 || condic2) delete edicion[prop];
		}

		// 3. Acciones en función de si quedan campos
		let quedanCampos = !!Object.keys(edicion).length;
		if (quedanCampos) {
			// Devuelve el id a la variable de edicion
			if (edicID) edicion.id = edicID;

			// Si la edición existe en BD y hubieron campos iguales entre la edición y el original, actualiza la edición
			if (edicID && Object.keys(camposNull).length) await baseDeDatos.actualizaPorId(entidadEdic, edicID, camposNull);
		} else {
			// Convierte en 'null' la variable de 'edicion'
			edicion = null;

			// Si había una edición guardada en la BD, la elimina
			if (edicID) await baseDeDatos.eliminaPorId(entidadEdic, edicID);
		}

		// Fin
		return edicion;
	},

	// Productos y RCLVs
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
			const {avatarUrl, tamano, esImagen, imgOpcional} = datos;
			const avatar = datos.avatar ? datos.avatar : avatarUrl ? avatarUrl : "";
			const ext = avatar ? path.extname(avatar).toLowerCase() : "";

			// Respuesta
			const respuesta = avatar // Mensajes si existe un avatar
				? esImagen == "NO" // Valida si es una imagen
					? "El archivo no es una imagen"
					: !ext // Valida la extensión
					? "El archivo debe tener alguna extensión"
					: ![".jpg", ".png", ".jpeg"].includes(ext)
					? "Usaste un archivo con la extensión '" +
					  ext.slice(1).toUpperCase() +
					  "'. Las extensiones válidas son JPG, JPEG y PNG"
					: tamano && tamano > tamMaxImagen // Valida el tamaño
					? "El archivo tiene " + parseInt(tamano / 10000) / 100 + " MB. Necesitamos que no supere 1 MB"
					: ""
				: imgOpcional == "NO" || imgOpcional === false // Mensajes si no existe un avatar
				? "Necesitamos que agregues una imagen"
				: "";

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
			let ea = ["capitulos", "links"].includes(entidad) ? "e" : "a";
			let inicio = "Est" + ea + " ";

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
		// Obtiene todos los campos de la familia
		const familias = this.obtieneDesdeEntidad.familias(entidad);
		const camposFamilia = [...variables.camposRevisar[familias]];

		// Obtiene los campos include
		const camposEntidad = camposFamilia.filter((n) => n[entidad] || n[familias]);
		const camposInclude = camposEntidad.filter((n) => n.relacInclude);

		// Genera un array con las asociaciones
		const asociaciones = camposInclude.map((n) => n.relacInclude);

		// Fin
		return asociaciones;
	},
	valorNombre: (valor, alternativa) => {
		return valor ? valor.nombre : alternativa;
	},
	nombresPosibles: (registro) => {
		return registro.nombreCastellano
			? registro.nombreCastellano
			: registro.nombreOriginal
			? registro.nombreOriginal
			: registro.nombre
			? registro.nombre
			: "";
	},
	sinProblemasDeCaptura: function (familia, revID) {
		// Variables
		const ahora = this.fechaHora.ahora();
		const haceUnaHora = this.fechaHora.nuevoHorario(-1, ahora);
		const haceDosHoras = this.fechaHora.nuevoHorario(-2, ahora);

		// Fin
		return familia.filter(
			(n) =>
				// Que no esté capturado
				!n.capturadoEn ||
				// Que esté capturado hace más de dos horas
				n.capturadoEn < haceDosHoras ||
				// Que la captura haya sido por otro usuario y hace más de una hora
				(n.capturadoPor_id != revID && n.capturadoEn < haceUnaHora) ||
				// Que la captura haya sido por otro usuario y esté inactiva
				(n.capturadoPor_id != revID && !n.capturaActiva) ||
				// Que esté capturado por este usuario hace menos de una hora
				(n.capturadoPor_id == revID && n.capturadoEn > haceUnaHora)
		);
	},
	quickSearchCondics: (palabras, campos, userID, original) => {
		// Variables
		let todasLasPalabrasEnAlgunCampo = [];

		// Convierte las palabras en un array
		palabras = palabras.split(" ");

		// Rutina para cada campo
		for (let campo of campos) {
			// Variables
			let palabrasEnElCampo = [];

			// Dónde debe buscar cada palabra dentro del campo
			for (let palabra of palabras) {
				const palabraEnElCampo = {
					[Op.or]: [
						{[campo]: {[Op.like]: palabra + "%"}}, // En el comienzo del texto
						{[campo]: {[Op.like]: "% " + palabra + "%"}}, // En el comienzo de una palabra
					],
				};
				palabrasEnElCampo.push(palabraEnElCampo);
			}

			// Exige que cada palabra del conjunto esté presente
			const todasLasPalabrasEnElCampo = {[Op.and]: palabrasEnElCampo};

			// Consolida el resultado
			todasLasPalabrasEnAlgunCampo.push(todasLasPalabrasEnElCampo);
		}

		// Se fija que 'la condición de palabras' se cumpla en alguno de los campos
		const condicPalabras = {[Op.or]: todasLasPalabrasEnAlgunCampo};

		// Se fija que el registro esté en statusAprobado, o status 'creados_ids' y por el usuario
		const condicStatus = {
			[Op.or]: [{statusRegistro_id: aprobados_ids}, {[Op.and]: [{statusRegistro_id: creado_id}, {creadoPor_id: userID}]}],
		};

		// Se fija que una edición sea del usuario
		const condicEdicion = {editadoPor_id: userID};

		// Fin
		return {[Op.and]: [condicPalabras, original ? condicStatus : condicEdicion]};
	},
	obtieneRegs: async (campos) => {
		// Variables
		const {entidades} = campos;
		let lecturas = [];
		let resultados = [];

		// Obtiene el resultado por entidad
		for (let entidad of entidades) lecturas.push(FN.lecturaBD({entidad, ...campos}));
		await Promise.all(lecturas).then((n) => n.map((m) => resultados.push(...m)));

		if (resultados.length) {
			resultados = resultados.map((n) => {
				const fechaRef = campos.campoFecha ? n[campos.campoFecha] : n.statusSugeridoEn;
				const fechaRefTexto = comp.fechaHora.diaMes(fechaRef);
				return {...n, fechaRef, fechaRefTexto};
			});

			// Ordena los resultados
			resultados.sort((a, b) => new Date(b.fechaRef) - new Date(a.fechaRef));
		}

		// Fin
		return resultados;
	},

	// Productos
	eliminaRepetidos: (prods) => {
		// Variables
		let resultado = [];

		// Agrega los nuevos
		for (let prod of prods) if (!resultado.find((n) => n.id == prod.id && n.entidad == prod.entidad)) resultado.push(prod);

		// Fin
		return resultado;
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
	linksEnProd: async function ({entidad, id}) {
		// Variables
		const campo_id = this.obtieneDesdeEntidad.campo_id(entidad); // entidad del producto
		const lectura = await baseDeDatos.obtieneTodosPorCondicion("links", {[campo_id]: id});

		// Obtiene las películas y trailers
		const linksTrailers = lectura.filter((n) => n.tipo_id == linkTrailer_id);
		const linksPelis = lectura.filter((n) => n.tipo_id == linkPelicula_id);
		const linksHD = linksPelis.filter((n) => n.calidad >= 720);

		// Averigua qué links tiene
		const tiposDeLink = {
			// Trailer
			linksTrailer: FN.averiguaTipoDeLink(linksTrailers),

			// Películas
			linksGral: FN.averiguaTipoDeLink(linksPelis),
			linksGratis: FN.averiguaTipoDeLink(linksPelis, "gratuito"),
			linksCast: FN.averiguaTipoDeLink(linksPelis, "castellano"),
			linksSubt: FN.averiguaTipoDeLink(linksPelis, "subtitulos"),

			// Películas HD
			HD_Gral: FN.averiguaTipoDeLink(linksHD),
			HD_Gratis: FN.averiguaTipoDeLink(linksHD, "gratuito"),
			HD_Cast: FN.averiguaTipoDeLink(linksHD, "castellano"),
			HD_Subt: FN.averiguaTipoDeLink(linksHD, "subtitulos"),
		};

		// Actualiza el registro
		await baseDeDatos.actualizaPorId(entidad, id, tiposDeLink); // con 'await', para que dé bien el cálculo para la colección

		// Fin
		return;
	},
	linksEnColec: async (colID) => {
		// Variables
		const campos = variables.calidadLinks;
		const condicion = {coleccion_id: colID, statusRegistro_id: activos_ids};

		// Obtiene los capítulos de la colección
		const capitulos = await baseDeDatos
			.obtieneTodosPorCondicion("capitulos", condicion)
			.then((n) => n.sort((a, b) => a.capitulo - b.capitulo)) // los ordena por capitulo
			.then((n) => n.sort((a, b) => a.temporada - b.temporada)); // los ordena por temporada
		if (!capitulos.length) return;

		// Actualiza cada campo de la colección
		for (let campo of campos) {
			// Variables
			const capSinLink = capitulos.find((n) => n[campo] == sinLinks); // busca un capítulo que no tenga link
			const capTalVez = capitulos.find((n) => n[campo] == linksTalVez);
			const capConLinks = capitulos.find((n) => n[campo] == conLinks);

			// Obtiene los resultados
			const tieneLink = capSinLink ? sinLinks : capTalVez ? linksTalVez : capConLinks ? conLinks : null;
			const capID = capSinLink ? capSinLink.id : null;

			// Actualiza el campo de la colección
			baseDeDatos.actualizaPorId("colecciones", colID, {[campo]: tieneLink});
			baseDeDatos.actualizaTodosPorCondicion("capsSinLink", {coleccion_id: colID}, {[campo]: capID});
		}

		// Fin
		return;
	},

	// RCLVs
	canonNombre: (rclv) => {
		// Variables
		let canonNombre = "";

		// Averigua si el rclv tiene algún "proceso de canonización"
		if (rclv.canon_id && rclv.canon_id != "NN") {
			// Obtiene los procesos de canonización
			const proceso = canons.find((m) => m.id == rclv.canon_id);

			// Asigna el nombre del proceso
			canonNombre = proceso[rclv.genero_id] + " ";

			// Verificación si el nombre del proceso es "Santo" (varón)
			if (rclv.canon_id == "ST" && rclv.genero_id == "MS") {
				// Obtiene el primer nombre del rclv
				const primerNombre = rclv.nombre.split(" ")[0];

				// Si el primer nombre no es "especial", cambia el prefijo por "San"
				if (!variables.prefijosSanto.includes(primerNombre)) canonNombre = "San ";
			}
		}

		// Fin
		return canonNombre;
	},
	filtrosConsTemas: async () => {
		// Variables
		const condicion = {statusRegistro_id: aprobados_ids, id: {[Op.gt]: 10}};
		const includes = [...variables.entidades.prods];

		// Obtiene los registros asociados con productos
		const temas = await baseDeDatos
			.obtieneTodosPorCondicion("temas", condicion, includes)
			.then((n) => n.filter((m) => includes.some((p) => m[p].length)))
			.then((n) => n.map((m) => ({id: m.id, nombre: m.nombre, cant: includes.reduce((acum, n) => acum + m[n].length, 0)})))
			.then((n) => n.sort((a, b) => (a.nombre < b.nombre ? -1 : 1)));

		// Fin
		return temas;
	},
	prodsEnRCLV: async ({entidad, id}) => {
		// Variables
		const entidadesProds = variables.entidades.prods;
		const statusAprobado = {statusRegistro_id: aprobado_id};
		const statusValido = {statusRegistro_id: {[Op.ne]: inactivo_id}};
		let prodsAprob;

		// Si el ID es menor o igual a 10, termina la función
		if (id && id <= 10) return;

		// Establece la condición perenne
		const rclv_id = comp.obtieneDesdeEntidad.campo_id(entidad);
		const condicion = {[rclv_id]: id};

		// 1. Averigua si existe algún producto aprobado, con ese rclv_id
		for (let entidadProd of entidadesProds) {
			prodsAprob = await baseDeDatos.obtienePorCondicion(entidadProd, {...condicion, ...statusAprobado});
			if (prodsAprob) {
				prodsAprob = conLinks;
				break;
			}
		}

		// 2. Averigua si existe algún producto en status provisorio, con ese rclv_id
		if (!prodsAprob)
			for (let entidadProd of entidadesProds) {
				prodsAprob = await baseDeDatos.obtienePorCondicion(entidadProd, {...condicion, ...statusValido});
				if (prodsAprob) {
					prodsAprob = linksTalVez;
					break;
				}
			}

		// 3. Averigua si existe alguna edición con ese rclv_id
		if (!prodsAprob && (await baseDeDatos.obtienePorCondicion("prodsEdicion", condicion))) prodsAprob = linksTalVez;

		// 4. No encontró ningún caso
		if (!prodsAprob) prodsAprob = sinLinks;

		// Actualiza el campo en el RCLV
		baseDeDatos.actualizaPorId(entidad, id, {prodsAprob});

		// Fin
		return;
	},
	actualizaSolapam: async () => {
		// Variables
		let espera = [];

		// Actualiza tablas
		espera.push(baseDeDatos.actualizaTodos("epocasDelAno", {solapamiento: false}));
		espera.push(baseDeDatos.actualizaTodos("fechasDelAno", {epocaDelAno_id: 1}));
		espera = await Promise.all(espera).then(() => []);

		// Obtiene tablas
		let epocasDelAno = baseDeDatos.obtieneTodosPorCondicion("epocasDelAno", {diasDeDuracion: {[Op.ne]: null}});
		let fechasDelAnoSolap = baseDeDatos.obtieneTodos("fechasDelAno");
		[epocasDelAno, fechasDelAnoSolap] = await Promise.all([epocasDelAno, fechasDelAnoSolap]);

		// Rutina para cada registro de epocaDelAno
		for (let epocaDelAno of epocasDelAno) {
			// Variables
			const {id: epocaDelAno_id, anoFM} = epocaDelAno;
			let restar = 0;
			let solapamiento;

			// Revisa si en algún día hay solapamiento
			for (let i = 0; i < epocaDelAno.diasDeDuracion; i++) {
				// Si se completó el año, lo resta
				if (!restar && epocaDelAno.fechaDelAno_id + i > 366) restar = 366;

				// Se fija si la 'fechaDelAno' tiene un valor trivial para 'epocaDelAno_id'
				const indice = epocaDelAno.fechaDelAno_id - 1 + i - restar; // se resta '1' porque el id tiene esa diferencia con el índice del array
				const fechaDelAno = fechasDelAnoSolap[indice];
				fechaDelAno.epocaDelAno_id == 1
					? (fechasDelAnoSolap[indice] = {...fechaDelAno, epocaDelAno_id: epocaDelAno.id}) // en caso positivo le asigna el id de la epocaDelAno
					: (solapamiento = true); // en caso negativo no lo completa, y le asigna 'true' a 'solapamiento de 'epocaDelAno'
			}

			// Si corresponde, actualiza el solapamiento en la tabla - es crítico su 'await'
			if (solapamiento) espera.push(baseDeDatos.actualizaPorId("epocasDelAno", epocaDelAno.id, {solapamiento: true}));

			// Actualiza la tabla 'fechasDelAno'
			const IDs = fechasDelAnoSolap.filter((n) => n.epocaDelAno_id == epocaDelAno.id).map((n) => n.id); // obtiene los IDs de las fechas de la epocaDelAno
			if (IDs.length) espera.push(baseDeDatos.actualizaPorId("fechasDelAno", IDs, {epocaDelAno_id, anoFM})); // actualiza los registros de esos IDs
		}
		espera = await Promise.all(espera);

		// Actualiza la variable 'fechasDelAno'
		fechasDelAno = await baseDeDatos.obtieneTodos("fechasDelAno", "epocaDelAno");

		// Fin
		return;
	},

	// Links
	prodAprobEnLink: (links) => {
		// Rutina por link
		for (let link of links) {
			// Averigua el status de su producto
			const statusProd = link.pelicula
				? link.pelicula.statusRegistro_id
				: link.coleccion
				? link.coleccion.statusRegistro_id
				: link.capitulo
				? link.capitulo.statusRegistro_id
				: null;
			if (!statusProd) continue;

			// Actualiza el campo prodAprob a 'true' o 'false'
			const prodAprob = aprobados_ids.includes(statusProd);
			baseDeDatos.actualizaPorId("links", link.id, {prodAprob});
		}

		// Fin
		return;
	},

	linksVencPorSem: {
		actualizaFechaVencim: async function (links) {
			// Variables
			let espera = [];

			// Si no se especificaron links, obtiene todos los aprobados que no tengan 'fechaVencim'
			if (!links) {
				const condicion = {statusRegistro_id: aprobado_id, fechaVencim: null};
				const include = variables.entidades.asocProds;
				links = await baseDeDatos.obtieneTodosPorCondicion("links", condicion, include);
			}

			// Rutina por link
			for (let link of links) {
				// Calcula la fechaVencim - primRev o reciente o null, 4 sems
				const desde = link.statusSugeridoEn.getTime();
				const linksVU = [linksVU_primRev, linksVU_estrRec, linksVU_estandar];
				const categoria_id = this.categoria_id(link);
				const fechaVencim = new Date(desde + linksVU[categoria_id]);

				// Se actualiza el link con el anoEstreno y la fechaVencim
				const asocProd = comp.obtieneDesdeCampo_id.asocProd(link);
				const anoEstreno = link[asocProd].anoEstreno;
				espera.push(baseDeDatos.actualizaPorId("links", link.id, {anoEstreno, fechaVencim, categoria_id}));
			}
			await Promise.all(espera);

			// Fin
			await this.actualizaStatusVencido();
			return;
		},
		actualizaStatusVencido: async function () {
			// Variables
			const fechaDeCorte = new Date(lunesDeEstaSemana + unaSemana);
			const ahora = new Date();

			// Condiciones y nuevo status
			const condicion = {fechaVencim: {[Op.lt]: fechaDeCorte}, statusRegistro_id: aprobado_id};
			const novedades = {
				statusSugeridoPor_id: usAutom_id,
				statusRegistro_id: creadoAprob_id,
				statusSugeridoEn: ahora,
			};

			// Actualiza las novedades de los links
			await baseDeDatos.actualizaTodosPorCondicion("links", condicion, novedades);

			// Fin
			await this.actualizaLVPS();
			return;
		},
		actualizaLVPS: async function () {
			// Variables - Links vencidos por semana
			if (!semanaUTC) this.variablesSemanales(); // para asegurarse de tener el 'primerLunesDelAno' y la 'semanaUTC'
			cantLinksVencPorSem = {}; // elimina los datos anteriores

			// Obtiene todos los links con producto aprobado y en status distinto a inactivo
			const condicion = {statusRegistro_id: {[Op.ne]: inactivo_id}, prodAprob: true};
			const links = await baseDeDatos.obtieneTodosPorCondicion("links", condicion);

			// Cantidad de 'linksAprob' por semana
			const linksAprob = links.filter((n) => n.statusRegistro_id == aprobado_id);
			FN.cantLinksAprobPorSemana(linksAprob);

			// Links a revisar
			const linksRevisar = links.filter((n) => n.statusRegistro_id != aprobado_id);
			const linksSinLimite = linksRevisar.filter((n) => n.categoria_id != linksEstandar_id); // links de corto plazo
			const linksConLimite = linksRevisar.filter((n) => n.categoria_id == linksEstandar_id); // links de plazo estándar

			// Links con límite - capitulos
			const capitulosRegs = linksConLimite.filter((n) => n.capitulo_id);
			const capitulos = capitulosRegs.filter((n) => n.statusRegistro_id == creadoAprob_id).length;
			const irCapitulos = capitulosRegs.length - capitulos; // inactivarRecuperar

			// Links con límite - pelisColes
			const pelisColesRegs = linksConLimite.filter((n) => !n.capitulo_id);
			const pelisColes = pelisColesRegs.filter((n) => n.statusRegistro_id == creadoAprob_id).length;
			const irPelisColes = pelisColesRegs.length - pelisColes; // inactivarRecuperar

			// Promedio semanal para links 'estándar'
			const linksEstandar = links.filter((n) => n.categoria_id == linksEstandar_id);
			const capitulosPromSem = Math.trunc(linksEstandar.filter((n) => n.capitulo_id).length / linksSemsEstandar);
			const pelisColesPromSem = Math.trunc(linksEstandar.filter((n) => n.capitulo_id).length / linksSemsEstandar);

			// Otros datos
			const sinLimite = linksSinLimite.length;
			const prods = linksRevisar.length;
			cantLinksVencPorSem["0"] = {
				...{pelisColes, capitulos, sinLimite, irPelisColes, irCapitulos, prods},
				...{capitulosPromSem, pelisColesPromSem},
			};

			// Fin
			this.paramsVencPorSem();
			return;
		},
		paramsVencPorSem: () => {
			// Averigua la cantidad total de pendientes
			const {capitulos: capsPends, capitulosPromSem, irCapitulos, sinLimite} = cantLinksVencPorSem[0];
			const {pelisColes: pelisColesPends, pelisColesPromSem, irPelisColes} = cantLinksVencPorSem[0];

			// Averigua la cantidad de links que se pueden agregar cada semana
			let capsPosibles = 0;
			let pelisColesPosibles = 0;
			for (let semana = linksSemsPrimRev + 1; semana < linksSemsEstandar; semana++) {
				capsPosibles += Math.max(0, capitulosPromSem - cantLinksVencPorSem[semana].capitulos); // todos menos la última semana
				pelisColesPosibles += Math.max(0, pelisColesPromSem - cantLinksVencPorSem[semana].pelisColes); // todos menos la última semana
			}

			// Averigua la combinación entre 'posibles' y 'pendientes'
			const capsParaProc = Math.min(capsPosibles, capsPends + irCapitulos); // Averigua la cantidad para procesar
			const pelisColesParaProc = Math.min(pelisColesPosibles, pelisColesPends + irPelisColes); // Averigua la cantidad para procesar

			// Agrega la información
			const paraProc = {
				pelisColes: pelisColesParaProc,
				capitulos: capsParaProc,
				prods: pelisColesParaProc + capsParaProc + sinLimite,
			};
			cantLinksVencPorSem = {
				...cantLinksVencPorSem,
				paraProc,
				prodsPromSem: capitulosPromSem + pelisColesPromSem,
			};

			// Fin
			return;
		},
		categoria_id: (link) => {
			// Variables
			const anoReciente = anoHoy - linkAnoReciente;
			const asocProd = comp.obtieneDesdeCampo_id.asocProd(link);
			const anoEstreno = link[asocProd] ? link[asocProd].anoEstreno : link.anoEstreno;

			// Fin
			return link.statusRegistro_id == creado_id
				? linksPrimRev_id
				: anoEstreno && anoEstreno > anoReciente && link.tipo_id != linkTrailer_id
				? linksEstrRec_id
				: linksEstandar_id;
		},
	},

	// Usuarios
	penalizacAcum: (userID, motivo, petitFamilias) => {
		// Variables
		let penalizac = motivo.penalizac;
		let objeto = {};

		// Aumenta la penalización acumulada
		baseDeDatos.aumentaElValorDeUnCampo("usuarios", userID, "penalizacAcum", penalizac);

		// Si corresponde, que se muestre el cartel de responsabilidad
		if (penalizac > 1 && petitFamilias) {
			let cartel = "cartel_resp_" + petitFamilias;
			objeto[cartel] = true;
		}
		// Si corresponde, se le baja el rol a 'Consultas'
		if (motivo.codigo == "bloqueoInput") objeto.rolUsuario_id = rolConsultas_id;

		// Si corresponde, actualiza el usuario
		if (Object.keys(objeto).length) baseDeDatos.actualizaPorId("usuarios", userID, objeto);

		// Fin
		return;
	},
	obtieneUsuarioPorMail: async (email) => {
		const include = ["rolUsuario", "statusRegistro", "genero"];
		const usuario = await baseDeDatos.obtienePorCondicion("usuarios", {email}, include);
		return usuario;
	},

	// Varias
	letras: {
		convierteAlIngles: (resultado) => {
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
		convierteAlCastell: function (objeto) {
			// Rutina por campo
			for (let prop in objeto)
				if (typeof objeto[prop] == "string") objeto[prop] = this.convierteAlCastell_campo(objeto[prop]);
				else if (objeto[prop] === undefined) delete objeto[prop];

			// Fin
			return objeto;
		},
		convierteAlCastell_campo: (valor) => {
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
				.replace(/[òôõōðōŏőöø]/g, "o")
				.replace(/ó/g, "ó")
				.replace(/[ÖŒ]/g, "Oe")
				.replace(/[œ]/g, "oe")
				.replace(/[ŔŖŘ]/g, "R")
				.replace(/[ŕŗř]/g, "r")
				.replace(/[ŚŜŞŠ]/g, "S")
				.replace(/[śŝşšș]/g, "s")
				.replace(/[ŢŤŦȚ]/g, "T")
				.replace(/[țţťŧ]/g, "t")
				.replace(/[ÙÛŨŪŬŮŰŲ]/g, "U")
				.replace(/[ùûũūŭůűų]/g, "u")
				.replace(/Ŵ/g, "W")
				.replace(/ŵ/g, "w")
				.replace(/[ÝŶŸ]/g, "Y")
				.replace(/[ýŷÿ]/g, "y")
				.replace(/[ŽŹŻŽ]/g, "Z")
				.replace(/[žźżž]/g, "z")
				.replace(/[“”«»]/g, '"')
				.replace(/[‘’`]/g, "'")
				.replace(/[º]/g, "°")
				.replace(/[  ®​​#]/g, "")
				.replace(/–/g, "-")
				.replace("[", "(")
				.replace("]", ")")
				.replace(/\t/g, " ") // previene el uso de 'tab'
				.replace(/\n/g, " ") // previene el uso de 'return'
				.replace(/\r/g, " ") // previene el uso de 'return'
				.replace(/ +/g, " "); // previene el uso de varios espacios
		},
		inicialMayus: (texto) => texto.slice(0, 1).toUpperCase() + texto.slice(1),
		oa: (usuario) => (usuario.genero_id == "F" ? "a " : "o "),
		laLo: (registro) => {
			return !registro.genero_id
				? "lo"
				: (registro.genero_id.startsWith("F") ? "la" : "lo") + (registro.genero_id.endsWith("P") ? "s" : "");
		},
	},
	fechaHora: {
		ahora: () => {
			return FN.ahora();
		},
		nuevoHorario: (delay, horario) => {
			return FN.nuevoHorario(delay, horario);
		},
		diaMes: (fecha) => {
			fecha = new Date(fecha);
			let dia = fecha.getUTCDate();
			let mes = mesesAbrev[fecha.getUTCMonth()];
			fecha = dia + "/" + mes;
			return fecha;
		},
		diaMesAno: function (fecha) {
			fecha = new Date(fecha);
			let ano = fecha.getUTCFullYear().toString().slice(-2);
			return this.diaMes(fecha) + "/" + ano;
		},
		anoMesDia: (fecha) => {
			fecha = new Date(fecha).toISOString().slice(0, 10);
			return fecha;
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
		fechaDelAno: (dataEntry) => {
			let datos = {};
			if (dataEntry.fechaDelAno_id && dataEntry.fechaDelAno_id <= 366) {
				let fechaDelAno = fechasDelAno.find((n) => n.id == dataEntry.fechaDelAno_id);
				datos.dia = fechaDelAno.dia;
				datos.mes_id = fechaDelAno.mes_id;
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
			// Si no existe la carpeta, la crea
			const provisorio = carpetaExterna + "9-Provisorio";
			if (!this.existe(provisorio)) fs.mkdirSync(provisorio);

			// Fin
			return;
		},
		elimina: function (ruta, archivo, output) {
			// Arma el nombre del archivo
			let rutaNombre = path.join(ruta, archivo);
			output = true;

			// Se fija si encuentra el archivo
			if (this.existe(rutaNombre)) {
				// Borra el archivo
				fs.unlinkSync(rutaNombre);
				// Avisa que lo borra
				if (output) console.log("Archivo '" + rutaNombre + "' borrado");
			}
			// Mensaje si no lo encuentra
			else if (output) console.log("Archivo " + rutaNombre + " no encontrado para borrar");

			// Fin
			return;
		},
		descarga: async function (url, rutaYnombre, output) {
			// Carpeta donde descargar
			const ruta = rutaYnombre.slice(0, rutaYnombre.lastIndexOf("/"));
			if (!this.existe(ruta)) fs.mkdirSync(ruta);

			// Realiza la descarga
			let writer = fs.createWriteStream(rutaYnombre);
			let response = await axios({method: "GET", url, responseType: "stream"});
			response.data.pipe(writer);

			// Obtiene el resultado de la descarga
			let resultado = await new Promise((resolve, reject) => {
				writer.on("finish", () => {
					const nombre = rutaYnombre.slice(rutaYnombre.lastIndexOf("/") + 1);
					if (output) console.log("Imagen '" + nombre + "' descargada");
					resolve("OK");
				});
				writer.on("error", (error) => {
					console.log("Error en la descarga", error);
					reject("Error");
				});
			});
			// Fin
			return resultado;
		},
		mueveImagen: function (nombre, origen, destino, output) {
			// Variables
			let archivoOrigen = carpetaExterna + origen + "/" + nombre;
			let carpetaDestino = carpetaExterna + destino + "/";
			let archivoDestino = carpetaDestino + nombre;

			// Si no existe la carpeta de destino, la crea
			if (!this.existe(carpetaDestino)) fs.mkdirSync(carpetaDestino);

			// Si no encuentra el archivo de origen, lo avisa
			if (!this.existe(archivoOrigen)) console.log("No se encuentra el archivo " + archivoOrigen + " para moverlo");
			// Mueve el archivo
			else
				fs.renameSync(archivoOrigen, archivoDestino, (error) => {
					if (!error) {
						if (output) console.log("Archivo de imagen movido a la carpeta " + archivoDestino);
					} else throw error;
				});

			// Fin
			return;
		},
		copiaImagen: function (archivoOrigen, archivoDestino, output) {
			// Variables
			const nombreOrigen = (!archivoOrigen.includes("/publico/") ? carpetaExterna : "") + archivoOrigen;
			const nombreDestino = (!archivoDestino.includes("/publico/") ? carpetaExterna : "") + archivoDestino;
			const carpetaDestino = nombreDestino.slice(0, nombreDestino.lastIndexOf("/"));

			// Acciones
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
			const archivos = fs.readdirSync(carpeta);

			// Elije al azar el n° de imagen
			const indice = parseInt(Math.random() * archivos.length);

			// Genera el nombre del archivo
			const imagenAlAzar = archivos[indice];

			// Fin
			return imagenAlAzar;
		},
	},
	enviaMail: async function ({email, asunto, comentario}) {
		// create reusable transporter object using the default SMTP transport
		const {host, puerto, user, pass} = process.env;
		const transporter = nodemailer.createTransport({host, port: Number(puerto), secure: true, auth: {user, pass}});
		// secure: true for 465, false for other ports

		// Datos
		const datos = {
			from: "'ELC - Películas' <" + user + ">",
			to: email,
			subject: asunto,
			html: comentario,
		};

		// Envío del mail
		const mailEnviado = await transporter
			.sendMail(datos)
			.then(() => true)
			.catch((error) => {
				console.log("Mail no enviado. ", error);
				return false;
			});

		// Fin
		return mailEnviado;
	},
	reqBasePathUrl: (req) => {
		// Obtiene los resultados
		const baseUrl = req.baseUrl
			? req.baseUrl
			: req.path.startsWith("/revision/usuarios")
			? "/revision/usuarios"
			: req.path.startsWith("/producto/agregar")
			? "/producto/agregar"
			: req.path.slice(0, req.path.indexOf("/", 1));
		const ruta = req.path.startsWith(baseUrl) ? req.path.replace(baseUrl, "") : req.path;
		const url = req.url.startsWith(baseUrl) ? req.url.replace(baseUrl, "") : req.url;

		// Fin
		return {baseUrl, ruta, url};
	},
	variablesSemanales: function () {
		FN.primerLunesDelAno();

		// Otras variables
		semanaUTC = parseInt((Date.now() - primerLunesDelAno) / unDia / 7) + 1;
		lunesDeEstaSemana = primerLunesDelAno + (semanaUTC - 1) * unaSemana;

		// Fin
		return;
	},
};

// Funciones
let FN = {
	ahora: () => new Date(new Date().toUTCString()), // <-- para convertir en 'horario local'
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
			? "Evento en el Año"
			: entidad == "epocasDelAno"
			? "Época del Año"
			: entidad == "links"
			? "Link"
			: entidad == "usuarios"
			? "Usuarios"
			: "";
	},
	familia: (entidad) => {
		return [...variables.entidades.prods, "prodsEdicion"].includes(entidad)
			? "producto"
			: [...variables.entidades.rclvs, "rclvsEdicion"].includes(entidad)
			? "rclv"
			: ["links", "linksEdicion"].includes(entidad)
			? "link"
			: "";
	},
	primerLunesDelAno: function (fecha) {
		// Obtiene el primer día del año
		fecha = fecha ? new Date(fecha) : new Date();
		const diferenciaHoraria = (fecha.getTimezoneOffset() / 60) * unaHora;
		const comienzoAnoUTC = new Date(fecha.getUTCFullYear(), 0, 1).getTime() - diferenciaHoraria;

		// Obtiene el dia de semana del primer día del año (domingo: 0, sábado: 6)
		const diaSemComienzoAnoUTC = new Date(comienzoAnoUTC).getUTCDay();

		// Obtiene el primer lunes del año
		let diasAdicsPorLunes = 1 - diaSemComienzoAnoUTC;
		if (diasAdicsPorLunes < 0) diasAdicsPorLunes += 7;
		primerLunesDelAno = comienzoAnoUTC + diasAdicsPorLunes * unDia;

		// Fin
		if (primerLunesDelAno > fecha.getTime()) this.primerLunesDelAno(fecha.getTime() - unaSemana);
		return;
	},
	averiguaTipoDeLink: (links, condicion) => {
		// Filtro inicial
		if (condicion) links = links.filter((n) => n[condicion]);

		// Resultados
		let resultado = {
			SI: links.filter((n) => aprobados_ids.includes(n.statusRegistro_id)).length, // en status creadoAprob o aprobado
			linksTalVez: links.filter((n) => n.statusRegistro_id != inactivo_id).length, // en un status distinto a inactivo
		};

		// Fin
		return resultado.SI ? conLinks : resultado.linksTalVez ? linksTalVez : sinLinks;
	},
	cantLinksAprobPorSemana: (links) => {
		// Se asegura de tener un valor para cada semana y entidad
		for (let i = 1; i <= linksSemsEstandar; i++) cantLinksVencPorSem[i] = {capitulos: 0, pelisColes: 0};

		// Crea las semanas dentro de la variable
		for (let link of links) {
			// Obtiene la semana de vencimiento
			const fechaVencim = new Date(link.fechaVencim).getTime();
			const semVencim = parseInt((fechaVencim - lunesDeEstaSemana) / unaSemana); // es la semana relativa a la semana actual
			if (semVencim < 1 || semVencim > linksSemsEstandar) continue; // saltea la semana actual y las que tengan un error

			// Agrega al conteo
			const entidad = link.capitulo_id ? "capitulos" : "pelisColes";
			cantLinksVencPorSem[semVencim][entidad]++;
		}

		// Fin
		return;
	},
	lecturaBD: async ({entidad, status_id, campoFecha, campoRevID, include, revID}) => {
		// Variables
		const haceUnaHora = comp.fechaHora.nuevoHorario(-1);
		const haceDosHoras = comp.fechaHora.nuevoHorario(-2);
		if (!revID) revID = 0;

		// Condiciones de captura
		const condicsCaptura = [
			{capturadoEn: null}, // Que no esté capturado
			{capturadoEn: {[Op.lt]: haceDosHoras}}, // Que esté capturado hace más de dos horas
			{capturadoPor_id: {[Op.ne]: revID}, capturadoEn: {[Op.lt]: haceUnaHora}}, // Que la captura haya sido por otro usuario y hace más de una hora
			{capturadoPor_id: {[Op.ne]: revID}, capturaActiva: {[Op.ne]: 1}}, // Que la captura haya sido por otro usuario y esté inactiva
			{capturadoPor_id: revID, capturadoEn: {[Op.gt]: haceUnaHora}}, // Que esté capturado por este usuario hace menos de una hora
		];

		// Condiciones
		let condicion = {
			statusRegistro_id: status_id, // Con status según parámetro
			[Op.and]: [{[Op.or]: condicsCaptura}], // Es necesario el [Op.and], porque luego se le agregan condiciones
		};
		if (campoFecha) {
			if (campoRevID) {
				// Que esté propuesto por el usuario
				const condicsUsuario = [{[campoRevID]: [revID, usAutom_id]}, {[campoFecha]: {[Op.lt]: haceUnaHora}}];
				condicion[Op.and].push({[Op.or]: condicsUsuario});
			}
			// Que esté propuesto hace más de una hora
			else condicion[campoFecha] = {[Op.lt]: haceUnaHora};
		}

		// Excluye los registros RCLV cuyo ID es <= 10
		if (variables.entidades.rclvs.includes(entidad)) condicion.id = {[Op.gt]: 10};

		// Resultado
		const resultados = baseDeDatos
			.obtieneTodosPorCondicion(entidad, condicion, include)
			.then((n) => n.map((m) => ({...m, entidad})));

		// Fin
		return resultados;
	},
};
