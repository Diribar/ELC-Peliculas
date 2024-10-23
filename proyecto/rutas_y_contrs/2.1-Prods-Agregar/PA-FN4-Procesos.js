"use strict";

// Variables
const APIsTMDB = require("../../funciones/APIsTMDB");
const procsComp = require("./PA-FN5-Compartidos");
const procsFM = require("../2.0-Familias/FM-FN-Procesos");

module.exports = {
	// Compartidos
	borraSessionCookies: (req, res, paso) => {
		// Variables
		const etapas = [
			"borrarTodo",
			...["pc_ds", "palabrasClave", "desambiguar"],
			...["IM", "datosOriginales", "FA"],
			...["datosDuros", "datosAdics", "confirma"],
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
	prodsIMFA: async (palabras) => {
		// Variables
		const entidades = ["peliculas", "colecciones"];
		const campos = ["nombreCastellano", "nombreOriginal"];
		const omitirUserId = true;
		const original = true;
		let resultados = [];

		// Rutina por entidad
		for (let entidad of entidades) {
			// Variables
			const datos = {familia: "producto", entidad, campos};

			// Obtiene las condiciones de palabras y status
			let condicion = procsFM.quickSearch.condicion({palabras, campos, original, omitirUserId});

			// Agrega la condición de que no provenga de 'TMDB'
			condicion[Op.and].push({fuente: {[Op.ne]: "TMDB"}});

			// Obtiene los registros que cumplen las condiciones
			resultados.push(procsFM.quickSearch.registros(condicion, datos));
		}
		resultados = await Promise.all(resultados).then((n) => n.flat());

		// Rutina por producto
		if (resultados.length)
			resultados.forEach((resultado, i) => {
				resultados[i] = {
					...resultado,
					yaEnBD_id: resultado.id,
					anoEstreno: resultado.anoEstreno,
					epocaEstreno_id: epocasEstreno.find((n) => n.desde <= resultado.anoEstreno).id,
					nombreCastellano: resultado.nombre,
					entidadNombre: comp.obtieneDesdeEntidad.entidadNombre(resultado.entidad),
				};
			});

		// Fin
		return resultados;
	},
	grupos: {
		pers: (camposDA) => {
			// Variables
			const personajes = camposDA
				.find((n) => n.nombre == "personaje_id") // Obtiene los personajes
				.valores // Obtiene los valores
				.map((n) => {
					// Deja los datos necesarios
					return {
						id: n.id,
						nombre: n.nombre,
						categoria_id: n.categoria_id,
						epocaOcurrencia_id: n.epocaOcurrencia_id,
						rolIglesia_id: n.rolIglesia_id,
						apMar_id: n.apMar_id,
					};
				});
			let casosPuntuales = [];

			// Grupos Estándar
			let grupos = [
				{orden: 2, codigo: "ant", campo: "epocaOcurrencia_id", label: "Antiguo Testamento", clase: "CFC VPC"},
				{orden: 3, codigo: "SF", campo: "rolIglesia_id", label: "Sagrada Familia", clase: "CFC"},
				{orden: 4, codigo: "AL", campo: "rolIglesia_id", label: "Apóstoles", clase: "CFC"},
				{orden: 5, codigo: "cnt", campo: "epocaOcurrencia_id", label: "Contemporáneos de Cristo", clase: "CFC VPC"},
				{orden: 6, codigo: "PP", campo: "rolIglesia_id", label: "Papas", clase: "CFC"},
				{orden: 7, codigo: "pst", campo: "epocaOcurrencia_id", label: "Post. a Cristo (Fe Católica)", clase: "CFC"},
				{orden: 8, codigo: "pst", campo: "epocaOcurrencia_id", label: "Post. a Cristo (Con valores)", clase: "VPC"},
			];
			for (let grupo of grupos) grupo.valores = [];

			// Valores para los grupos
			for (let personaje of personajes) {
				// Clase
				personaje.clase = personaje.categoria_id ? personaje.categoria_id : "CFC VPC";
				if (personaje.apMar_id != sinApMar_id) personaje.clase += " AMA AM" + personaje.apMar_id;

				// Si tiene 'rolIglesia_id'
				if (personaje.rolIglesia_id) {
					let OK = false;
					// Si es alguno de los 'grupos'
					for (let grupo of grupos)
						if (personaje[grupo.campo].startsWith(grupo.codigo) && grupo.clase.includes(personaje.categoria_id)) {
							grupo.valores.push(personaje);
							OK = true;
							break;
						}
				}
				// Si no tiene 'rolIglesia_id' --> lo agrega a los casos puntuales
				else casosPuntuales.push(personaje);
			}
			// Grupo 'Casos Puntuales'
			grupos.push({codigo: "CP", orden: 1, label: "Casos Puntuales", valores: casosPuntuales, clase: "CFC VPC"});

			// Ordena los grupos
			grupos.sort((a, b) => a.orden - b.orden);

			// Fin
			return grupos;
		},
		hechos: (camposDA) => {
			// Variables
			const hechos = camposDA
				.find((n) => n.nombre == "hecho_id")
				.valores.map((n) => {
					const {id, nombre, soloCfc, epocaOcurrencia_id, ama} = n;
					return {id, nombre, soloCfc, epocaOcurrencia_id, ama};
				});
			const apMar = [];
			const casosPuntuales = [];

			// Grupos estándar
			let grupos = [
				// 1 - Casos especiales
				{codigo: "ant", orden: 2, label: "Antiguo Testamento"},
				{codigo: "cnt", orden: 3, label: "Nuevo Testamento"},
				{codigo: "pst", orden: 4, label: "Posterior a los Apóstoles"},
				// 5 - Apariciones Marianas
			];
			for (let grupo of grupos) {
				grupo.valores = [];
				grupo.clase = "CFC VPC";
			}

			// Valores para los grupos
			for (let hecho of hechos) {
				// Si es un caso que no se debe mostrar, lo saltea
				if (hecho.id == sinApMar_id) continue;

				// Variables
				let OK = false;
				hecho.clase = "CFC ";
				if (!hecho.soloCfc) hecho.clase += "VPC ";

				// Apariciones Marianas
				if (hecho.ama) {
					hecho.clase += "ama";
					apMar.push(hecho);
					OK = true;
				}

				// Si es alguno de los 'grupos'
				if (!OK)
					for (let grupo of grupos)
						if (hecho.epocaOcurrencia_id == grupo.codigo) {
							hecho.clase += grupo.codigo;
							grupo.valores.push(hecho);
							OK = true;
							break;
						}
				// Si no es ninguno de los 'grupos' --> lo agrega a los casos puntuales
				if (!OK) casosPuntuales.push(hecho);
			}

			// Grupos particulares
			grupos.push({codigo: "CP", orden: 1, label: "Casos Puntuales", clase: "CFC VPC", valores: casosPuntuales});
			grupos.push({codigo: "ama", orden: 5, label: "Apariciones Mariana", clase: "CFC", valores: apMar});

			// Ordena los grupos
			grupos.sort((a, b) => a.orden - b.orden);

			// Fin
			return grupos;
		},
	},

	// Particulares
	datosAdics: {
		valsCheckBtn: (datos) => {
			const camposChkBtn = variables.camposDA.filter((n) => n.chkBox).map((m) => m.nombre);
			for (let campo of camposChkBtn) datos[campo] = datos[campo] ? 1 : 0;
			return datos;
		},
		quitaCamposRCLV: (datos) => {
			const camposRCLV = variables.camposDA.filter((n) => n.rclv).map((m) => m.nombre);
			for (let campo of camposRCLV) if (datos.sinRCLV || datos[campo] == 1) delete datos[campo];
			return datos;
		},
		valorParaActores: (datos) => {
			// Acciones si no hay un valor para actores
			return datos.tipoActuacion_id == anime_id
				? dibujosAnimados
				: datos.tipoActuacion_id == documental_id
				? documental
				: datos.actores;
		},
		ayudas: {
			tituloSecundario: [
				"Necesitamos que nos des la información que no disponemos.",
				"Para cada dato, te sugerimos que consultes las ayudas.",
			],
			rclvs1: [
				"Podés ingresar un registro nuevo o modificar los actuales, haciendo <em>click</em> en los íconos de la derecha.",
				"Necesitamos que respondas por lo menos uno de los campos.",
			],
			rclv2: [
				"Podés ingresar un registro nuevo o modificar el actual, haciendo <em>click</em> en los íconos de la derecha.",
			],
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
					const registro = await baseDeDatos.obtienePorId(entidad, RCLV_id);
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
				...{coleccion_id, temporada: 1, capitulo: indice, capEnCons: true},
				...{paises_id, idiomaOriginal_id},
				...{direccion, guion, musica, actores, produccion},
				...{creadoPor_id: usAutom_id, statusSugeridoPor_id: usAutom_id, statusColeccion_id},
			};

			// Guarda los datos del capítulo
			await procsComp
				.obtieneInfoDeMovie({TMDB_id: capTMDB_id}) // Obtiene los datos del capítulo
				.then((n) => (n = {...datosCap, ...n})) // Le agrega los datos de cabecera
				.then(async (n) => await baseDeDatos.agregaRegistroIdCorrel("capitulos", n));

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
				const datos = this.datosCap(datosCol, datosTemp, datosCap); // Obtiene la información del capítulo
				await baseDeDatos.agregaRegistroIdCorrel("capitulos", datos); // Guarda el capítulo
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
				...{fuente: "TMDB", creadoPor_id: usAutom_id, statusSugeridoPor_id: usAutom_id, capEnCons: false},
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
			datos = comp.letras.convierteAlCastell(datos);

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
			resultado = comp.letras.convierteAlCastell(resultado);
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
const eliminaParentesis = (dato) => {
	const desde = dato.indexOf(" (");
	const hasta = dato.indexOf(")");
	return desde > 0 ? dato.slice(0, desde) + dato.slice(hasta + 1) : dato;
};
