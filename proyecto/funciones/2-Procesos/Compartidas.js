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
		entidadNombre: (entidad) => {
			return FN.entidadNombre(entidad);
		},
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
		ao: (entidad) => {
			return ["peliculas", "colecciones", "epocasDelAno"].includes(entidad) ? "a" : "o";
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
		const includes = ["peliculas", "colecciones", "capitulos"];

		// Obtiene los registros asociados con productos
		const temas = await BD_genericas.obtieneTodosPorCondicionConInclude("temas", condicion, includes)
			.then((n) => n.filter((m) => includes.some((p) => m[p].length)))
			.then((n) => n.map((m) => ({id: m.id, nombre: m.nombre, cant: includes.reduce((acum, n) => acum + m[n].length, 0)})))
			.then((n) => n.sort((a, b) => (a.nombre < b.nombre ? -1 : 1)));

		// Fin
		return temas;
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
			BD_genericas.actualizaPorId("links", link.id, {prodAprob});
		}

		// Fin
		return;
	},
	linksVencPorSem: {
		actualizaFechaVencim: async function (links) {
			// Variables
			const condicion = {statusRegistro_id: aprobado_id};
			const include = variables.entidades.asocProds;
			const soloLinksSinFecha = !links; // si no se especifican links, sólo se actualizan los que no tienen fecha
			let espera = [];

			// Obtiene todos los links con sus vínculos de prods
			if (soloLinksSinFecha) links = await BD_genericas.obtieneTodosPorCondicionConInclude("links", condicion, include);

			// Rutina por link
			for (let link of links) {
				// Revisa si se debe saltear la rutina
				if (soloLinksSinFecha && link.fechaVencim) continue;

				// Obtiene el anoEstreno
				const asocProd = comp.obtieneDesdeCampo_id.asocProd(link);
				const anoEstreno = link[asocProd].anoEstreno;

				// Obtiene la categoria_id
				const categoria_id = this.categoria_id(link);

				// Averigua si es un linkReciente y sin primRev
				const sinPrimRev = !link.yaTuvoPrimRev;
				const anoReciente = anoHoy - linkAnoReciente;
				const linkReciente = (!anoEstreno || anoEstreno > anoReciente) && link.tipo_id != linkTrailer_id;

				// Calcula la fechaVencim - primRev o reciente o null, 4 sems
				const desde = link.statusSugeridoEn.getTime();
				const fechaVencimNum = desde + (sinPrimRev || linkReciente ? linksPrimRev : linksVidaUtil);
				const fechaVencim = new Date(fechaVencimNum);

				// Se actualiza el link con el anoEstreno y la fechaVencim
				espera.push(BD_genericas.actualizaPorId("links", link.id, {anoEstreno, fechaVencim}));
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
			const condiciones = [{fechaVencim: {[Op.lt]: fechaDeCorte}}, {statusRegistro_id: aprobado_id}];
			const status = {
				statusSugeridoPor_id: usAutom_id,
				statusRegistro_id: creadoAprob_id,
				statusSugeridoEn: ahora,
			};

			// Actualiza el status de los links
			await BD_genericas.actualizaTodosPorCondicion("links", condiciones, status);

			// Fin
			await this.actualizaLVPS();
			return;
		},
		actualizaLVPS: async function () {
			// Variables
			if (!semanaUTC) this.variablesSemanales(); // Para asegurarse de tener el 'primerLunesDelAno' y la 'semanaUTC'
			const prodAprob = true;
			cantLinksVencPorSem = {};

			// Crea las semanas dentro de la variable
			for (let i = 0; i <= linksSemsVidaUtil; i++) cantLinksVencPorSem[i] = {pelisColes: 0, capitulos: 0, prods: 0};

			// Obtiene todos los links con producto aprobado y en status distinto a inactivo
			const links = await BD_genericas.obtieneTodosPorCondicion("links", {
				statusRegistro_id: {[Op.ne]: inactivo_id},
				prodAprob,
			});
			const linksAprob = links.filter((n) => n.statusRegistro_id == aprobado_id);
			const linksRevisar = links.filter((n) => n.statusRegistro_id != aprobado_id);
			const linksSinLimite = linksRevisar.filter((n) => n.categoria_id != linkEstandar_id); // links de corto plazo
			const linksConLimite = linksRevisar.filter((n) => n.categoria_id == linkEstandar_id); // links de plazo estándar

			// Abre los links con límite
			let pelisColes = linksConLimite.filter((n) => !n.capitulo_id);
			pelisColes = {
				creadoAprob: pelisColes.filter((n) => n.statusRegistro_id == creadoAprob_id).length,
				inactivarRecuperar: pelisColes.filter((n) => n.statusRegistro_id != creadoAprob_id).length,
				total: pelisColes.length,
			};
			let capitulos = linksConLimite.filter((n) => n.capitulo_id);
			capitulos = {
				creadoAprob: capitulos.filter((n) => n.statusRegistro_id == creadoAprob_id).length,
				inactivarRecuperar: capitulos.filter((n) => n.statusRegistro_id != creadoAprob_id).length,
				total: capitulos.length,
			};

			// Otros datos
			const sinLimite = linksSinLimite.length;
			const prods = linksConLimite.length + linksSinLimite.length;
			cantLinksVencPorSem["0"] = {pelisColes, capitulos, sinLimite, prods};

			// Obtiene la cantidad por semana de los 'linksAprob'
			for (let link of linksAprob) {
				// Obtiene la semana de vencimiento
				const fechaVencim = new Date(link.fechaVencim).getTime();
				const semVencim = parseInt((fechaVencim - lunesDeEstaSemana) / unaSemana); // es la semana relativa a la semana actual
				if (semVencim < 1 || semVencim > linksSemsVidaUtil) continue; // saltea la semana actual y las que tengan un error

				// Agrega al conteo
				const entidad = link.capitulo_id ? "capitulos" : "pelisColes";
				cantLinksVencPorSem[semVencim][entidad]++;
				cantLinksVencPorSem[semVencim].prods++;
			}

			// Fin
			this.paramsVencPorSem();
			return;
		},
		paramsVencPorSem: () => {
			// Averigua la cantidad total de pendientes
			const {sinLimite} = cantLinksVencPorSem[0];
			let {pelisColes, capitulos, prods: cantPends} = cantLinksVencPorSem[0];
			const pelisColesPends = pelisColes.total;
			const capsPends = capitulos.total;

			// Averigua los links totales 'aprobados_ids'
			let cantAprobs = 0;
			for (let i = 1; i <= linksSemsVidaUtil; i++) cantAprobs += cantLinksVencPorSem[i].prods;

			// Variables
			const cantLinksTotal = cantPends + cantAprobs;
			const cantPromSem = Math.trunc((cantLinksTotal / linksSemsVidaUtil) * 10) / 10; // deja un decimal
			const cantPromSemEntero = Math.ceil(cantPromSem); // permite que se supere el promedio en alguna semana, para que no queden links sin aprobar
			const prodsPosibles = Math.max(0, cantPromSemEntero - cantLinksVencPorSem[linksSemsVidaUtil].prods);

			// Capítulos
			const capsPosibles = Math.max(
				0,
				Math.round(cantPromSemEntero / 2) - cantLinksVencPorSem[linksSemsVidaUtil].prods // se disminuye para que no 'sature' la semana con capítulos
			);
			const capsParaProc = Math.min(capsPosibles, capsPends);
			capitulos = {
				creadoAprob: capsParaProc - Math.min(capsParaProc, capitulos.inactivarRecuperar),
				inactivarRecuperar: Math.min(capsParaProc, capitulos.inactivarRecuperar),
				total: capsParaProc,
			};

			// Películas y Colecciones
			const semPrimRev = linksPrimRev / unaSemana;
			let pelisColesPosibles = 0;
			// Averigua los posibles sin la última semana
			for (let i = semPrimRev + 1; i < linksSemsVidaUtil; i++)
				pelisColesPosibles += Math.max(0, cantPromSemEntero - cantLinksVencPorSem[i].prods);
			// Averigua los posibles en la última semana, sumándole la capacidad 'ociosa' de capítulos
			pelisColesPosibles += Math.max(0, prodsPosibles - capsParaProc);
			// Averigua la cantidad para procesar
			const pelisColesParaProc = Math.min(pelisColesPosibles, pelisColesPends);
			pelisColes = {
				creadoAprob: pelisColesParaProc - Math.min(pelisColesParaProc, pelisColes.inactivarRecuperar),
				inactivarRecuperar: Math.min(pelisColesParaProc, pelisColes.inactivarRecuperar),
				total: pelisColesParaProc,
			};

			// Agrega la información
			const paraProc = {pelisColes, capitulos, sinLimite, prods: pelisColesParaProc + capsParaProc + sinLimite};
			cantLinksVencPorSem = {...cantLinksVencPorSem, paraProc, cantPromSem, cantPromSemEntero};
			//console.log(694, cantLinksVencPorSem);

			// Fin
			return;
		},
		categoria_id: (link) => {
			// Variables
			const anoReciente = anoHoy - linkAnoReciente;
			const noTrailer = link.tipo_id != linkTrailer_id;
			const asocProd = comp.obtieneDesdeCampo_id.asocProd(link);
			const anoEstreno = link[asocProd] ? link[asocProd].anoEstreno : link.anoEstreno;

			// Fin
			return link.statusRegistro_id == creado_id
				? linkRecienCreado_id
				: (anoEstreno || anoEstreno > anoReciente) && noTrailer
				? linkEstrenoReciente_id
				: linkEstandar_id;
		},
	},

	// Usuarios
	penalizacAcum: (userID, motivo, petitFamilias) => {
		// Variables
		let penalizac = motivo.penalizac;
		let objeto = {};

		// Aumenta la penalización acumulada
		BD_genericas.aumentaElValorDeUnCampo("usuarios", userID, "penalizacAcum", penalizac);

		// Si corresponde, que se muestre el cartel de responsabilidad
		if (penalizac > 1 && petitFamilias) {
			let cartel = "cartel_resp_" + petitFamilias;
			objeto[cartel] = true;
		}
		// Si corresponde, se le baja el rol a 'Consultas'
		if (motivo.codigo == "bloqueoInput") objeto.rolUsuario_id = rolConsultas_id;

		// Si corresponde, actualiza el usuario
		if (Object.keys(objeto).length) BD_genericas.actualizaPorId("usuarios", userID, objeto);

		// Fin
		return;
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
				.replace(/[śŝşš]/g, "s")
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
		ao: (usuario) => (usuario.genero_id == "F" ? "a " : "o "),
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
};
