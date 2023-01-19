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
	// Uso general
	global_BD: async function () {
		// Funciones
		let FN_awaits = async () => {
			// Espera a  que todas se procesen y consolida la info
			let valores = Object.values(campos);
			valores = await Promise.all(valores);

			// Construye el objeto con el 'nombre' y 'valor' de cada 'método'
			Object.keys(campos).forEach((campo, i) => (resultado[campo] = valores[i]));
		};
		let FN_RCLVs = () => {
			let statusAprob_id = resultado.status_registro.find((n) => n.aprobado).id;
			for (let entidadRCLV of entidadesRCLV) {
				resultado[entidadRCLV] = resultado[entidadRCLV].filter(
					(n) => n.status_registro_id == statusAprob_id && n.prods_aprob
				);
			}
		};

		// Variables
		let resultado = {};
		let entidadesRCLV = this.entidadesRCLV;
		let campos = {
			// Variable de entidades
			status_registro: BD_genericas.obtieneTodos("status_registro", "orden"),
			// Variables de usuario
			roles_us: BD_genericas.obtieneTodos("roles_usuarios", "orden"),
			status_registro_us: BD_genericas.obtieneTodos("status_registro_us", "orden"),
			// Consultas - Filtro Personalizado
			filtroEstandar: BD_genericas.obtienePorId("filtros_cabecera", 1),
			// Consultas - RCLV
			personajes: BD_genericas.obtieneTodos("personajes", "nombre"),
			hechos: BD_genericas.obtieneTodos("hechos", "nombre"),
			valores: BD_genericas.obtieneTodos("valores", "nombre"),
			// Consultas - Complementos de RCLV
			epoca: BD_genericas.obtieneTodos("epoca", "orden"),
			procs_canon: BD_genericas.obtieneTodos("procs_canon", "orden"),
			roles_iglesia: BD_genericas.obtieneTodos("roles_iglesia", "orden"),
			// Consultas - Otros
			publicos: BD_genericas.obtieneTodos("publicos", "orden"),
			interes_opciones: BD_genericas.obtieneTodos("interes_opciones", "orden"),
			tipos_actuacion: BD_genericas.obtieneTodos("tipos_actuacion", "orden"),
		};
		// Procesa los 'awaits'
		await FN_awaits();

		// Conserva solamente los RCLVs aprobados y con producto
		FN_RCLVs();

		// Resultado
		global = {...global, ...resultado};

		// Fin
		return;
	},
	grupos: {
		personajes: function (datos) {
			// Época de nacimiento
			let epoca = datos.epoca.filter((n) => n.nombre_pers);
			epoca = epoca.map((n) => {
				return {id: n.id, nombre: n.nombre_pers, clase: "CFC VPC epoca"};
			});
			// Proceso de canonización
			let procs_canon = datos.procs_canon.filter((n) => n.id.length == 2);
			procs_canon = puleCampos(procs_canon, "CFC procs_canon");
			// Roles Iglesia
			let roles_iglesia = datos.roles_iglesia.filter((n) => n.personaje && n.id.length == 2);
			roles_iglesia = puleCampos(roles_iglesia, "CFC roles_iglesia");
			// Consolidación
			let grupoPersonajes = [
				{nombre: "Época de vida", clase: "CFC VPC"},
				{id: "JSS", nombre: "Jesús"},
				...epoca,
				{nombre: "Proceso de Canonización", clase: "CFC"},
				...procs_canon,
				{nombre: "Rol en la Iglesia", clase: "CFC"},
				...roles_iglesia,
				{nombre: "Listado de Personajes", clase: "CFC VPC"},
			];
			// Fin
			return grupoPersonajes;
		},
	},

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
		categoria: {
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
		epoca: {
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
				{id: "VPC", nombre: "Con links 'pay per view'"},
				{id: "VPC", nombre: "Con links gratuitos y ppv"},
				{id: "VPC", nombre: "Con links de abono"},
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
		{
			titulo: "Título original",
			nombre: "nombre_original",
			peliculas: true,
			colecciones: true,
			capitulos: true,
			antesDePais: true,
			campoInput: true,
		},
		{
			titulo: "Título en castellano",
			nombre: "nombre_castellano",
			peliculas: true,
			colecciones: true,
			capitulos: true,
			antesDePais: true,
			campoInput: true,
		},
		{
			titulo: "Año de estreno",
			nombre: "ano_estreno",
			numero: true,
			peliculas: true,
			colecciones: true,
			capitulos: true,
			antesDePais: true,
			campoInput: true,
		},
		{
			titulo: "Año de finalización",
			nombre: "ano_fin",
			numero: true,
			peliculas: false,
			colecciones: true,
			capitulos: false,
			antesDePais: true,
			campoInput: true,
		},
		{
			titulo: "Duración (minutos)",
			nombre: "duracion",
			numero: true,
			peliculas: true,
			colecciones: false,
			capitulos: true,
			antesDePais: true,
			campoInput: true,
		},
		{
			nombre: "paises_id",
			peliculas: true,
			colecciones: true,
			capitulos: true,
		},
		{
			nombre: "idioma_original_id",
			peliculas: true,
			colecciones: true,
			capitulos: true,
		},
		{
			titulo: "Dirección",
			nombre: "direccion",
			peliculas: true,
			colecciones: true,
			capitulos: true,
			campoInput: true,
		},
		{
			titulo: "Guión",
			nombre: "guion",
			peliculas: true,
			colecciones: true,
			capitulos: true,
			campoInput: true,
		},
		{
			titulo: "Música",
			nombre: "musica",
			peliculas: true,
			colecciones: true,
			capitulos: true,
			campoInput: true,
		},
		{
			titulo: "Actores",
			nombre: "actores",
			peliculas: true,
			colecciones: true,
			capitulos: true,
			campoInput: true,
		},
		{
			titulo: "Producción",
			nombre: "produccion",
			peliculas: true,
			colecciones: true,
			capitulos: true,
			campoInput: true,
		},
		{
			nombre: "sinopsis",
			peliculas: true,
			colecciones: true,
			capitulos: true,
		},
		{
			nombre: "avatar",
			peliculas: true,
			colecciones: true,
			capitulos: true,
		},
	],
	camposDP: [
		{nombre: "cfc"},
		{nombre: "ocurrio"},
		{nombre: "musical"},
		{nombre: "tipo_actuacion_id"},
		{nombre: "publico_id"},
		{nombre: "personaje_id", grupo: "RCLV"},
		{nombre: "hecho_id", grupo: "RCLV"},
		{nombre: "valor_id", grupo: "RCLV"},
	],
	camposDP_conValores: async function (userID) {
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
		return [
			{titulo: "Centrada en la Fe Católica", nombre: "cfc", siNo: true},
			{titulo: "Basada en Hechos Reales", nombre: "ocurrio", siNo: true},
			{titulo: "Es un musical", nombre: "musical", siNo: true},
			{
				titulo: "Tipo de Actuación",
				nombre: "tipo_actuacion_id",
				valores: await BD_genericas.obtieneTodos("tipos_actuacion", "orden"),
			},
			{
				titulo: "Público sugerido",
				nombre: "publico_id",
				valores: await BD_genericas.obtieneTodos("publicos", "orden"),
				mensajes: [
					"Mayores solamente: violencia o sensualidad, que pueden dañar la sensibilidad de un menor de hasta 12-14 años.",
					"Mayores apto familia: no se cumple lo anterior, pero es de poco interés para un menor de hasta 12-14 años.",
					"Familia: ideal para compartir en familia y que todos la disfruten.",
					"Menores apto familia: apuntado a un público infantil, pero también la puede disfrutar un adulto.",
					"Menores solamente: apuntado a un público solamente infantil.",
				],
			},
			{
				titulo: "Personaje histórico",
				nombre: "personaje_id",
				valores: registrosRCLV.personajes,
				mensajes: [
					"Si son varias las personas, podés poner la más representativa, o un nombre que las englobe a todas.",
				],
				link: "personajes",
				grupo: "RCLV",
			},
			{
				titulo: "Hecho histórico",
				nombre: "hecho_id",
				valores: registrosRCLV.hechos,
				mensajes: [
					"Si son varios los hechos, podés poner el más representativo, o uno genérico que los englobe a todos.",
				],
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
			"sexo_id",
			"dia_del_ano_id",
			"ano",
			"categoria_id",
			"ap_mar_id",
			"proceso_id",
			"rol_iglesia_id",
		],
		hechos: ["nombre", "dia_del_ano_id", "ano", "solo_cfc", "jss", "cnt", "ncn", "ama"],
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
		productos: [
			{titulo: "Avatar", nombre: "avatar"},
			// {titulo: "Avatar_url", nombre: "avatar_url"}, // es necesario para 'agregar-prod/RCLV'
			{titulo: "Título original", nombre: "nombre_original", input: true},
			{titulo: "Título en castellano", nombre: "nombre_castellano", input: true},
			{titulo: "Año de estreno", nombre: "ano_estreno", angosto: true, input: true},
			{titulo: "Año de finalización", nombre: "ano_fin", angosto: true, input: true},
			{titulo: "Duración", nombre: "duracion", angosto: true, input: true},
			{titulo: "País/es", nombre: "paises_id"},
			{titulo: "Idioma Original", nombre: "idioma_original_id", relac_include: "idioma_original"},
			{titulo: "Dirección", nombre: "direccion", input: true},
			{titulo: "Guión", nombre: "guion", input: true},
			{titulo: "Música", nombre: "musica", input: true},
			{titulo: "Actores", nombre: "actores", input: true},
			{titulo: "Producción", nombre: "produccion", input: true},
			{titulo: "Sinopsis", nombre: "sinopsis", input: true},

			{titulo: "Centrada en la Fe Católica", nombre: "cfc", input: true},
			{titulo: "Basada en Hechos Reales", nombre: "ocurrio", input: true},
			{titulo: "Es un musical", nombre: "musical", input: true},
			{titulo: "Tipo de Actuación", nombre: "tipo_actuacion_id", relac_include: "tipo_actuacion"},

			{titulo: "Público sugerido", nombre: "publico_id", relac_include: "publico"},
			{
				titulo: "Personaje histórico",
				nombre: "personaje_id",
				relac_include: "personaje",
				rclv: true,
				input: true,
			},
			{
				titulo: "Hecho histórico",
				nombre: "hecho_id",
				relac_include: "hecho",
				rclv: true,
				input: true,
			},
			{
				titulo: "Valor principal",
				nombre: "valor_id",
				relac_include: "valor",
				rclv: true,
				input: true,
			},
		],
		rclvs: [
			// Personajes
			{nombre: "nombre", titulo: "Nombre Formal", personajes: true, hechos: true, valores: true},
			{nombre: "apodo", titulo: "Nombre Alternativo", personajes: true},
			{nombre: "sexo_id", titulo: "Sexo", personajes: true, relac_include: "sexo"},
			{nombre: "dia_del_ano_id", titulo: "Día del Año", personajes: true, hechos: true, valores: true},
			{nombre: "ano", titulo: "Año", personajes: true, hechos: true},
			{nombre: "categoria_id", titulo: "Categoría", personajes: true, relac_include: "categoria"},
			{nombre: "ap_mar_id", titulo: "Aparición Mariana", personajes: true, relac_include: "ap_mar"},
			{
				nombre: "proceso_id",
				titulo: "Proceso de Canonizac.",
				personajes: true,
				relac_include: "proc_canon",
			},
			{
				nombre: "rol_iglesia_id",
				titulo: "Rol en la Iglesia",
				personajes: true,
				relac_include: "rol_iglesia",
			},
			// Hechos
			{nombre: "solo_cfc", titulo: "Hecho de la Iglesia", hechos: true},
			{nombre: "jss", titulo: "Durante la vida de Jesús", hechos: true},
			{nombre: "cnt", titulo: "Durante la vida de los Apóstoles", hechos: true},
			{nombre: "ncn", titulo: "Fuera de la vida de los Apóstoles", hechos: true},
			{nombre: "ama", titulo: "Es una aparición mariana", hechos: true},
		],
		links: [
			{nombre: "calidad", titulo: "Calidad"},
			{nombre: "castellano", titulo: "En castellano"},
			{nombre: "subtit_castellano", titulo: "Subtítulos"},
			{nombre: "gratuito", titulo: "Gratuito"},
			{nombre: "tipo_id", titulo: "Tipo"},
			{nombre: "completo", titulo: "Completo"},
			{nombre: "parte", titulo: "Parte"},
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

	// Links a vistas
	vistaInicio: {nombre: "fa-house", link: "/", titulo: "Ir a 'Inicio'"},
	vistaActual: (req) => {
		return {nombre: "fa-rotate-right", link: req.originalUrl, titulo: "Volver a intentarlo"};
	},
	vistaAnterior: (urlAnterior) => {
		return {
			nombre: "fa-circle-left",
			link: urlAnterior ? urlAnterior : "/",
			titulo: "Ir a la vista anterior",
		};
	},
	vistaInactivar: (req) => {
		return req.originalUrl.startsWith("/revision/")
			? {
					nombre: "fa-spell-check",
					link:
						"/inactivar-captura/?entidad=" +
						req.query.entidad +
						"&id=" +
						req.query.id +
						"&origen=tableroEnts",
					titulo: "Ir al 'Tablero de Control' de Revisiones",
			  }
			: req.originalUrl.startsWith("/producto/edicion/") || req.originalUrl.startsWith("/links/abm/")
			? {
					nombre: "fa-circle-info",
					link: "/producto/detalle/?entidad=" + req.query.entidad + "&id=" + req.query.id,
					titulo: "Ir al 'Detalle de Producto'",
			  }
			: req.originalUrl.startsWith("/rclv/edicion/")
			? {
					nombre: "fa-circle-info",
					link: "/rclv/detalle/?entidad=" + req.query.entidad + "&id=" + req.query.id,
					titulo: "Ir al 'Detalle de RCLV'",
			  }
			: {};
	},
	vistaTablero: {
		nombre: "fa-spell-check",
		link: "/revision/tablero-de-control",
		titulo: "Ir al 'Tablero de Control' de Revisiones",
	},
	vistaEntendido: (url) => {
		return {nombre: "fa-thumbs-up", link: url ? url : "/", titulo: "Entendido"};
	},
};

let puleCampos = (campo, clase) => {
	// Obtiene los campos necesarios
	campo = campo.map((n) => {
		return {id: n.id, nombre: n.nombre, clase};
	});
	// Fin
	return campo;
};
