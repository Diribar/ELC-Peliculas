"use strict";
// Definir variables
const nodemailer = require("nodemailer");
const axios = require("axios");

// Exportar
module.exports = {
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
		// Familia y derivados
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
				: entidad == "ediciones"
				? "edics"
				: "";
		},
		siglaFam: (entidad) => {
			return [...variables.entidades.prods, "prodsEdicion"].includes(entidad)
				? "p"
				: [...variables.entidades.rclvs, "rclvsEdicion"].includes(entidad)
				? "r"
				: entidad == "usuarios"
				? "u"
				: "";
		},
		entidadNombre: (entidad) => FN.entidadNombre(entidad),
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

		// Masculino / Femenino
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
	},
	obtieneDesdeCampo_id: {
		// Entidad
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

		// campo_id
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

		// Asociación
		asocProd: (registro) => FN.asocProd(registro),
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
	obtieneDesdeAsoc: {
		// Entidad
		entidad: (asoc) => {
			const indice = [...variables.entidades.asocProdsRclvs].indexOf(asoc);
			const entidad = indice > -1 ? [...variables.entidades.prodsRclvs][indice] : null;
			return entidad;
		},
		entidadNombre: (asoc) => {
			const indice = [...variables.entidades.asocProds, ...variables.entidades.asocRclvs].indexOf(asoc);
			const entNombre =
				indice > -1 ? [...variables.entidades.prodsNombre, ...variables.entidades.rclvsNombre][indice] : null;
			return entNombre;
		},

		// Masculino y Femenino
		oa: (asoc) => (["pelicula", "coleccion", "epocaDelAno"].includes(asoc) ? "a" : "o"),
		a: (asoc) => (["pelicula", "coleccion", "epocaDelAno"].includes(asoc) ? "a" : ""),
	},
	obtieneEntidadDesdeUrl: (req) => {
		// Lo obtiene del path
		const {entidad} = req.params;
		if (entidad) return entidad;

		// Lo obtiene del baseUrl
		let baseUrl = req.baseUrl.slice(1);
		const indice = baseUrl.indexOf("/");
		if (indice > -1) baseUrl = baseUrl.slice(0, indice);
		return baseUrl;
	},
	// Productos y RCLVs
	puleEdicion: async function (entidad, original, edicion) {
		// Variables
		const familias = this.obtieneDesdeEntidad.familias(entidad);
		const entidadEdic = this.obtieneDesdeEntidad.entidadEdic(entidad);
		const edicID = edicion.id;
		let camposNull = {};
		let camposRevisar = [];

		// Obtiene los campos a revisar
		for (let campo of variables.camposRevisar[familias]) {
			// Saltea los campos que corresponda
			if (campo.exclusivo && !campo.exclusivo.includes(entidad)) continue;

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
					? "El archivo tiene " + Math.ceil((tamano / tamMaxImagen) * 100) / 100 + " MB. Necesitamos que no supere 1 MB"
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
			const entidadNombre = (datos.entidadNombre ? datos.entidadNombre : FN.entidadNombre(entidad)).toLowerCase(); // la primera opción es para links

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
	valorNombre: (valor, alternativa) => (valor ? valor.nombre : alternativa),
	nombresPosibles: (registro) => FN.nombresPosibles(registro),
	obtieneRegs: async function (campos) {
		// Obtiene los resultados
		let resultados = await FN.obtieneRegs(campos);

		// Quita los comprometidos por capturas
		resultados = await this.sinProblemasDeCaptura(resultados, campos.revId);

		// Fin
		return resultados;
	},
	sinProblemasDeCaptura: async (prodsRclvs, revId) => {
		// Variables
		const haceUnaHora = FN.nuevoHorario(-1);
		const haceDosHoras = FN.nuevoHorario(-2);

		// Obtiene las capturas ordenadas por fecha decreciente
		const capturas = await baseDeDatos.obtieneTodosConOrden("capturas", "capturadoEn", true);

		// Flitra según los criterios de captura
		prodsRclvs = prodsRclvs.filter((prodRclv) => {
			// Restricciones si está recién creado
			if (
				prodRclv.statusRegistro_id == creado_id && // está en status 'creado'
				![revId, usAutom_id].includes(prodRclv.creadoPor_id) && // no fue creado por el usuario ni en forma automática
				prodRclv.statusSugeridoEn > haceUnaHora // fue creado hace menos de una hora
			)
				return false;

			// Sin captura vigente
			const capturaProdRclv = capturas.filter((m) => m.entidad == prodRclv.entidad && m.entidad_id == prodRclv.id);
			if (
				!capturaProdRclv.length || // no está capturado
				capturaProdRclv[0].capturadoEn < haceDosHoras // la captura más reciente fue hace más de dos horas
			)
				return true;

			// Con captura activa
			const activa = capturaProdRclv.find((m) => m.activa);
			if (
				activa && // existe una captura activa
				((activa.capturadoPor_id == revId && activa.capturadoEn > haceUnaHora) || // fue hecha por este usuario, hace menos de una hora
					(activa.capturadoPor_id != revId && activa.capturadoEn < haceUnaHora)) // fue hecha por otro usuario, hace más de una hora
			)
				return true;

			// Sin captura activa
			const esteUsuario = capturaProdRclv.find((m) => m.capturadoPor_id == revId);
			if (
				!activa && // sin captura activa
				(!esteUsuario || // sin captura por este usuario
					esteUsuario.capturadoEn > haceUnaHora) // con captura de este usuario hace menos de una hora
			)
				return true;

			// Fin
			return false;
		});

		// Fin
		return prodsRclvs;
	},
	actualizaStatusErrores: {
		consolidado: async function () {
			// Variables
			const ultsHist = await this.ultsRegsHistStatus();

			// Comparaciones
			const histRegEnt = await this.historialVsProdRclv(ultsHist); // Historial vs registro de la entidad
			const regEntHist = await this.prodRclvVsHistorial(ultsHist, histRegEnt); // Registro de la entidad vs historial

			// Consolida
			statusErrores = [histRegEnt, regEntHist].flat();

			// Fin
			return;
		},
		ultsRegsHistStatus: async () => {
			// Variables
			const condicion = {[Op.or]: [{statusOriginal_id: {[Op.gt]: aprobado_id}}, {statusFinal_id: {[Op.gt]: aprobado_id}}]};

			// Obtiene el último registro de status de cada producto
			let ultsHist = [];
			await baseDeDatos
				.obtieneTodosPorCondicion("statusHistorial", condicion)
				.then((n) => n.sort((a, b) => b.statusFinalEn - a.statusFinalEn))
				.then((n) =>
					n.map((m) => {
						if (!ultsHist.find((o) => o.entidad == m.entidad && o.entidad_id == m.entidad_id)) ultsHist.push(m);
					})
				); // retiene sólo el último de cada producto

			// Fin
			return ultsHist;
		},
		historialVsProdRclv: async (ultsHist) => {
			// Variables
			let regsAgregar = [];
			if (!ultsHist.length) return regsAgregar;

			// Rutina historial vs prodRclv
			for (let ultHist of ultsHist) {
				// Obtiene los datos del historial
				const {entidad, entidad_id, statusFinalEn, statusFinal_id} = ultHist;

				// Obtiene los datos del prodRclv
				const prodRclv = await baseDeDatos.obtienePorId(entidad, entidad_id);
				if (!prodRclv) continue;
				const nombre = FN.nombresPosibles(prodRclv);
				const {statusRegistro_id} = prodRclv;

				// Asigna los datos a guardar
				const datos = {entidad, entidad_id, nombre, fechaRef: statusFinalEn};

				// Valida el status
				if (
					statusFinal_id != statusRegistro_id && // status distinto
					(statusFinal_id != creadoAprob_id || statusRegistro_id != aprobado_id) // descarta que la diferencia se deba a que se completó la revisión de la edición
				)
					regsAgregar.push({...datos, ST: true});
				else if (statusFinal_id == inactivar_id) regsAgregar.push({...datos, IN: true});
				else if (statusFinal_id == recuperar_id) regsAgregar.push({...datos, RC: true});
			}

			// Fin
			return regsAgregar;
		},
		prodRclvVsHistorial: async (ultsHist) => {
			// Variables
			const entidades = [...variables.entidades.prodsRclvs];
			let regsAgregar = [];

			// Obtiene los Inactivos y Recuperar
			let IN = FN.obtieneRegs({entidades, status_id: inactivar_id});
			let RC = FN.obtieneRegs({entidades, status_id: recuperar_id});
			let IO = FN.obtieneRegs({entidades, status_id: inactivo_id});
			[IN, RC, IO] = await Promise.all([IN, RC, IO]);
			let regsEnt = {IN, RC, IO};

			// Revisa en 'IN, RC, IO' (inactivo)
			for (let ST in regsEnt) {
				// Revisa en cada registro
				for (let prodRclv of regsEnt[ST]) {
					// Variables
					const {entidad, id, coleccion_id, statusSugeridoEn: fechaRef} = prodRclv;
					const nombre = FN.nombresPosibles(prodRclv);

					// Genera los datos a guardar
					const datos = {entidad, entidad_id: id, nombre, fechaRef};

					// Averigua si se encuentra en el historial - general
					let regHist = ultsHist.find((n) => n.entidad == entidad && n.entidad_id == id);
					// Averigua si se encuentra en el historial - específico para colecciones
					if (!regHist && entidad == "capitulos" && coleccion_id)
						regHist = ultsHist.find((n) => n.entidad == "colecciones" && n.entidad_id == coleccion_id);

					// Si no lo encuentra en el historial, lo agrega a status
					if (!regHist) regsAgregar.push({...datos, ST: true});
				}
			}

			// Fin
			return regsAgregar;
		},
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
	actualizaCalidadesDeLinkEnCole: async (colID) => {
		// Obtiene los capítulos de la colección
		const condicion = {coleccion_id: colID, statusRegistro_id: activos_ids};
		const capitulos = await baseDeDatos
			.obtieneTodosPorCondicion("capitulos", condicion)
			.then((n) => n.sort((a, b) => a.capitulo - b.capitulo)) // los ordena por capitulo
			.then((n) => n.sort((a, b) => a.temporada - b.temporada)); // los ordena por temporada
		if (!capitulos.length) return;

		// Actualiza cada campo de la colección
		const tiposDeLink = [
			...["linksTrailer", "linksGral", "linksGratis", "linksCast", "linksSubt"],
			...["HD_Gral", "HD_Gratis", "HD_Cast", "HD_Subt"],
		];
		for (let tipoDeLink of tiposDeLink) {
			// Variables
			const capSinLink = capitulos.find((n) => n[tipoDeLink] == sinLinks); // busca un capítulo que no tenga link
			const capTalVez = capitulos.find((n) => n[tipoDeLink] == linksTalVez);
			const capConLinks = capitulos.find((n) => n[tipoDeLink] == conLinks);

			// Obtiene los resultados
			const tieneLink = capSinLink ? sinLinks : capTalVez ? linksTalVez : capConLinks ? conLinks : null; // opción pesimista
			const capID = capSinLink ? capSinLink.id : null; // capítulo sin link

			// Actualiza cada 'tipoDeLink' en la colección
			baseDeDatos.actualizaPorId("colecciones", colID, {[tipoDeLink]: tieneLink});
			baseDeDatos.actualizaPorCondicion("capsSinLink", {coleccion_id: colID}, {[tipoDeLink]: capID});
		}

		// Fin
		return;
	},
	azar: () => parseInt(Math.random() * Math.pow(10, 6)), // Le asigna un n° entero al azar, donde 10^6 es el máximo posible

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
				if (!prefijosSanto.includes(primerNombre)) canonNombre = "San ";
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
	actualizaProdsEnRCLV: async function ({entidad, id}) {
		// Variables
		const entidadesProds = variables.entidades.prods;
		const statusAprobado = {statusRegistro_id: aprobado_id};
		const statusValido = {statusRegistro_id: {[Op.ne]: inactivo_id}};
		let prodsAprob;

		// Si el ID es menor o igual a 10, termina la función
		if (id && id <= 10) return;

		// Establece la condición perenne
		const rclv_id = this.obtieneDesdeEntidad.campo_id(entidad);
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
	actualizaProdAprobEnLink: (links) => {
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
			const prodAprob = activos_ids.includes(statusProd); // antes era 'aprobados_ids'
			baseDeDatos.actualizaPorId("links", link.id, {prodAprob});
		}

		// Fin
		return;
	},
	linksVencPorSem: {
		actualizaFechaVencimNull: async function (links) {
			// Variables
			let espera = [];

			// Si no se especificaron links, obtiene todos los aprobados que no tengan 'fechaVencim'
			if (!links) {
				const condicion = {statusRegistro_id: aprobado_id, fechaVencim: null};
				const include = variables.entidades.asocProds;
				links = await baseDeDatos.obtieneTodosPorCondicion("links", condicion, include);
			}

			// Rutina por link
			if (links.length) {
				for (let link of links) {
					// Calcula la fechaVencim - estrRec o estándar
					const desde = link.statusSugeridoEn.getTime();
					const linksVU = this.condicEstrRec(link) ? linksVU_estrRec : linksVU_estandar;
					const fechaVencim = new Date(desde + linksVU);

					// Se actualiza el link con el anoEstreno y la fechaVencim
					const asocProd = FN.asocProd(link);
					const anoEstreno = link[asocProd] ? link[asocProd].anoEstreno : link.anoEstreno;
					espera.push(baseDeDatos.actualizaPorId("links", link.id, {anoEstreno, fechaVencim}));
				}
				await Promise.all(espera);
			}

			// Fin
			return;
		},
		actualizaStatus: async () => {
			// Variables
			const fechaDeCorte = new Date(lunesDeEstaSemana + unaSemana);
			const ahora = new Date();

			// Condiciones y novedades
			const condicion = {fechaVencim: {[Op.lt]: fechaDeCorte}, statusRegistro_id: aprobado_id};
			const novedades = {
				statusSugeridoPor_id: usAutom_id,
				statusRegistro_id: creadoAprob_id,
				statusSugeridoEn: ahora,
			};

			// Actualiza el status en los links
			await baseDeDatos.actualizaPorCondicion("links", condicion, novedades);

			// Fin
			return;
		},
		actualizaCantLinksPorSem: async () => {
			// Obtiene todos los links en status distinto a 'inactivo' y con producto 'aprobado'
			const condicion = {statusRegistro_id: {[Op.ne]: inactivo_id}, prodAprob: true};
			let links = baseDeDatos.obtieneTodosPorCondicion("links", condicion);
			let edics = baseDeDatos.obtieneTodos("linksEdicion");
			[links, edics] = await Promise.all([links, edics]);

			// Funciones
			FN_links.obtieneCantPorSem(links);
			FN_links.obtienePromedios(links);
			FN_links.obtienePendientes(links, edics);

			// Fin
			return;
		},
		condicCreado: (link) => FN_links.condicCreado(link),
		condicEstrRec: (link) => FN_links.condicEstrRec(link),
		condicEstandar: (link) => FN_links.condicEstandar(link),
	},

	// Usuarios
	penalizacAcum: (usuario_id, motivo, petitFamilias) => {
		// Variables
		let penalizac = motivo.penalizac;
		let objeto = {};

		// Aumenta la penalización acumulada
		baseDeDatos.aumentaElValorDeUnCampo("usuarios", usuario_id, "penalizacAcum", penalizac);

		// Si corresponde, que se muestre el cartel de responsabilidad
		if (penalizac > 1 && petitFamilias) {
			let cartel = "cartel_resp_" + petitFamilias;
			objeto[cartel] = true;
		}
		// Si corresponde, se le baja el rol a 'Consultas'
		if (motivo.codigo == "bloqueoInput") objeto.rolUsuario_id = rolConsultas_id;

		// Si corresponde, actualiza el usuario
		if (Object.keys(objeto).length) baseDeDatos.actualizaPorId("usuarios", usuario_id, objeto);

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
				.replace(/м/g, "m")
				.replace(/[ŃŅŇ]/g, "N")
				.replace(/[ńņňŉй]/g, "n")
				.replace(/[ÒÔÕŌŌŎŐ]/g, "O")
				.replace(/[òôõōðōŏőöø]/g, "o")
				.replace(/ó/g, "ó")
				.replace(/[ÖŒ]/g, "Oe")
				.replace(/[œ]/g, "oe")
				.replace(/[ŔŖŘ]/g, "R")
				.replace(/[ŕŗřг]/g, "r")
				.replace(/[ŚŜŞŠ]/g, "S")
				.replace(/[śŝşšș]/g, "s")
				.replace(/[ŢŤŦȚГ]/g, "T")
				.replace(/[țţťŧ]/g, "t")
				.replace(/[ÙÛŨŪŬŮŰŲ]/g, "U")
				.replace(/[ùûũūŭůűų]/g, "u")
				.replace(/Ŵ/g, "W")
				.replace(/[ŵш]/g, "w")
				.replace(/[ÝŶŸ]/g, "Y")
				.replace(/[ýŷÿ]/g, "y")
				.replace(/[ŽŹŻŽ]/g, "Z")
				.replace(/[žźżž]/g, "z")
				.replace(/[“”«»]/g, '"')
				.replace(/[‘’`]/g, "'")
				.replace(/[º]/g, "°")
				.replace(/[®​​#]/g, "")
				.replace(/–/g, "-")
				.replace("[", "(")
				.replace("]", ")")
				.replace(/[\t\n\r]/g, " ") // previene el uso de 'tab' y 'return'
				.replace(/[  ]/g, " ") // previene el uso de espacios 'raros'
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
		ahora: () => FN.ahora(),
		nuevoHorario: (delay, horario) => FN.nuevoHorario(delay, horario),
		diaMes: (fecha) => FN.diaMes(fecha),
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
	enviaMail: async ({email, asunto, comentario}) => {
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
	variablesSemanales: function () {
		FN.primerLunesDelAno();

		// Otras variables
		semanaUTC = parseInt((Date.now() - primerLunesDelAno) / unDia / 7) + 1;
		lunesDeEstaSemana = primerLunesDelAno + (semanaUTC - 1) * unaSemana;

		// Fin
		return;
	},
	partesDelUrl: (req) => {
		// Obtiene la base y el url (sin la base)
		let url = req.baseUrl + req.path;
		const baseUrl = url.slice(0, url.indexOf("/", 1));
		url = url.replace(baseUrl, "");
		const tarea = url.slice(0, url.indexOf("/", 1));

		// Obtiene la siglaFam
		let {siglaFam} = req.params;
		if (!siglaFam) {
			url = url.replace(tarea, ""); // si contiene la tarea, la quita
			if (url) {
				siglaFam = url.slice(1); // le quita el "/" del comienzo
				if (siglaFam.length > 2 || siglaFam[1] != "/") siglaFam = null; // detecta si no es una 'siglaFam'
				else siglaFam = siglaFam[0]; // obtiene la 'siglaFam'
				if (siglaFam && !["p", "r", "l"].includes(siglaFam)) siglaFam = null;
			}
		}

		// Obtiene la entidad
		let {entidad} = req.params;
		if (!entidad) entidad = baseUrl.slice(1);

		// Fin
		return {baseUrl, tarea, siglaFam, entidad, url};
	},
	rutas: (entidad) => {
		// Variables
		const siglaFam = comp.obtieneDesdeEntidad.siglaFam(entidad);
		const familia = comp.obtieneDesdeEntidad.familia(entidad);
		const rutasCons = [];
		let opciones, tareas;

		// Rutas de Familia
		if (["producto", "rclv"].includes(familia)) {
			opciones = [
				{tarea: "historial", titulo: "Historial de"},
				{tarea: "inactivar", titulo: "Inactivar"},
				{tarea: "recuperar", titulo: "Recuperar"},
			];
			for (let opcion of opciones)
				rutasCons.push({
					ant: "/" + familia + "/" + opcion.tarea, // familia + tarea (salvo correccion)
					act: "/" + entidad + "/" + opcion.tarea, // entidad + tarea
					titulo: opcion.titulo,
				});
			rutasCons.push(
				{ant: "/correccion/motivo", act: "/" + entidad + "/correccion-del-motivo"},
				{ant: "/correccion/status", act: "/" + entidad + "/correccion-del-status"}
			);
		}
		rutasCons.push(
			{
				ant: "/" + familia + "/eliminadoPorCreador", // familia + tarea (salvo correccion)
				act: "/" + entidad + "/eliminado-por-creador", // entidad + tarea
				titulo: "Eliminar",
			},
			{
				ant: "/" + familia + "/eliminar", // familia + tarea (salvo correccion)
				act: "/" + entidad + "/eliminado", // entidad + tarea
				titulo: "Eliminar",
			}
		);

		// Rutas de Producto RUD
		if (familia == "producto") {
			tareas = ["detalle", "edicion", "calificar"];
			for (let tarea of tareas) rutasCons.push({ant: "/producto/" + tarea, act: "/" + entidad + "/" + tarea + "/p"}); // ant: '/producto/' + rutaAnt - act: entidad + rutaAct
		}

		// Rclv CRUD
		if (familia == "rclv") {
			tareas = ["agregar", "detalle", "edicion"];
			for (let tarea of tareas) rutasCons.push({ant: "/rclv/" + tarea, act: "/" + entidad + "/" + tarea + "/r"}); // ant: '/rclv/' + rutaAnt - act: entidad + rutaAct
		}

		// Links
		if (["producto", "link"].includes(familia))
			rutasCons.push(
				{ant: "/links/abm", act: "/" + entidad + "/abm-links/p"},
				{ant: "/links/visualizacion", act: "/links/mirar/l"}
			);

		// Revisión de Entidades
		tareas = ["alta", "solapamiento", "abm-links"];
		for (let tarea of tareas)
			rutasCons.push({
				ant: "/revision/" + familia + "/" + tarea, // revision + familia + tarea (salvo links)
				act: "/revision/" + tarea + "/" + siglaFam + "/" + entidad, // revision + tarea + siglaFam + entidad
			});
		rutasCons.push({
			ant: "/revision/links", // revision + familia + tarea (salvo links)
			act: "/revision/abm-links/" + siglaFam + "/" + entidad, // revision + tarea + siglaFam + entidad
		});
		tareas = ["edicion", "rechazar", "inactivar", "recuperar"];
		for (let tarea of tareas)
			rutasCons.push({
				ant: "/revision/" + familia + "/" + tarea, // revision + familia + tarea (salvo links)
				act: "/revision/" + tarea + "/" + entidad, // revision + tarea + entidad
				titulo: tarea == "rechazar" ? "Rechazar" : "Revisión de " + comp.letras.inicialMayus(tarea),
			});

		// Fin
		return rutasCons;
	},
};

// Funciones
let FN = {
	// Fecha y hora
	ahora: () => new Date(new Date().toUTCString()), // <-- para convertir en 'horario local'
	nuevoHorario: function (delay, horario) {
		horario = horario ? horario : this.ahora();
		let nuevoHorario = new Date(horario);
		nuevoHorario.setHours(nuevoHorario.getHours() + delay);
		return nuevoHorario;
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

		// Si el primer lunes del año es posterior al presente, se resta una semana para que tome el primer lunes del año anterior
		if (primerLunesDelAno > fecha.getTime()) this.primerLunesDelAno(fecha.getTime() - unaSemana);

		// Fin
		return;
	},
	diaMes: (fecha) => {
		fecha = new Date(fecha);
		let dia = fecha.getUTCDate();
		let mes = mesesAbrev[fecha.getUTCMonth()];
		fecha = dia + "/" + mes;
		return fecha;
	},

	// Entidad
	entidadNombre: (entidad) => {
		const indice = [...variables.entidades.todos].indexOf(entidad);
		const entNombre = indice > -1 ? [...variables.entidades.todosNombre][indice] : null;
		return entNombre;
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
	asocProd: (registro) => {
		return registro.pelicula_id
			? "pelicula"
			: registro.capitulo_id // debe ir antes de la colección por sus ediciones
			? "capitulo"
			: registro.coleccion_id
			? "coleccion"
			: "";
	},

	// Otras
	obtieneRegs: async function (campos) {
		// Variables
		const {entidades} = campos;
		let resultados = [];

		// Obtiene los resultados
		for (let entidad of entidades) resultados.push(this.lecturaBD({entidad, ...campos}));

		// Consolida y completa la información
		resultados = await Promise.all(resultados)
			.then((n) => n.flat())
			.then((n) => n.sort((a, b) => b.statusSugeridoEn - a.statusSugeridoEn));

		// Fin
		return resultados;
	},
	lecturaBD: async function (campos) {
		// Variables
		const {entidad, status_id, campoRevId, include} = campos;

		// Condiciones
		let condicion = {statusRegistro_id: status_id}; // Con status según parámetro
		if (variables.entidades.rclvs.includes(entidad)) condicion.id = {[Op.gt]: idMinRclv}; // Excluye los registros RCLV cuyo ID es <= idMinRclv

		// Resultado
		const resultados = await baseDeDatos
			.obtieneTodosPorCondicion(entidad, condicion, include)
			.then((n) => n.map((m) => ({...m, entidad})));

		// Fin
		return resultados;
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
	nombresPosibles: (registro) => {
		return registro.nombreCastellano
			? registro.nombreCastellano
			: registro.nombreOriginal
			? registro.nombreOriginal
			: registro.nombre
			? registro.nombre
			: "";
	},
};
let FN_links = {
	obtieneCantPorSem: function (links) {
		// Elimina los datos anteriores
		cantLinksVencPorSem = {};

		// Se asegura tener un valor por semana y entidad
		for (let i = 0; i <= linksSemsEstandar; i++) cantLinksVencPorSem[i] = {capitulos: 0, pelisColes: 0, estrRec: 0};

		// Obtiene el valor por semana
		const linksAprob = links.filter((n) => n.statusRegistro_id == aprobado_id);
		for (let link of linksAprob) {
			// Obtiene la semana de vencimiento
			const fechaVencim = new Date(link.fechaVencim).getTime();
			const semVencim = parseInt((fechaVencim - lunesDeEstaSemana) / unaSemana); // es la semana relativa a la semana actual
			if (semVencim < 1 || semVencim > linksSemsEstandar) {
				baseDeDatos.actualizaPorId("links", link.id, {statusRegistro_id: creadoAprob_id}); // le cambia el status a los links con semana errónea
				continue;
			}

			// Agrega al conteo
			const entidad = this.condicEstrRec(link) ? "estrRec" : link.capitulo_id ? "capitulos" : "pelisColes";
			cantLinksVencPorSem[semVencim][entidad]++;
		}

		// Fin
		return;
	},
	obtienePromedios: function (links) {
		// Variables
		const linksEstandar = links.filter((link) => !this.condicEstrRec(link)); // creadoAprob, inactivar, recuperar con fecha de estreno 'no reciente'
		const linksEstrRec = links.filter((link) => this.condicEstrRec(link)); // creadoAprob, inactivar, recuperar con fecha de estreno 'no reciente'

		// Promedio semanal para links de plazo estándar
		const capitulos = Math.ceil(linksEstandar.filter((n) => n.capitulo_id).length / linksSemsEstandar);
		const pelisColes = Math.ceil(linksEstandar.filter((n) => !n.capitulo_id).length / linksSemsEstandar);
		const estrRec = Math.ceil(linksEstrRec.length / linksSemsEstrRec);

		// Actualiza la variable 'cantLinksVencPorSem'
		cantLinksVencPorSem.promSem = {capitulos, pelisColes, estrRec, prods: capitulos + pelisColes};

		// Fin
		return;
	},
	obtienePendientes: function (links, edics) {
		// Links a revisar
		const linksRevisar = links.filter((n) => n.statusRegistro_id != aprobado_id);
		const linksEstandar = linksRevisar.filter((link) => !this.condicEstrRec(link)); // links de plazo estándar
		const linksEstrRec = linksRevisar.filter((link) => this.condicEstrRec(link)); // links de corto plazo

		// Links con límite
		const capitulos = linksEstandar.filter((n) => n.capitulo_id).length;
		const pelisColes = linksEstandar.filter((n) => !n.capitulo_id).length;
		const estrRec = linksEstrRec.length;
		const ediciones = edics.length;
		const prods = capitulos + pelisColes + ediciones + estrRec;

		// Asigna las cantidades a la semana actual
		cantLinksVencPorSem["0"] = {capitulos, pelisColes, estrRec, ediciones, prods};

		// Fin
		return;
	},
	obtienePosibles: () => {
		// Variables
		const {promSem} = cantLinksVencPorSem;
		const {capitulos: capsProm, pelisColes: pelisColesProm, estrRec: estrRecProm} = promSem;

		// Averigua la cantidad de links posibles por semana
		let capitulosPosibles = 0;
		let pelisColesPosibles = 0;
		let estrRecPosibles = 0;
		for (let semana = linkSemInicial; semana <= linksSemsEstandar; semana++) {
			capitulosPosibles += Math.max(0, capsProm - cantLinksVencPorSem[semana].capitulos);
			pelisColesPosibles += Math.max(0, pelisColesProm - cantLinksVencPorSem[semana].pelisColes);
			if (semana <= linksSemsEstrRec) estrRecPosibles += Math.max(0, estrRecProm - cantLinksVencPorSem[semana].estrRec);
		}

		// Fin
		return {capitulosPosibles, pelisColesPosibles, estrRecPosibles};
	},
	condicCreado: (link) => link.statusRegistro_id == creado_id,
	condicEstrRec: (link) => {
		const anoReciente = anoHoy - linkAnoReciente;
		const anoEstreno = link.anoEstreno;
		return anoEstreno && anoEstreno >= anoReciente && link.tipo_id != linkTrailer_id;
	},
	condicEstandar: function (link) {
		return !this.condicCreado(link) && !this.condicEstrRec(link);
	},
};
