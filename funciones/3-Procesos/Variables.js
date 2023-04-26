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
		tipos_actuacion: {
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
		{titulo: "Título original", nombre: "nombre_original", productos: true, antesDePais: true, campoInput: true},
		{titulo: "Título en castellano", nombre: "nombre_castellano", productos: true, antesDePais: true, campoInput: true},
		{titulo: "Año de estreno", nombre: "ano_estreno", numero: true, productos: true, antesDePais: true, campoInput: true},
		{titulo: "Año de finalización", nombre: "ano_fin", numero: true, colecciones: true, antesDePais: true, campoInput: true},
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
		{nombre: "idioma_original_id", productos: true},
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
		{nombre: "tipo_actuacion_id"},
		{nombre: "publico_id"},
		{nombre: "personaje_id", grupo: "RCLV"},
		{nombre: "hecho_id", grupo: "RCLV"},
		{nombre: "tema_id", grupo: "RCLV"},
		{nombre: "evento_id", grupo: "RCLV"},
		{nombre: "epoca_del_ano_id", grupo: "RCLV"},
	],
	camposDA_conValores: async function (userID) {
		// Variables
		const entidadesRCLV = this.entidadesRCLV;
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
			personaje: ["Si son varias las personas, podés poner la más representativa, o un nombre que las englobe a todas."],
			hecho: ["Si son varios los hechos, podés poner el más representativo, o uno genérico que los englobe a todos."],
		};
		return [
			{titulo: "Relación con la Iglesia Católica", nombre: "cfc", siNo: true},
			{titulo: "Basada en Hechos Reales", nombre: "ocurrio", siNo: true},
			{titulo: "Es a color", nombre: "color", siNo: true},
			{titulo: "Es un musical", nombre: "musical", siNo: true},
			{titulo: "Tipo de Actuación", nombre: "tipo_actuacion_id", valores: tipos_actuacion},
			{titulo: "Público sugerido", nombre: "publico_id", valores: publicos, mensajes: mensajes.publico},
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
				nombre: "epoca_del_ano_id",
				valores: registrosRCLV.epocas_del_ano,
				mensajes: ["Poné la fecha en la que comienza."],
				link: "epocas_del_ano",
				grupo: "RCLV",
			},
		];
	},
	entidadesProd: ["peliculas", "colecciones", "capitulos"],

	// RCLV
	entidadesRCLV: ["personajes", "hechos", "temas", "eventos", "epocas_del_ano"],
	prioridadesRCLV: [
		{id: 1, nombre: "Menor"},
		{id: 2, nombre: "Estándar"},
		{id: 3, nombre: "Mayor"},
	],
	camposEdicionRCLV: {
		personajes: [
			"nombre",
			"apodo",
			"dia_del_ano_id",
			"fecha_movil",
			"prioridad_id",
			"sexo_id",
			"epoca_id",
			"ano",
			"categoria_id",
			"rol_iglesia_id",
			"canon_id",
			"ap_mar_id",
			"avatar",
		],
		hechos: ["nombre", "ano", "dia_del_ano_id", "fecha_movil", "prioridad_id", "epoca_id", "solo_cfc", "ama", "avatar"],
		temas: ["nombre", "dia_del_ano_id", "fecha_movil", "prioridad_id", "avatar"],
		eventos: ["nombre", "dia_del_ano_id", "fecha_movil", "prioridad_id", "avatar"],
		epocas_del_ano: ["nombre", "dia_del_ano_id", "fecha_movil", "dias", "prioridad_id", "avatar"],
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
			{titulo: "Título original", nombre: "nombre_original", input: true, productos: true},
			{titulo: "Título en castellano", nombre: "nombre_castellano", input: true, productos: true},
			{titulo: "Año de estreno", nombre: "ano_estreno", angosto: true, input: true, productos: true},
			{titulo: "País/es", nombre: "paises_id", productos: true},
			{
				titulo: "Idioma Original",
				nombre: "idioma_original_id",
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
			{titulo: "Avatar_url", nombre: "avatar_url"}, // es necesario para 'agregar-prod'
			{titulo: "Relación con la Iglesia Católica", nombre: "cfc", productos: true},
			{titulo: "Basada en Hechos Reales", nombre: "ocurrio", productos: true},
			{titulo: "Es un musical", nombre: "musical", productos: true},
			{titulo: "Es a color", nombre: "color", productos: true},
			{
				titulo: "Tipo de Actuación",
				nombre: "tipo_actuacion_id",
				relacInclude: "tipo_actuacion",
				tabla: "tipos_actuacion",
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
			// Películas y Capítulos
			{titulo: "Duración", nombre: "duracion", angosto: true, input: true, peliculas: true, capitulos: true},
			// Colecciones
			{titulo: "Año de finalización", nombre: "ano_fin", angosto: true, input: true, colecciones: true},
		],
		rclvs: [
			// Todos
			{nombre: "nombre", titulo: "Nombre", rclvs: true},
			{nombre: "dia_del_ano_id", titulo: "Día del Año", rclvs: true, relacInclude: "dia_del_ano", tabla: "dias_del_ano"},
			{nombre: "fecha_movil", titulo: "Fecha Móvil", rclvs: true},
			{nombre: "comentario_movil", titulo: "Comentario Móvil", rclvs: true},
			{nombre: "prioridad_id", titulo: "prioridad_id", rclvs: true},
			{nombre: "avatar", titulo: "Avatar", rclvs: true},

			// Personajes y Hechos
			{nombre: "ano", titulo: "Año", personajes: true, hechos: true},
			{nombre: "epoca_id", titulo: "Epoca", personajes: true, hechos: true, relacInclude: "epoca", tabla: "epocas"},
			// Personajes
			{nombre: "apodo", titulo: "Nombre Alternativo", personajes: true},
			{nombre: "sexo_id", titulo: "Sexo", personajes: true, relacInclude: "sexo", tabla: "sexos"},
			{nombre: "categoria_id", titulo: "Categoría", personajes: true, relacInclude: "categoria", tabla: "categorias"},
			{
				nombre: "rol_iglesia_id",
				titulo: "Rol en la Iglesia",
				personajes: true,
				relacInclude: "rol_iglesia",
				tabla: "roles_iglesia",
			},
			{
				nombre: "canon_id",
				titulo: "Proceso de Canonizac.",
				personajes: true,
				relacInclude: "canon",
				tabla: "canons",
			},
			{nombre: "ap_mar_id", titulo: "Aparición Mariana", personajes: true, relacInclude: "ap_mar", tabla: "hechos"},
			// Hechos
			{nombre: "solo_cfc", titulo: "Hecho de la Iglesia", hechos: true},
			{nombre: "ama", titulo: "Es una aparición mariana", hechos: true},
			// Epocas del año
			{nombre: "dias_de_duracion", titulo: "Días de Duración", epocas_del_ano: true},
			{nombre: "comentario_duracion", titulo: "Comentario Duración", epocas_del_ano: true},
			{nombre: "carpeta_avatars", titulo: "Carpeta de Imágenes", epocas_del_ano: true},
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
	avatarExternoProds: (nombre) => {
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
	avatarExternoRCLVs: (nombre) => {
		return [
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
	for (let entidad of entidades) valores.push(BD_genericas.obtieneTodosConInclude(entidad, "status_registro"));
	valores = await Promise.all(valores);

	// Pule la información
	entidades.forEach((entidad, i) => {
		// Deja solamente los registros aprobados o creados por el usuario
		valores[i] = valores[i].filter(
			(n) => n.status_registro.aprobado || (n.status_registro.creado && n.creado_por_id == userID)
		);
		// Los ordena por nombre
		valores[i].sort((a, b) => (a.nombre < b.nombre ? -1 : a.nombre > b.nombre ? 1 : 0));
		// Fin
		registrosRCLV[entidad] = valores[i];
	});

	// Fin
	return registrosRCLV;
};
