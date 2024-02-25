"use strict";

module.exports = {
	// Institucional
	vistasInstitucs: {
		inicio: {titulo: "Inicio", codigo: "inicio", icono: "fa-house", hr: true}, // 'hr' significa que pone una línea divisoria en el menú del header
		"quienes-somos": {titulo: "ELC - Quiénes somos", codigo: "quienesSomos", icono: "fa-people-group"},
		"mision-y-vision": {titulo: "Nuestra Misión y Visión", codigo: "misionVision", icono: "fa-heart", hr: true},
		"en-que-consiste-este-sitio": {titulo: "En qué consiste este sitio", codigo: "enQueConsiste", icono: "fa-question"},
		"nuestro-perfil-de-peliculas": {
			titulo: "Nuestro Perfil de Películas",
			codigo: "perfilPelis",
			icono: "fa-trophy",
			hr: true,
		},
		"derechos-de-autor": {titulo: "Derechos de Autor", codigo: "derechosAutor", icono: "fa-copyright"},
	},
	asuntosContactanos: [
		{descripcion: "Comentario sobre nuestro sitio", codigo: "sitio"},
		{descripcion: "Quiero ser parte del equipo ELC", codigo: "equipo"},
		{descripcion: "Otro motivo", codigo: "varios"},
	],

	// Productos y RCLVs
	entidades: {
		prods: ["peliculas", "colecciones", "capitulos"],
		prodsNombre: ["Película", "Colección", "Capítulo de una colección"],
		asocProds:["pelicula", "coleccion", "capitulo"],
		rclvs: ["personajes", "hechos", "temas", "eventos", "epocasDelAno"],
		asocRclvs: ["personaje", "hecho", "tema", "evento", "epocaDelAno"],
		rclvs_id: ["personaje_id", "hecho_id", "tema_id", "evento_id", "epocaDelAno_id"],
		rclvsNombre: ["Personaje", "Hecho", "Tema", "Evento en el Año", "Epoca del Año"],
		usuarios: ["usuarios"], // Hace falta para la eliminación de avatars
	},

	// Consulta de Productos
	camposConsultas: {
		// Con una opción elegida siempre
		tipoLink: {
			default: "conLinks",
			opciones: [
				{id: "conLinks", nombre: "Con links", condic: {linksGral: conLinks}},
				{id: "conLinksHD", nombre: "Con links HD", condic: {HD_Gral: conLinks}},
				{id: "todos", nombre: "Con y sin links"},
			],
		},
		pppOpciones: {
			default: "6",
			opciones: [
				{id: "2", nombre: "Películas marcadas para ver"},
				{id: "3", nombre: "Películas sin marcar"},
				{id: "6", nombre: "Peliculas que me interesan"},
				{id: "todos", nombre: "Todas las preferencias"},
			],
		},
		idioma: {
			default: "enCast",
			opciones: [
				{
					id: "hablCast",
					nombre: "Hablada en castellano",
					condic: {
						conLinks: {linksCast: conLinks},
						conLinksHD: {HD_Cast: conLinks},
					},
				},
				{
					id: "enCast",
					nombre: "En castellano (habl./subt.)",
					condic: {
						conLinks: {[Op.or]: [{linksCast: conLinks}, {linksSubt: conLinks}]},
						conLinksHD: {[Op.or]: [{HD_Cast: conLinks}, {HD_Subt: conLinks}]},
					},
				},
				{id: "todos", nombre: "En cualquier idioma"},
			],
		},
		publicos: {
			//titulo: "Público Recomendado",
			default: "MC",
			opciones: [
				{id: "todos", nombre: "Todos los públicos"},
				{id: "MC", nombre: "Mayores o sin clasificar", condic: {publico_id: [null, ...mayores_ids]}},
				{id: "FM", nombre: "Familia", condic: {publico_id: familia_ids}},
				{id: "MN", nombre: "Menores", condic: {publico_id: menores_ids}},
			],
		},
		// criterioPago: {
		// 	titulo: "Criterio de Pago",
		// 	opciones: [
		// 		{id: "gratis", nombre: "Links gratuitos", condic: {linksGratis: conLinks}},
		// {id: "ppv"},
		// {id: "gratisPpv"},
		// {id: "misAbonos"},
		// {id: "gratisAbonos"},
		// 	{id: "", nombre: "Todos los criterios de pago"},
		// ],
		// },

		cfc: {
			titulo: "Relación con la Fe Católica",
			opciones: [
				{id: "1", nombre: "Con relac. c/Fe Católica"},
				{id: "0", nombre: "Sin relac. c/Fe Católica"},
			],
		},
		epocasEstreno: {titulo: "Época de Estreno", campoFiltro: "epocaEstreno_id"},
		epocasOcurrencia: {titulo: "Epoca de Ocurrencia", campoFiltro: "epocaOcurrencia_id"},
		tiposActuacion: {titulo: "Tipo de Actuación", campoFiltro: "tipoActuacion_id"},
		// Se muestran ocasionalmente
		bhr: {
			titulo: "Basado en Hechos Reales",
			campoFiltro: "bhr",
			opciones: [
				{id: "1", nombre: "Hechos Reales"},
				{id: "0", nombre: "Ficción"},
			],
		},
		apMar: {
			titulo: "Aparición Mariana",
			opciones: [
				{id: "SI", nombre: "Aparición Mariana", condic: {pers: {[Op.ne]: 10}, hec: 1}},
				{id: "NO", nombre: "Sin Aparición Mariana", condic: {pers: 10, hec: 0}},
			],
		},
		rolesIgl: {
			titulo: "Rol en la Iglesia",
			opciones: [
				{id: "L", nombre: "Laicos/as", condic: {[Op.startsWith]: "L"}},
				{id: "LC", nombre: "Laicos/as casados/as", condic: {[Op.startsWith]: "LC"}},
				{
					id: "RS",
					nombre: "Religiosos/as y Sacerdotes",
					condic: {[Op.or]: [{[Op.startsWith]: "RE"}, {[Op.startsWith]: "SC"}]},
				},
				{id: "PP", nombre: "Papas", condic: {[Op.startsWith]: "PP"}},
				{id: "AP", nombre: "Apóstoles", condic: {[Op.startsWith]: "AP"}},
				{id: "SF", nombre: "Sagrada Familia", condic: {[Op.startsWith]: "SF"}},
			],
		},
		canons: {
			titulo: "Proceso de Canonización",
			opciones: [
				{id: "SB", nombre: "Santos y Beatos", condic: {[Op.or]: [{[Op.startsWith]: "ST"}, {[Op.startsWith]: "BT"}]}},
				{
					id: "VS",
					nombre: "Vener. y Siervos de Dios",
					condic: {[Op.or]: [{[Op.startsWith]: "VN"}, {[Op.startsWith]: "SD"}]},
				},
				{id: "TD", nombre: "Santos a Siervos de Dios", condic: {[Op.notLike]: "NN%"}},
				{id: "NN", nombre: "Sin proceso de canonizac.", condic: {[Op.startsWith]: "NN"}},
			],
		},
		// entidad: {
		// 	titulo: "Películas / Colecciones",
		// 	opciones: [
		// 		{id: "peliculas", nombre: "Sólo películas"},
		// 		{id: "colecciones", nombre: "Sólo colecciones"},
		// 	],
		// },
	},

	// Agregar Productos
	camposDD: [
		{titulo: "Título en castellano", nombre: "nombreCastellano", productos: true, antesDePais: true, campoInput: true},
		{titulo: "Título original", nombre: "nombreOriginal", productos: true, antesDePais: true, campoInput: true},
		{titulo: "Año de estreno", nombre: "anoEstreno", numero: true, productos: true, antesDePais: true, campoInput: true},
		{titulo: "Año de finalización", nombre: "anoFin", numero: true, colecciones: true, antesDePais: true, campoInput: true},
		{
			titulo: "Duración (minutos)",
			nombre: "duracion",
			numero: true,
			peliculas: true,
			capitulos: true,
			antesDePais: true,
			campoInput: true,
		},
		{nombre: "paises_id", productos: true},
		{nombre: "idiomaOriginal_id", productos: true},
		{titulo: "Dirección", nombre: "direccion", productos: true, campoInput: true},
		{titulo: "Guión", nombre: "guion", productos: true, campoInput: true},
		{titulo: "Música", nombre: "musica", productos: true, campoInput: true},
		{titulo: "Actuación", nombre: "actores", productos: true, campoInput: true},
		{titulo: "Producción", nombre: "produccion", productos: true, campoInput: true},
		{nombre: "sinopsis", productos: true},
		{nombre: "avatar", productos: true},
	],
	camposDA: [
		{nombre: "cfc"},
		{nombre: "bhr"},
		{nombre: "color"},
		{nombre: "musical"},
		{nombre: "tipoActuacion_id"},
		{nombre: "publico_id"},
		{nombre: "epocaOcurrencia_id"},
		{nombre: "personaje_id", grupo: "RCLV"},
		{nombre: "hecho_id", grupo: "RCLV"},
		{nombre: "tema_id", grupo: "RCLV"},
		{nombre: "evento_id", grupo: "RCLV"},
		{nombre: "epocaDelAno_id", grupo: "RCLV"},
	],
	camposDA_conValores: async function (userID) {
		// Variables
		const entidadesRCLV = this.entidades.rclvs;
		const registrosRCLV = await regsRCLV(entidadesRCLV, userID);

		// Mensajes
		const mensajes = {
			publico: [
				"Mayores solamente: violencia que puede dañar la sensibilidad de un menor de hasta 12-14 años.",
				"Mayores apto familia: no se cumple lo anterior, pero es de poco interés para un menor de hasta 12-14 años.",
				"Familia: ideal para compartir en familia y que todos la disfruten.",
				"Menores apto familia: apuntado a un público infantil, pero también la puede disfrutar un adulto.",
				"Menores solamente: apuntado a un público solamente infantil.",
			],
			epocaOcurrencia: ["Varias: si el nudo de la trama ocurre en más de una época."],
			personaje: ["Si son varias las personas, podés poner la más representativa, o un nombre que las englobe a todas."],
			hecho: ["Si son varios los hechos, podés poner el más representativo, o uno genérico que los englobe a todos."],
		};
		return [
			{titulo: "Relación con la Iglesia Católica", nombre: "cfc", siNo: true},
			{titulo: "Basada en Hechos Reales", nombre: "bhr", siNo: true},
			{titulo: "Es a color", nombre: "color", siNo: true},
			{titulo: "Es un musical", nombre: "musical", siNo: true},
			{titulo: "Tipo de Actuación", nombre: "tipoActuacion_id", valores: tiposActuacion},
			{titulo: "Público sugerido", nombre: "publico_id", valores: publicos, mensajes: mensajes.publico},
			{
				titulo: "Época respecto a Cristo",
				nombre: "epocaOcurrencia_id",
				valores: epocasOcurrencia,
				mensajes: mensajes.epocaOcurrencia,
			},
			{
				titulo: "Personaje Histórico",
				nombre: "personaje_id",
				valores: registrosRCLV.personajes,
				mensajes: mensajes.personaje,
				link: "personajes",
				grupo: "RCLV",
			},
			{
				titulo: "Hecho Histórico",
				nombre: "hecho_id",
				valores: registrosRCLV.hechos,
				mensajes: mensajes.hecho,
				link: "hechos",
				grupo: "RCLV",
			},
			{
				titulo: "Tema Principal",
				nombre: "tema_id",
				valores: registrosRCLV.temas,
				mensajes: ["Poné el más representativo."],
				link: "temas",
				grupo: "RCLV",
			},
			{
				titulo: "Evento del Año",
				nombre: "evento_id",
				valores: registrosRCLV.eventos,
				mensajes: ["Poné el más representativo."],
				link: "eventos",
				grupo: "RCLV",
			},
			{
				titulo: "Epoca del Año",
				nombre: "epocaDelAno_id",
				valores: registrosRCLV.epocasDelAno,
				mensajes: ["Poné la fecha en la que comienza."],
				link: "epocasDelAno",
				grupo: "RCLV",
			},
		];
	},

	// RCLV
	prioridadesRCLV: [
		{id: 1, nombre: "Menor"},
		{id: 2, nombre: "Estándar"},
		{id: 3, nombre: "Mayor"},
	],
	camposEdicionRCLV: {
		personajes: [
			"nombre",
			"apodo",
			"fechaDelAno_id",
			"fechaMovil",
			"prioridad_id",
			"sexo_id",
			"epocaOcurrencia_id",
			"anoNacim",
			"categoria_id",
			"rolIglesia_id",
			"canon_id",
			"apMar_id",
			"avatar",
		],
		hechos: [
			"nombre",
			"anoComienzo",
			"fechaDelAno_id",
			"fechaMovil",
			"prioridad_id",
			"epocaOcurrencia_id",
			"soloCfc",
			"ama",
			"avatar",
		],
		temas: ["nombre", "fechaDelAno_id", "fechaMovil", "prioridad_id", "avatar"],
		eventos: ["nombre", "fechaDelAno_id", "fechaMovil", "prioridad_id", "avatar"],
		epocasDelAno: [
			"nombre",
			"fechaDelAno_id",
			"fechaMovil",
			"comentarioMovil",
			"diasDeDuracion",
			"comentarioDuracion",
			"prioridad_id",
			"carpetaAvatars",
			"avatar",
		],
	},
	prefijos: [
		"Beata",
		"Beato",
		"Cardenal",
		"Don",
		"Hna",
		"Obispo",
		"Padre",
		"Papa",
		"San",
		"Santo",
		"Santa",
		"Sor",
		"Ven",
		"Venerable",
	],
	// Nombres que llevan el prefijo "Santo"
	prefijoSanto: ["Domingo", "Tomás", "Tomas", "Tomé", "Toribio"], // ponemos 'Tomas' sin acento, por si alguien lo escribe mal

	// Links
	provsQueNoRespetanCopyright: [
		{nombre: "Gloria TV", url: "gloria.tv"},
		{nombre: "Cuevana", url: "cuevana"},
		{nombre: "Google Drive", url: "drive.google.com/"},
	],
	provsListaNegra: ["gloria.tv"],
	calidades: [240, 360, 480, 720, 1080],

	// Entorno Revisiones
	camposRevisar: {
		// Campos
		// productos, películas, colecciones, capítulos --> para filtrar los campos por entidad
		// input --> en los motivos de rechazo, para saber si se escribió a mano
		productos: [
			// Todos
			{titulo: "Título en castellano", nombre: "nombreCastellano", input: true, productos: true},
			{titulo: "Título original", nombre: "nombreOriginal", input: true, productos: true},
			{titulo: "Año de estreno", nombre: "anoEstreno", angosto: true, input: true, productos: true},
			{titulo: "País/es", nombre: "paises_id", productos: true},
			{
				titulo: "Idioma Original",
				nombre: "idiomaOriginal_id",
				relacInclude: "idioma_original",
				tabla: "idiomas",
				productos: true,
			},
			{titulo: "Dirección", nombre: "direccion", input: true, productos: true},
			{titulo: "Guión", nombre: "guion", input: true, productos: true},
			{titulo: "Música", nombre: "musica", input: true, productos: true},
			{titulo: "Actores", nombre: "actores", input: true, productos: true},
			{titulo: "Producción", nombre: "produccion", input: true, productos: true},
			{titulo: "Sinopsis", nombre: "sinopsis", input: true, productos: true},
			{titulo: "Avatar", nombre: "avatar", productos: true},
			{titulo: "Avatar_url", nombre: "avatarUrl"}, // es necesario para 'agregar-prod'
			{titulo: "Relación con la Iglesia Católica", nombre: "cfc", productos: true},
			{titulo: "Basada en Hechos Reales", nombre: "bhr", productos: true},
			{titulo: "Es un musical", nombre: "musical", productos: true},
			{titulo: "Es a color", nombre: "color", productos: true},
			{
				titulo: "Tipo de Actuación",
				nombre: "tipoActuacion_id",
				relacInclude: "tipoActuacion",
				tabla: "tiposActuacion",
				productos: true,
			},
			{titulo: "Público sugerido", nombre: "publico_id", relacInclude: "publico", tabla: "publicos", productos: true},
			{
				titulo: "Personaje histórico",
				nombre: "personaje_id",
				relacInclude: "personaje",
				tabla: "personajes",
				rclv: true,
				productos: true,
			},
			{titulo: "Hecho histórico", nombre: "hecho_id", relacInclude: "hecho", tabla: "hechos", rclv: true, productos: true},
			{titulo: "Tema principal", nombre: "tema_id", relacInclude: "tema", tabla: "temas", rclv: true, productos: true},
			{
				titulo: "Evento del año",
				nombre: "evento_id",
				relacInclude: "evento",
				tabla: "eventos",
				rclv: true,
				productos: true,
			},
			{
				titulo: "Época del año",
				nombre: "epocaDelAno_id",
				relacInclude: "epocaDelAno",
				tabla: "epocasDelAno",
				rclv: true,
				productos: true,
			},
			{
				titulo: "Época respecto a Cristo",
				nombre: "epocaOcurrencia_id",
				relacInclude: "epocaOcurrencia",
				tabla: "epocasOcurrencia",
				productos: true,
			},
			// Películas y Capítulos
			{titulo: "Duración", nombre: "duracion", angosto: true, input: true, peliculas: true, capitulos: true},
			// Colecciones
			{titulo: "Año de finalización", nombre: "anoFin", angosto: true, input: true, colecciones: true},
		],
		rclvs: [
			// Todos
			{nombre: "nombre", titulo: "Nombre", rclvs: true},
			{nombre: "fechaDelAno_id", titulo: "Día del Año", rclvs: true, relacInclude: "fechaDelAno", tabla: "fechasDelAno"},
			{nombre: "fechaMovil", titulo: "Fecha Móvil", rclvs: true},
			{nombre: "anoFM", titulo: "Año Fecha Móvil", rclvs: true},
			{nombre: "comentarioMovil", titulo: "Comentario Móvil", rclvs: true},
			{nombre: "prioridad_id", titulo: "Prioridad", rclvs: true},
			{nombre: "avatar", titulo: "Avatar", rclvs: true},

			// Personajes y Hechos
			{
				nombre: "epocaOcurrencia_id",
				titulo: "Epoca",
				personajes: true,
				hechos: true,
				relacInclude: "epocaOcurrencia",
				tabla: "epocasOcurrencia",
			},
			// Personajes
			{nombre: "apodo", titulo: "Alternativo", personajes: true},
			{nombre: "sexo_id", titulo: "Sexo", personajes: true, relacInclude: "sexo", tabla: "sexos"},
			{nombre: "anoNacim", titulo: "Año de Nacim.", personajes: true},
			{nombre: "categoria_id", titulo: "Categoría", personajes: true, relacInclude: "categoria", tabla: "categorias"},
			{
				nombre: "rolIglesia_id",
				titulo: "Rol en la Iglesia",
				personajes: true,
				relacInclude: "rolIglesia",
				tabla: "rolesIglesia",
			},
			{
				nombre: "canon_id",
				titulo: "Proceso de Canonizac.",
				personajes: true,
				relacInclude: "canon",
				tabla: "canons",
			},
			{nombre: "apMar_id", titulo: "Aparición Mariana", personajes: true, relacInclude: "apMar", tabla: "hechos"},
			// Hechos
			{nombre: "anoComienzo", titulo: "Año de Comienzo", hechos: true},
			{nombre: "soloCfc", titulo: "Hecho de la Iglesia", hechos: true},
			{nombre: "ama", titulo: "Es una aparición mariana", hechos: true},
			// Epocas del año
			{nombre: "diasDeDuracion", titulo: "Días de Duración", epocasDelAno: true},
			{nombre: "comentarioDuracion", titulo: "Comentario Duración", epocasDelAno: true},
			{nombre: "carpetaAvatars", titulo: "Carpeta de Imágenes", epocasDelAno: true},
		],
		links: [
			{nombre: "calidad", titulo: "Calidad", links: true},
			{nombre: "castellano", titulo: "En castellano", links: true},
			{nombre: "subtitulos", titulo: "Subtítulos", links: true},
			{nombre: "gratuito", titulo: "Gratuito", links: true},
			{nombre: "tipo_id", titulo: "Tipo", links: true},
			{nombre: "completo", titulo: "Completo", links: true},
			{nombre: "parte", titulo: "Parte", links: true},
		],
	},
	avatarsExternos: (nombre) => {
		return [
			{
				href: "//themoviedb.org/search?query=" + nombre,
				src: "/publico/imagenes/Logos-gral/BD-TMDB.jpg",
				alt: "TMDB",
			},
			{
				href: "//filmaffinity.com/es/search.php?stext=" + nombre,
				src: "/publico/imagenes/Logos-gral/BD-FA.jpg",
				alt: "FA",
			},
			{
				href: "//imdb.com/find?q=" + nombre,
				src: "/publico/imagenes/Logos-gral/BD-IMDB.jpg",
				alt: "IMDB",
			},
			{
				href: "//google.com/search?q=" + nombre + "&tbm=isch&tbs=isz:l&hl=es-419",
				src: "/publico/imagenes/Logos-gral/BD-Google.jpg",
				alt: "Google",
			},
		];
	},

	// Mensajes
	inputVacio: "Necesitamos que completes este campo",
	selectVacio: "Necesitamos que elijas una opción",
	radioVacio: "Necesitamos que elijas una opción",
	urlDesconocida: "No tenemos esa dirección de url en nuestro sistema",
	rclvSinElegir: "Necesitamos que respondas alguna de las opciones",

	// Links a vistas
	vistaInicio: {nombre: "fa-house", link: "/", titulo: "Ir a 'Inicio'"},
	vistaAnterior: (url) => {
		return {nombre: "fa-circle-left", link: url ? url : "/", titulo: "Ir a la vista anterior"};
	},
	vistaActual: (req) => {
		return {nombre: "fa-rotate-right", link: req.originalUrl, titulo: "Volver a intentarlo"};
	},
	vistaSiguiente: (url) => {
		return {nombre: "fa-circle-right", link: url ? url : "/", titulo: "Ir a la vista siguiente"};
	},
	vistaInactivar: (req) => {
		return req.originalUrl.startsWith("/revision/")
			? {
					nombre: "fa-spell-check",
					link: "/inactivar-captura/?entidad=" + req.query.entidad + "&id=" + req.query.id + "&origen=TE",
					titulo: "Ir al 'Tablero de Control' de Revisiones",
					autofocus: true,
			  }
			: req.originalUrl.startsWith("/producto/") || req.originalUrl.startsWith("/links/abm/")
			? {
					nombre: "fa-circle-info",
					link: "/producto/detalle/?entidad=" + req.query.entidad + "&id=" + req.query.id,
					titulo: "Ir al 'Detalle de Producto'",
					autofocus: true,
			  }
			: req.originalUrl.startsWith("/rclv/")
			? {
					nombre: "fa-circle-info",
					link: "/rclv/detalle/?entidad=" + req.query.entidad + "&id=" + req.query.id,
					titulo: "Ir al 'Detalle de RCLV'",
					autofocus: true,
			  }
			: {};
	},
	vistaTablero: {
		nombre: "fa-spell-check",
		link: "/revision/tablero-de-control",
		titulo: "Ir al 'Tablero de Control' de Revisiones",
		autofocus: true,
	},
	vistaEntendido: (url) => {
		return {nombre: "fa-thumbs-up", link: url ? url : "/", titulo: "Entendido"};
	},
};

let regsRCLV = async (entidades, userID) => {
	const condics = {[Op.or]: {statusRegistro_id: aprobado_id, [Op.and]: {statusRegistro_id: creado_id, creadoPor_id: userID}}};
	let valores = [];
	let registrosRCLV = {};

	// Obtiene los registrosRCLV
	for (let entidad of entidades)
		valores.push(BD_genericas.obtieneTodosPorCondicionConInclude(entidad, condics, "statusRegistro"));
	valores = await Promise.all(valores);

	// Pule la información
	entidades.forEach((entidad, i) => {
		// Ordena los registros por nombre
		valores[i].sort((a, b) => (a.nombre.toLowerCase() < b.nombre.toLowerCase() ? -1 : 1));
		// Fin
		registrosRCLV[entidad] = valores[i];
	});

	// Fin
	return registrosRCLV;
};
