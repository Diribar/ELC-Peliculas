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
	layouts: [
		{nombre: "Listado de Imágenes", url: "listado"},
		{nombre: "Películas con Personaje Histórico", url: "personajes", bhr: true},
		{nombre: "Películas con Hecho Histórico", url: "hechos", bhr: true},
		{nombre: "Películas con Valores", url: "valores"},
	],
	orden: [
		{nombre: "Sugeridas para el momento del año", valor: "momento", asc: true, siempre: true},
		{nombre: "Por fecha interna de agregado", valor: "incorporacion", siempre: true},
		{nombre: "Por año de estreno", valor: "estreno", siempre: true},
		{nombre: "Por año de nacimiento del personaje", valor: "estreno", bhr: true, personajes: true},
		{nombre: "Por año de ocurrencia del hecho", valor: "estreno", bhr: true, hechos: true},
		{nombre: "Por año de nacimiento u ocurrencia", valor: "estreno", bhr: true, listado: true},
		{nombre: "Por nombre del personaje", valor: "rclv", asc: true, personajes: true},
		{nombre: "Por nombre del hecho", valor: "rclv", asc: true, hechos: true},
		{nombre: "Por nombre del valor", valor: "rclv", asc: true, valores: true},
		{nombre: "Por nombre de la película o colección", valor: "producto", asc: true, siempre: true},
		{nombre: "Por calificación interna", valor: "calificacion", siempre: true},
	],
	camposFiltros: {
		// Principales
		categorias: {
			titulo: "Relacionada con la Fe Católica",
			siempre: true,
			opciones: [
				{id: "CFC", nombre: "SI"},
				{id: "VPC", nombre: "NO"},
			],
		},
		hechosReales: {
			titulo: "Hechos Reales / Ficción",
			listado: true,
			valores: true,
			opciones: [
				{id: "Pers", nombre: "Con Personaje Histórico"},
				{id: "Hecho", nombre: "Con Hecho Histórico"},
				{id: "PersHecho", nombre: "Con Personaje y/o Hecho"},
				{id: "Ficcion", nombre: "Ficción"},
			],
		},
		// RCLV
		personajes: {
			titulo: "Personaje Histórico",
			listado: true,
			personajes: true,
			valores: true,
		},
		hechos: {
			titulo: "Hecho Histórico",
			listado: true,
			hechos: true,
			valores: true,
		},
		valores: {
			titulo: "Valor",
			siempre: true,
		},
		// Otros
		publicos: {
			titulo: "Público Recomendado",
			siempre: true,
		},
		epocasEstreno: {
			titulo: "Época de Estreno",
			siempre: true,
			opciones: [
				{id: "1969", nombre: "Antes de 1970"},
				{id: "1999", nombre: "1970 - 1999"},
				{id: "2015", nombre: "2000 - 2015"},
				{id: "2016", nombre: "2016 - Presente"},
			],
		},
		tipos_actuacion: {
			titulo: "Tipo de Actuación",
			siempre: true,
		},
		interes_opciones: {
			titulo: "Interés en la Película",
			siempre: true,
		},
		links: {
			titulo: "Links",
			siempre: true,
			opciones: [
				{id: "CFC", nombre: "Con links gratuitos"},
				{id: "VPC", nombre: "Con links de abono o 'pay per view'"},
				{id: "VPC", nombre: "Todos los links"},
			],
		},
		castellano: {
			titulo: "Idioma Castellano",
			siempre: true,
			opciones: [
				{id: "SI", nombre: "Hablada en castellano"},
				{id: "Subt", nombre: "Subtítulos en castellano"},
				{id: "NO", nombre: "En otro idioma"},
			],
		},
		musical: {
			titulo: "Es un musical",
			siempre: true,
			opciones: [
				{id: "SI", nombre: "SI"},
				{id: "NO", nombre: "NO"},
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
		{nombre: "valor_id", grupo: "RCLV"},
	],
	camposDA_conValores: async function (userID) {
		// Variables
		const registrosRCLV = await (async () => {
			// Variables
			let registros = {};
			let entidades = this.entidadesRCLV;

			// Obtiene todos los registros RCLV
			entidades.forEach((entidad) => {
				registros[entidad] = BD_genericas.obtieneTodosConInclude(entidad, "status_registro");
			});
			let [personajes, hechos, valores] = await Promise.all(Object.values(registros));
			registros = {personajes, hechos, valores};

			// Filtra los registros RCLV en status 'aprobado' y 'creado' (del usuario)
			entidades.forEach((entidad) => {
				let regsEnt = registros[entidad];
				let aprobados = regsEnt.filter((n) => n.status_registro.aprobado);
				let creados = regsEnt.filter((n) => n.status_registro.creado && n.creado_por_id == userID);
				regsEnt = [...creados, ...aprobados];
				regsEnt.sort((a, b) => (a.nombre < b.nombre ? -1 : a.nombre > b.nombre ? 1 : 0));
				registros[entidad] = regsEnt;
			});

			// Fin
			return registros;
		})();
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
				titulo: "Personaje histórico",
				nombre: "personaje_id",
				valores: registrosRCLV.personajes,
				mensajes: mensajes.personaje,
				link: "personajes",
				grupo: "RCLV",
			},
			{
				titulo: "Hecho histórico",
				nombre: "hecho_id",
				valores: registrosRCLV.hechos,
				mensajes: mensajes.hecho,
				link: "hechos",
				grupo: "RCLV",
			},
			{
				titulo: "Valor principal",
				nombre: "valor_id",
				valores: registrosRCLV.valores,
				mensajes: ["Poné el más representativo."],
				link: "valores",
				grupo: "RCLV",
			},
		];
	},
	entidadesProd: ["peliculas", "colecciones", "capitulos"],

	// RCLV
	camposRCLV: {
		personajes: [
			"nombre",
			"apodo",
			"dia_del_ano_id",
			"sexo_id",
			"epoca_id",
			"ano",
			"categoria_id",
			"rol_iglesia_id",
			"canon_id",
			"ap_mar_id",
		],
		hechos: ["nombre", "dia_del_ano_id", "ant", "jss", "cnt", "pst", "ano", "solo_cfc", "ama"],
		valores: ["nombre", "dia_del_ano_id"],
	},
	entidadesRCLV: ["personajes", "hechos", "valores"],
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
	epocasHechos: ["ant", "jss", "cnt", "pst"],

	// Links
	provsQueNoRespetanCopyright: [
		{nombre: "Gloria TV", url: "gloria.tv"},
		{nombre: "Cuevana", url: "cuevana"},
		{nombre: "Google Drive", url: "drive.google.com/"},
	],
	provsListaNegra: ["gloria.tv"],
	calidades: [360, 480, 720, 1080],

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
			{titulo: "Valor principal", nombre: "valor_id", relacInclude: "valor", tabla: "valores", rclv: true, productos: true},
			// Películas y Capítulos
			{titulo: "Duración", nombre: "duracion", angosto: true, input: true, peliculas: true, capitulos: true},
			// Colecciones
			{titulo: "Año de finalización", nombre: "ano_fin", angosto: true, input: true, colecciones: true},
		],
		rclvs: [
			// Todos
			{nombre: "nombre", titulo: "Nombre Formal", rclvs: true},
			{nombre: "dia_del_ano_id", titulo: "Día del Año", rclvs: true, relacInclude: "dia_del_ano", tabla: "dias_del_ano"},
			// Personajes y Hechos
			{nombre: "ano", titulo: "Año", personajes: true, hechos: true},
			// Personajes
			{nombre: "apodo", titulo: "Nombre Alternativo", personajes: true},
			{nombre: "sexo_id", titulo: "Sexo", personajes: true, relacInclude: "sexo", tabla: "sexos"},
			{nombre: "epoca_id", titulo: "Epoca", personajes: true, relacInclude: "epoca", tabla: "epocas"},
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
			{nombre: "ant", titulo: "Anterior a Jesús", hechos: true},
			{nombre: "jss", titulo: "Durante la vida de Jesús", hechos: true},
			{nombre: "cnt", titulo: "Durante la vida de los Apóstoles", hechos: true},
			{nombre: "pst", titulo: "Posterior a los Apóstoles", hechos: true},
			{nombre: "ama", titulo: "Es una aparición mariana", hechos: true},
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
	avatarLinksExternos: (nombre) => {
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
	selectVacio: "Necesitamos que elijas un valor",
	radioVacio: "Necesitamos que elijas alguna opción",
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
			: req.originalUrl.startsWith("/producto/edicion/") ||
			  req.originalUrl.startsWith("/links/abm/") ||
			  req.originalUrl.startsWith("/crud/")
			? {
					nombre: "fa-circle-info",
					link: "/producto/detalle/?entidad=" + req.query.entidad + "&id=" + req.query.id,
					titulo: "Ir al 'Detalle de Producto'",
					autofocus: true,
			  }
			: req.originalUrl.startsWith("/rclv/edicion/")
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
