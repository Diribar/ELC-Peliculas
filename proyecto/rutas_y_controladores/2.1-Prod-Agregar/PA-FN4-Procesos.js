"use strict";

// Variables
const APIsTMDB = require("../../funciones/2-Procesos/APIsTMDB");
const procsComp = require("./PA-FN5-Compartidos");

module.exports = {
	// USO COMPARTIDO *********************
	borraSessionCookies: (req, res, paso) => {
		// Variables
		const etapas = [
			"borrarTodo",
			"palabrasClave",
			"desambiguar",
			"IM",
			"datosOriginales",
			"FA",
			"datosDuros",
			"datosAdics",
			"confirma",
			"terminaste",
		];
		const inicio = etapas.indexOf(paso) + 1;

		// Elimina las sessions y cookies
		for (let i = inicio; i < etapas.length; i++) {
			const etapa = etapas[i];
			if (req.session && req.session[etapa]) delete req.session[etapa];
			if (req.cookies && req.cookies[etapa]) res.clearCookie(etapa);
		}

		// Fin
		return;
	},
	datosAdics: {
		valsCheckBtn: (datos) => {
			// Variables
			const camposDA = variables.camposDA;
			const camposChkBtn = camposDA.filter((n) => n.chkBox).map((m) => m.nombre);
			console.log(40,camposChkBtn);
			for (let campo of camposChkBtn) datos[campo] = datos[campo] ? 1 : 0;

			// Fin
			return datos;
		},
		quitaCamposRCLV: (datos) => {
			// Variables
			const camposDA = variables.camposDA;
			const camposRCLV = camposDA.filter((n) => n.rclv).map((m) => m.nombre);
			for (let campo of camposRCLV) if (datos.sinRCLV || datos[campo] == 1) delete datos[campo];

			// Fin
			return datos;
		},
		valorParaActores: (datos) => {
			// Acciones si no hay un valor para actores
			return datos.tipoActuacion_id == anime_id
				? "Dibujos Animados"
				: datos.tipoActuacion_id == documental_id
				? "Documental"
				: datos.actores;
		},
	},
	confirma: {
		verificaQueExistanLosRCLV: async (confirma) => {
			// Variables
			const entidadesRCLV = variables.entidades.rclvs;
			let existe = true;
			let epocaOcurrencia_id = null;

			// Revisa que exista el RCLV
			for (let entidad of entidadesRCLV) {
				// Variables
				const campo_id = comp.obtieneDesdeEntidad.campo_id(entidad);
				const RCLV_id = confirma[campo_id];

				// Averigua si existen los RCLV_id
				if (RCLV_id && RCLV_id > 2) {
					const registro = await BD_genericas.obtienePorId(entidad, RCLV_id);
					if (!registro) {
						existe = false;
						break;
					} else if (registro.epocaOcurrencia_id && !confirma.epocaOcurrencia_id && !epocaOcurrencia_id)
						epocaOcurrencia_id = registro.epocaOcurrencia_id;
				}
			}

			// Fin
			return {existe, epocaOcurrencia_id};
		},
		// Colecciones
		agregaCaps_Colec: async function (datos) {
			// Replica para todos los capítulos de la colección - ¡No se debe usar 'forEach' porque no respeta el await!
			let indice = 0;
			for (let capTMDB_id of datos.capsTMDB_id) {
				indice++;
				await this.agregaUnCap_Colec(datos, capTMDB_id, indice);
			}

			// Fin
			return;
		},
		agregaUnCap_Colec: async function (datosCol, capTMDB_id, indice) {
			// Toma los datos de la colección
			const {id: coleccion_id, paises_id, idiomaOriginal_id} = datosCol;
			const {direccion, guion, musica, actores, produccion} = datosCol;
			const statusColeccion_id = datosCol.statusColeccion_id ? datosCol.statusColeccion_id : creado_id;

			// Genera la información a guardar - los datos adicionales se completan en la revisión
			const datosCap = {
				...{coleccion_id, temporada: 1, capitulo: indice},
				...{paises_id, idiomaOriginal_id},
				...{direccion, guion, musica, actores, produccion},
				...{creadoPor_id: usAutom_id, statusSugeridoPor_id: usAutom_id, statusColeccion_id},
			};

			// Guarda los datos del capítulo
			await procsComp
				.obtieneInfoDeMovie({TMDB_id: capTMDB_id}) // Obtiene los datos del capítulo
				.then((n) => (n = {...datosCap, ...n})) // Le agrega los datos de cabecera
				.then(async (n) => await BD_genericas.agregaRegistro("capitulos", n));

			// Fin
			return;
		},
		// TV
		agregaTemps_TV: async function (datosCol) {
			// Loop de TEMPORADAS
			for (let temporada = 1; temporada <= datosCol.cantTemps; temporada++)
				await this.agregaUnaTemp_TV(datosCol, temporada);

			// Fin
			return;
		},
		agregaUnaTemp_TV: async function (datosCol, temporada) {
			// Datos de UNA TEMPORADA
			let datosTemp = await Promise.all([
				APIsTMDB.details(temporada, datosCol.TMDB_id),
				APIsTMDB.credits(temporada, datosCol.TMDB_id),
			]).then(([a, b]) => ({...a, ...b}));

			// Guarda los CAPITULOS
			for (let datosCap of datosTemp.episodes) {
				const capitulo = this.datosCap(datosCol, datosTemp, datosCap); // Obtiene la información del capítulo
				await BD_genericas.agregaRegistro("capitulos", capitulo); // Guarda el capítulo
			}

			// Fin
			return;
		},
		datosCap: function (datosCol, datosTemp, datosCap) {
			// Variables
			const {paises_id, idiomaOriginal_id, produccion} = datosCol;
			const datosCrew = datosCap.crew.length;

			// Genera la información a guardar
			let datos = {
				...{coleccion_id: datosCol.id, temporada: datosTemp.season_number, capitulo: datosCap.episode_number},
				...{fuente: "TMDB", creadoPor_id: usAutom_id, statusSugeridoPor_id: usAutom_id},
				...{TMDB_id: datosCap.id, nombreCastellano: datosCap.name},
				...{paises_id, idiomaOriginal_id, produccion},
				...{duracion: datosCap.runtime, sinopsis: datosCap.overview},
				anoEstreno: datosCap.air_date ? parseInt(datosCap.air_date.slice(0, 4)) : "",
			};

			// Dirección
			const direccion = datosCrew ? procsComp.valores(datosCap.crew.filter((n) => n.department == "Directing")) : "";
			datos.direccion = direccion ? direccion : datosCol.direccion;

			// Guión
			const guion = datosCrew ? procsComp.valores(datosCap.crew.filter((n) => n.department == "Writing")) : "";
			datos.guion = guion ? guion : datosCol.guion;

			// Música
			const musica = datosCrew ? procsComp.valores(datosCap.crew.filter((n) => n.department == "Sound")) : "";
			datos.musica = musica ? musica : datosCol.musica;

			// Actores
			let actores = [...datosTemp.cast, ...datosCap.guest_stars];
			if (!actores.length && datosCol.actores) actores = [{name: datosCol.actores}];
			datos.actores = procsComp.actores(actores);

			// Limpia el resultado
			for (let prop in datos) if (!datos[prop]) delete datos[prop];
			datos = comp.convierteLetras.alCastellano(datos);

			// Avatar
			const avatar = datosCap.still_path ? datosCap.still_path : datosCap.poster_path ? datosCap.poster_path : "";
			if (avatar) datos.avatar = "https://image.tmdb.org/t/p/original" + avatar;

			// Fin
			return datos;
		},
	},
	FA: {
		infoFAparaDD: function (datos) {
			// Obtiene los campos del formulario
			const {entidad, url, avatarUrl} = datos;
			let contenido = datos.contenido;

			// Genera la información
			const entidadNombre = comp.obtieneDesdeEntidad.entidadNombre(entidad);
			const FA_id = this.obtieneFA_id(url);
			contenido = this.contenidoFA(contenido);

			// Obtiene el pais_id y el idiomaOriginal_id
			if (contenido.paisNombre) {
				// Variables
				let resultado = [];

				// Obtiene el país
				const pais_nombreArray = contenido.paisNombre.split(", ");
				for (let paisNombre of pais_nombreArray) {
					const pais = paises.find((n) => n.nombre == paisNombre);
					if (pais) resultado.push(pais.id);
				}
				if (resultado.length) contenido.paises_id = resultado.join(" ");

				// Obtiene el idioma
				if (contenido.paises_id && contenido.paises_id.length == 2) {
					const pais = paises.find((n) => n.id == contenido.paises_id);
					if (pais) contenido.idiomaOriginal_id = pais.idioma_id;
				}
			}
			delete contenido.paisNombre;

			// Genera el resultado
			let resultado = {entidadNombre, entidad, fuente: "FA", FA_id, ...contenido};
			if (datos.coleccion_id) resultado.coleccion_id = datos.coleccion_id;

			// Limpia el resultado de caracteres especiales
			resultado = comp.convierteLetras.alCastellano(resultado);
			resultado.avatarUrl = avatarUrl;

			// Fin
			return resultado;
		},
		contenidoFA: (texto) => {
			// Convierte en array
			let contenidos = texto.split("\n");

			// Limpia espacios innecesarios
			contenidos.forEach((contenido, i) => (contenidos[i] = contenido.trim()));

			// Arma el objeto literal
			let resultado = {};
			let indice = (queBuscar) => {
				return contenidos.findIndex((n) => n.startsWith(queBuscar));
			};
			if (indice("Ficha") > 0) resultado.nombreCastellano = eliminaParentesis(contenidos[indice("Ficha") - 1]);
			if (indice("Título original") > 0)
				resultado.nombreOriginal = eliminaParentesis(contenidos[indice("Título original") + 1]);
			if (indice("Año") > 0) resultado.anoEstreno = parseInt(contenidos[indice("Año") + 1]);
			if (indice("Duración") > 0) {
				let duracion = contenidos[indice("Duración") + 1];
				resultado.duracion = parseInt(duracion.slice(0, duracion.indexOf(" ")));
			}
			if (indice("País") > 0) {
				let paisNombre = contenidos[indice("País") + 1];
				resultado.paisNombre = paisNombre.slice((paisNombre.length + 1) / 2);
			}
			if (indice("Dirección") > 0) resultado.direccion = contenidos[indice("Dirección") + 1];
			if (indice("Guion") > 0) resultado.guion = contenidos[indice("Guion") + 1];
			if (indice("Música") > 0) resultado.musica = contenidos[indice("Música") + 1];
			// if (indice("Reparto") > 0) resultado.actores = contenidos[indice("Reparto") + 1]; // Cambió el formato
			if (indice("Productora") > 0) resultado.produccion = contenidos[indice("Productora") + 1];
			else if (indice("Compañías") > 0) resultado.produccion = contenidos[indice("Compañías") + 1];
			if (indice("Sinopsis") > 0) {
				let aux = contenidos[contenidos.indexOf("Sinopsis") + 1];
				if (!aux.includes("(FILMAFFINITY)")) aux += " (FILMAFFINITY)";
				resultado.sinopsis = aux.replace(/"/g, "'");
			}

			// Fin
			return resultado;
		},
		obtieneFA_id: (url) => {
			// Protección
			if (!url) return;

			// Quita "/film" y lo previo
			let indice = url.indexOf("/film");
			if (indice) url = url.slice(indice + 5);
			else return;

			// Quita la terminación
			indice = url.indexOf(".html");
			if (indice) url = url.slice(0, indice);
			else return;

			// Fin
			return url;
		},
	},
};

// Funciones auxiliares
let eliminaParentesis = (dato) => {
	let desde = dato.indexOf(" (");
	let hasta = dato.indexOf(")");
	return desde > 0 ? dato.slice(0, desde) + dato.slice(hasta + 1) : dato;
};
