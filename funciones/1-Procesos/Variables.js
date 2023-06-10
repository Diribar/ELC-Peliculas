"use strict";
// Definir variables
const BD_genericas = require("../2-BD/Genericas");

module.exports = {
	// Inicio
	opcionesInicio: [
		{
			href: "/consultas/listado",
			src: "/imagenes/0-Base/Inicio/Recomendame.jpg",
			p: "Quiero que me recomienden una película o colección",
		},
		{
			href: "/consultas/listado/cfc",
			src: "/imagenes/0-Base/Inicio/Cruz.jpg",
			p: "Un paseo por nuestras peliculas Centradas en la Fe Católica (CFC)",
		},
		{
			href: "/consultas/listado/vpc",
			src: "/imagenes/0-Base/Inicio/Valores.jpg",
			p: "Un paseo por nuestras peliculas que sin ser CFC, tienen Valores Presentes en nuestra Cultura (VPC)",
		},
	],

	// Productos y RCLVs
	entidades: {
		prods: ["peliculas", "colecciones", "capitulos"],
		rclvs: ["personajes", "hechos", "temas", "eventos", "epocasDelAno"],
	},

	// Consulta de Productos
	filtrosConsultas: {
		// Producto
		cfc: {
			titulo: "Relación con la Fe Católica",
			opciones: [
				{id: "CFC", nombre: "Fe Católica"},
				{id: "VPC", nombre: "Sin Fe Católica"},
			],
		},
		ocurrio: {
			titulo: "Hechos Reales / Ficción",
			opciones: [
				{id: "pers", nombre: "Con Personaje Histórico"},
				{id: "hecho", nombre: "Con Hecho Histórico"},
				{id: "SI", nombre: "Ocurrió"},
				{id: "NO", nombre: "Ficción"},
			],
		},
		publicos: {
			titulo: "Público Recomendado",
		},
		epocasEstreno: {
			titulo: "Época de Estreno",
			opciones: [
				{id: "1969", nombre: "Antes de 1970", desde: "0", hasta: "1969"},
				{id: "1999", nombre: "1970 - 1999", desde: "1970", hasta: "1999"},
				{id: "2015", nombre: "2000 - 2015", desde: "2000", hasta: "2015"},
				{id: "2016", nombre: "2016 - Presente", desde: "2016", hasta: "3000"},
			],
		},
		tiposLink: {
			titulo: "Tipos de link",
			opciones: [
				{id: "gratis", nombre: "Links gratuitos"},
				{id: "todos", nombre: "Links de cualquier tipo"},
				{id: "soloPagos", nombre: "Solamente links con pago"},
				{id: "sin", nombre: "Sin Links"},
			],
		},
		castellano: {
			titulo: "Idioma Castellano",
			opciones: [
				{id: "SI", nombre: "Hablada en castellano"},
				{id: "subt", nombre: "Subtítulos en castellano"},
				{id: "cast", nombre: "En castellano (habl./subt.)"},
				{id: "NO", nombre: "En otro idioma"},
			],
		},
		tiposActuacion: {
			titulo: "Tipo de Actuación",
		},
		musical: {
			titulo: "Musical",
			opciones: [
				{id: "SI", nombre: "Es un musical"},
				{id: "NO", nombre: "No es un musical"},
			],
		},
		// RCLVs
		epocas: {
			titulo: "Epoca",
		},
		apMar: {
			titulo: "Aparición Mariana",
			opciones: [
				{id: "SI", nombre: "Aparición Mariana"},
				{id: "NO", nombre: "Sin Aparición Mariana"},
			],
		},
		canons: {
			titulo: "Proceso de Canonización",
			opciones: [
				{id: "sb", nombre: "Santos y Beatos"},
				{id: "vs", nombre: "Vener. y Siervos de Dios"},
				{id: "nn", nombre: "Sin proceso de canonizac."},
			],
		},
		rolesIglesia: {
			titulo: "Rol en la Iglesia",
			opciones: [
				{id: "la", nombre: "Laicos/as"},
				{id: "lc", nombre: "Laicos/as casados/as"},
				{id: "rs", nombre: "Religiosos/as y Sacerdotes"},
				{id: "pp", nombre: "Papas"},
				{id: "ap", nombre: "Apóstoles"},
				{id: "sf", nombre: "Sagrada Familia"},
			],
		},
	},

	// Agregar Productos
	camposDD: [
		{titulo: "Título original", nombre: "nombreOriginal", productos: true, antesDePais: true, campoInput: true},
		{titulo: "Título en castellano", nombre: "nombreCastellano", productos: true, antesDePais: true, campoInput: true},
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
		{titulo: "Actores", nombre: "actores", productos: true, campoInput: true},
		{titulo: "Producción", nombre: "produccion", productos: true, campoInput: true},
		{nombre: "sinopsis", productos: true},
		{nombre: "avatar", productos: true},
	],
	camposDA: [
		{nombre: "cfc"},
		{nombre: "ocurrio"},
		{nombre: "color"},
		{nombre: "musical"},
		{nombre: "tipoActuacion_id"},
		{nombre: "publico_id"},
		{nombre: "epoca_id"},
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
				"Mayores solamente: violencia o sensualidad, que pueden dañar la sensibilidad de un menor de hasta 12-14 años.",
				"Mayores apto familia: no se cumple lo anterior, pero es de poco interés para un menor de hasta 12-14 años.",
				"Familia: ideal para compartir en familia y que todos la disfruten.",
				"Menores apto familia: apuntado a un público infantil, pero también la puede disfrutar un adulto.",
				"Menores solamente: apuntado a un público solamente infantil.",
			],
			epoca: ["Antes, durante o después de Cristo."],
			personaje: ["Si son varias las personas, podés poner la más representativa, o un nombre que las englobe a todas."],
			hecho: ["Si son varios los hechos, podés poner el más representativo, o uno genérico que los englobe a todos."],
		};
		return [
			{titulo: "Relación con la Iglesia Católica", nombre: "cfc", siNo: true},
			{titulo: "Basada en Hechos Reales", nombre: "ocurrio", siNo: true},
			{titulo: "Es a color", nombre: "color", siNo: true},
			{titulo: "Es un musical", nombre: "musical", siNo: true},
			{titulo: "Tipo de Actuación", nombre: "tipoActuacion_id", valores: tiposActuacion},
			{titulo: "Público sugerido", nombre: "publico_id", valores: publicos, mensajes: mensajes.publico},
			{titulo: "Época respecto a Cristo", nombre: "epoca_id", valores: epocas, mensajes: mensajes.epoca},
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
	camposCapsQueNoSeHeredan:["nombreOriginal","nombreCastellano","anoEstreno","sinopsis","avatar"],

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
			"diaDelAno_id",
			"fechaMovil",
			"prioridad_id",
			"sexo_id",
			"epoca_id",
			"ano",
			"categoria_id",
			"rolIglesia_id",
			"canon_id",
			"apMar_id",
			"avatar",
		],
		hechos: ["nombre", "ano", "diaDelAno_id", "fechaMovil", "prioridad_id", "epoca_id", "solo_cfc", "ama", "avatar"],
		temas: ["nombre", "diaDelAno_id", "fechaMovil", "prioridad_id", "avatar"],
		eventos: ["nombre", "diaDelAno_id", "fechaMovil", "prioridad_id", "avatar"],
		epocasDelAno: [
			"nombre",
			"diaDelAno_id",
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
			{titulo: "Basada en Hechos Reales", nombre: "ocurrio", productos: true},
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
				nombre: "epoca_id",
				relacInclude: "epoca",
				tabla: "epocas",
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
			{nombre: "diaDelAno_id", titulo: "Día del Año", rclvs: true, relacInclude: "diaDelAno", tabla: "diasDelAno"},
			{nombre: "fechaMovil", titulo: "Fecha Móvil", rclvs: true},
			{nombre: "comentarioMovil", titulo: "Comentario Móvil", rclvs: true},
			{nombre: "prioridad_id", titulo: "Prioridad", rclvs: true},
			{nombre: "avatar", titulo: "Avatar", rclvs: true},

			// Personajes y Hechos
			{nombre: "ano", titulo: "Año", personajes: true, hechos: true},
			{nombre: "epoca_id", titulo: "Epoca", personajes: true, hechos: true, relacInclude: "epoca", tabla: "epocas"},
			// Personajes
			{nombre: "apodo", titulo: "Nombre Alternativo", personajes: true},
			{nombre: "sexo_id", titulo: "Sexo", personajes: true, relacInclude: "sexo", tabla: "sexos"},
			{nombre: "categoria_id", titulo: "Categoría", personajes: true, relacInclude: "categoria", tabla: "categorias"},
			{
				nombre: "rolIglesia_id",
				titulo: "Rol en la Iglesia",
				personajes: true,
				relacInclude: "rolIglesia",
				tabla: "roles_iglesia",
			},
			{
				nombre: "canon_id",
				titulo: "Proceso de Canonizac.",
				personajes: true,
				relacInclude: "canon",
				tabla: "canons",
			},
			{nombre: "apMar_id", titulo: "Aparición Mariana", personajes: true, relacInclude: "ap_mar", tabla: "hechos"},
			// Hechos
			{nombre: "solo_cfc", titulo: "Hecho de la Iglesia", hechos: true},
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
				src: "/imagenes/0-Base/Logos/BD-TMDB.jpg",
				alt: "TMDB",
			},
			{
				href: "//filmaffinity.com/es/search.php?stext=" + nombre,
				src: "/imagenes/0-Base/Logos/BD-FA.jpg",
				alt: "FA",
			},
			{
				href: "//imdb.com/find?q=" + nombre,
				src: "/imagenes/0-Base/Logos/BD-IMDB.jpg",
				alt: "IMDB",
			},
			{
				href: "//google.com/search?q=" + nombre + "&tbm=isch&tbs=isz:l&hl=es-419",
				src: "/imagenes/0-Base/Logos/BD-Google.jpg",
				alt: "Google",
			},
		];
	},

	// Mensajes
	inputVacio: "Necesitamos que completes este campo",
	selectVacio: "Necesitamos que elijas una opción",
	radioVacio: "Necesitamos que elijas una opción",
	urlDesconocida: "No tenemos esa dirección de url en nuestro sistema",

	// Links a vistas
	vistaInicio: {nombre: "fa-house", link: "/", titulo: "Ir a 'Inicio'"},
	vistaActual: (req) => {
		return {nombre: "fa-rotate-right", link: req.originalUrl, titulo: "Volver a intentarlo"};
	},
	vistaAnterior: (url) => {
		return {nombre: "fa-circle-left", link: url ? url : "/", titulo: "Ir a la vista anterior"};
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
	let valores = [];
	let registrosRCLV = {};

	// Obtiene los registrosRCLV
	for (let entidad of entidades) valores.push(BD_genericas.obtieneTodosConInclude(entidad, "statusRegistro"));
	valores = await Promise.all(valores);

	// Pule la información
	entidades.forEach((entidad, i) => {
		// Deja solamente los registros aprobados o creados por el usuario
		valores[i] = valores[i].filter(
			(n) => n.statusRegistro.aprobado || (n.statusRegistro.creado && n.creadoPor_id == userID)
		);
		// Los ordena por nombre
		valores[i].sort((a, b) => (a.nombre < b.nombre ? -1 : a.nombre > b.nombre ? 1 : 0));
		// Fin
		registrosRCLV[entidad] = valores[i];
	});

	// Fin
	return registrosRCLV;
};
