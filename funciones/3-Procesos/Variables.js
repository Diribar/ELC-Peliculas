"use strict";
// Definir variables
const BD_genericas = require("../2-BD/Genericas");

module.exports = {
	opcionesInicio: [
		{
			href: "/consultas/listado/sugeridas",
			src: "/imagenes/8-Inicio/Recomendame.jpg",
			p: "Quiero que me recomienden una película o colección",
		},
		{
			href: "/consultas/listado/incorporacion",
			src: "/imagenes/8-Inicio/Filtro.jpg",
			p: "Quiero elegir una película o colección, con filtros personalizados",
		},
		{
			href: "/consultas/cfc",
			src: "/imagenes/8-Inicio/Cruz.jpg",
			p: "Un paseo por nuestras peliculas Centradas en la Fe Católica (CFC)",
		},
		{
			href: "/consultas/vpc",
			src: "/imagenes/8-Inicio/Valores.jpg",
			p: "Un paseo por nuestras peliculas que sin ser CFC, tienen Valores Presentes en nuestra Cultura (VPC)",
		},
	],

	// Entorno Consulta de Productos
	menuOpciones: [
		{
			nombre: "Todas las Películas",
			url: "listado",
			titulo: "Listado",
			vista: "CN1-Listado",
			comentario: "Todas las películas de nuestra Base de Datos",
		},
		{
			nombre: "Un paseo por CFC",
			url: "cfc",
			titulo: "CFC",
			vista: "CN2-CFC",
			comentario: "Películas Centradas en la Fe Católica (CFC)",
		},
		{
			nombre: "Un paseo por VPC",
			url: "vpc",
			titulo: "VPC",
			vista: "CN3-VPC",
			comentario: "Películas con Valores Presentes en nuestra Cultura (VPC)",
		},
	],
	menuSubOpcionesListado: [
		{nombre: "Sugeridas para el momento del año", url: "sugeridas"},
		{nombre: "Por mejor calificación", url: "calificacion"},
		{nombre: "Por año de estreno más reciente", url: "estreno"},
		{nombre: "Por incorporación más reciente", url: "incorporacion"},
	],

	// Entorno Agregar Productos
	camposDD: [
		{
			titulo: "Título original",
			nombre: "nombre_original",
			peliculas: true,
			colecciones: true,
			capitulos: true,
			antesDePais: true,
		},
		{
			titulo: "Título en castellano",
			nombre: "nombre_castellano",
			peliculas: true,
			colecciones: true,
			capitulos: true,
			antesDePais: true,
		},
		{
			titulo: "Año de estreno",
			nombre: "ano_estreno",
			numero: true,
			peliculas: true,
			colecciones: true,
			capitulos: true,
			antesDePais: true,
		},
		{
			titulo: "Año de finalización",
			nombre: "ano_fin",
			numero: true,
			peliculas: false,
			colecciones: true,
			capitulos: false,
			antesDePais: true,
		},
		{
			titulo: "Duración (minutos)",
			nombre: "duracion",
			numero: true,
			peliculas: true,
			colecciones: false,
			capitulos: true,
			antesDePais: true,
		},
		{
			nombre: "paises_id",
			peliculas: true,
			colecciones: true,
			capitulos: true,
			omitirRutinaVista: true,
		},
		{
			nombre: "idioma_original_id",
			peliculas: true,
			colecciones: true,
			capitulos: true,
			omitirRutinaVista: true,
		},
		{
			titulo: "Dirección",
			nombre: "direccion",
			peliculas: true,
			colecciones: true,
			capitulos: true,
		},
		{
			titulo: "Guión",
			nombre: "guion",
			peliculas: true,
			colecciones: true,
			capitulos: true,
		},
		{
			titulo: "Música",
			nombre: "musica",
			peliculas: true,
			colecciones: true,
			capitulos: true,
		},
		{
			titulo: "Actuación",
			nombre: "actuacion",
			peliculas: true,
			colecciones: true,
			capitulos: true,
		},
		{
			titulo: "Producción",
			nombre: "produccion",
			peliculas: true,
			colecciones: true,
			capitulos: true,
		},
		{
			nombre: "sinopsis",
			peliculas: true,
			colecciones: true,
			capitulos: true,
			omitirRutinaVista: true,
		},
		{
			nombre: "avatar",
			peliculas: true,
			colecciones: true,
			capitulos: true,
			omitirRutinaVista: true,
		},
		// {
		// 	nombre: "avatar_url",
		// 	peliculas: true,
		// 	colecciones: true,
		// 	capitulos: true,
		// 	omitirRutinaVista: true,
		// },
	],
	camposDP: async (userID) => {
		// Funcion
		let funcionRegistrosRCLV = async (userID) => {
			// Obtiene los registros RCLV en status 'aprobado' y 'creado' (del usuario)
			// Variables
			let entidadesRCLV = ["personajes", "hechos", "valores"];
			let registrosRCLV = {};
			// Rutina por entidadRCLV
			await entidadesRCLV.forEach(async (entidadRCLV) => {
				let aprobados = await BD_genericas.obtieneTodosConInclude(
					entidadRCLV,
					"status_registro"
				).then((n) => n.filter((n) => n.status_registro.aprobado));
				let creados = await BD_genericas.obtieneTodosConInclude(entidadRCLV, "status_registro").then(
					(n) => n.filter((n) => n.status_registro.creado && n.creado_por_id == userID)
				);
				let registros = [...creados, ...aprobados];
				registros.sort((a, b) => (a.nombre < b.nombre ? -1 : a.nombre > b.nombre ? 1 : 0));
				registrosRCLV[entidadRCLV] = registros;
			});
			// Fin
			return registrosRCLV;
		};
		// Variables
		const registrosRCLV = await funcionRegistrosRCLV(userID);
		return [
			{
				titulo: "Existe una versión en castellano",
				nombre: "en_castellano_id",
				valores: userID ? await BD_genericas.obtieneTodos("si_no_parcial", "id") : [],
				mensajePeli: [
					"SI - cuando es el idioma de toda la película, o está subtitulada.",
					"PARCIAL - cuando lo anterior se cumple parcialmente.",
					"NO - cuando no se cumple lo anterior.",
					"Si la película está subtitulada, se especificará luego en el link.",
				],
				mensajeColec: [
					"SI - cuando es el idioma de todos los capítulos, o están subtitulados.",
					"PARCIAL - cuando lo anterior se cumple parcialmente.",
					"NO - cuando no se cumple lo anterior.",
					"Cuando un capítulo está subtitulado, se especifica en el link.",
				],
				angosto: true,
			},
			{
				titulo: "Es a Color",
				nombre: "en_color_id",
				valores: userID ? await BD_genericas.obtieneTodos("si_no_parcial", "id") : [],
				mensajePeli: ["SI - es a color.", "NO - es en blanco y negro."],
				mensajeColec: ["En caso de que algunos capítulos sean a color y otros no, elegí PARCIAL"],
				angosto: true,
			},
			{
				titulo: "Público sugerido",
				nombre: "publico_sugerido_id",
				valores: userID ? await BD_genericas.obtieneTodos("publicos_sugeridos", "orden") : [],
				mensajes: [
					"Mayores solamente: violencia o sensualidad, que pueden dañar la sensibilidad de un menor de hasta 12-14 años.",
					"Mayores apto familia: no se cumple lo anterior, pero es de poco interés para un menor de hasta 12-14 años.",
					"Familia: ideal para compartir en familia y que todos la disfruten.",
					"Menores apto familia: apuntado a un público infantil, pero también la puede disfrutar un adulto.",
					"Menores solamente: apuntado a un público solamente infantil.",
				],
			},
			{
				titulo: "Categoría",
				nombre: "categoria_id",
				valores: userID ? await BD_genericas.obtieneTodos("categorias", "orden") : [],
				mensajes: [
					"Centradas en la Fe Católica: significa que el rol de la Fe Católica es protagónico.",
					"Valores Presentes en la Cultura: los buenos valores deben ser evidentes.",
					"Si la fe es cristiana pero no católica, se pone como Valores Presentes en la Cultura.",
				],
			},
			{
				titulo: "Sub-categoría",
				nombre: "subcategoria_id",
				valores: userID ? await BD_genericas.obtieneTodos("subcategorias", "orden") : [],
				mensajes: [
					{texto: "Te pedimos que la elijas por la primera coincidencia que encuentres", categ: ""},
					{texto: "Hagiografía - el protagonista debe ser un santo o beato", categ: "CFC"},
					{
						texto: "Historias de la Iglesia - cuando no se cumple ninguno de los anteriores",
						categ: "CFC",
					},
				],
			},
			{
				titulo: "Personaje histórico",
				nombre: "personaje_id",
				valores: userID ? registrosRCLV.personajes : [],
				mensajes: [
					"Podés ingresar un registro nuevo o modificar el actual (salvo excepciones), haciendo click en los íconos de al lado.",
					"Si son varias las personas, podés poner la más representativa, o un nombre que las englobe a todas.",
				],
				link: "personajes",
				grupo: "RCLV",
			},
			{
				titulo: "Hecho histórico",
				nombre: "hecho_id",
				valores: userID ? registrosRCLV.hechos : [],
				mensajes: [
					"Podés ingresar un registro nuevo o modificar el actual, haciendo click en los íconos de al lado.",
					"Si son varios los hechos, podés poner el más representativo, o uno genérico que los englobe a todos.",
				],
				link: "hechos",
				grupo: "RCLV",
			},
			{
				titulo: "Valor principal",
				nombre: "valor_id",
				valores: userID ? registrosRCLV.valores : [],
				mensajes: [
					"Podés ingresar un registro nuevo o modificar el actual, haciendo click en los íconos de al lado.",
					"Poné el más representativo.",
				],
				grupo: "RCLV",
			},
			{
				titulo: "Inspira fe y/o valores",
				nombre: "fe_valores_id",
				valores: userID ? await BD_genericas.obtieneTodos("fe_valores", "orden") : [],
				mensajes: ["¿Considerás que deja una huella positiva en el corazón?"],
				angosto: true,
				grupo: "calificala",
			},
			{
				titulo: "Entretiene",
				nombre: "entretiene_id",
				valores: userID ? await BD_genericas.obtieneTodos("entretiene", "orden") : [],
				mensajes: ["¿Se disfruta el rato viéndola?"],
				angosto: true,
				grupo: "calificala",
			},
			{
				titulo: "Calidad sonora y visual",
				nombre: "calidad_tecnica_id",
				valores: userID ? await BD_genericas.obtieneTodos("calidad_tecnica", "orden") : [],
				mensajes: ["Tené en cuenta la calidad del audio y de la imagen"],
				angosto: true,
				grupo: "calificala",
			},
		];
	},

	// Entorno RCLV
	camposRCLV: {
		personajes: [
			"nombre",
			"apodo",
			"dia_del_ano_id",
			"ano",
			"categoria_id",
			"subcategoria_id",
			"ap_mar_id",
			"proceso_id",
			"rol_iglesia_id",
		],
		hechos: ["nombre", "dia_del_ano_id", "ano", "hasta", "solo_cfc", "jss", "cnt", "exclusivo", "ap_mar"],
		valores: ["nombre", "dia_del_ano_id"],
	},

	// Entorno RUD - Links
	provsQueNoRespetanCopyright: [
		{nombre: "Gloria TV", url: "gloria.tv"},
		{nombre: "Cuevana", url: "cuevana"},
		{nombre: "Google Drive", url: "drive.google.com/"},
	],
	provsListaNegra: ["youporn", "pornhub"],

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
			{
				titulo: "Idioma Original",
				nombre: "idioma_original_id",
				relac_include: "idioma_original",
				campo_include: "nombre",
			},
			{titulo: "Dirección", nombre: "direccion", input: true},
			{titulo: "Guión", nombre: "guion", input: true},
			{titulo: "Música", nombre: "musica", input: true},
			{titulo: "Actuación", nombre: "actuacion", input: true},
			{titulo: "Producción", nombre: "produccion", input: true},
			{titulo: "Sinopsis", nombre: "sinopsis", input: true},
			{
				titulo: "Versión en castellano",
				nombre: "en_castellano_id",
				relac_include: "en_castellano",
				campo_include: "productos",
			},
			{
				titulo: "Es a Color",
				nombre: "en_color_id",
				relac_include: "en_color",
				campo_include: "productos",
			},
			{
				titulo: "Categoría",
				nombre: "categoria_id",
				relac_include: "categoria",
				campo_include: "nombre",
			},
			{
				titulo: "Sub-categoría",
				nombre: "subcategoria_id",
				relac_include: "subcategoria",
				campo_include: "nombre",
			},
			{
				titulo: "Público sugerido",
				nombre: "publico_sugerido_id",
				relac_include: "publico_sugerido",
				campo_include: "nombre",
			},
			{
				titulo: "Personaje histórico",
				nombre: "personaje_id",
				relac_include: "personaje",
				campo_include: "nombre",
				rclv: true,
				input: true,
			},
			{
				titulo: "Hecho histórico",
				nombre: "hecho_id",
				relac_include: "hecho",
				campo_include: "nombre",
				rclv: true,
				input: true,
			},
			{
				titulo: "Valor principal",
				nombre: "valor_id",
				relac_include: "valor",
				campo_include: "nombre",
				rclv: true,
				input: true,
			},
		],
		RCLVs: [
			// Personajes
			{nombre: "nombre", titulo: "Nombre Más Conocido", personajes: true, hechos: true, valores: true},
			{nombre: "apodo", titulo: "Nombre Alternativo", personajes: true},
			{
				nombre: "sexo_id",
				titulo: "Sexo",
				personajes: true,
				relac_include: "sexo",
				campo_include: "nombre",
			},
			{nombre: "dia_del_ano_id", titulo: "Día del Año", personajes: true, hechos: true, valores: true},
			{nombre: "ano", titulo: "Año Desde", personajes: true, hechos: true},
			{nombre: "hasta", titulo: "Año Hasta", personajes: true, hechos: true},
			{
				nombre: "categoria_id",
				titulo: "Categoría",
				personajes: true,
				relac_include: "categoria",
				campo_include: "nombre",
			},
			{
				nombre: "subcategoria_id",
				titulo: "",
				personajes: true,
				relac_include: "subcategoria",
				campo_include: "nombre",
			},
			{
				nombre: "ap_mar_id",
				titulo: "Aparición Mariana",
				personajes: true,
				relac_include: "ap_mar",
				campo_include: "nombre",
			},
			{
				nombre: "proceso_id",
				titulo: "Proceso de Canonizac.",
				personajes: true,
				relac_include: "proc_canoniz",
				campo_include: "nombre",
			},
			{
				nombre: "rol_iglesia_id",
				titulo: "Rol en la Iglesia",
				personajes: true,
				relac_include: "rol_iglesia",
				campo_include: "nombre",
			},
			// Hechos
			{nombre: "solo_cfc", titulo: "Hecho de la Iglesia", hechos: true},
			{nombre: "jss", titulo: "", hechos: true},
			{nombre: "cnt", titulo: "", hechos: true},
			{nombre: "exclusivo", titulo: "", hechos: true},
			{nombre: "ap_mar", titulo: "", hechos: true},
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
				src: "/imagenes/0-Logos/BD-TMDB.jpg",
				alt: "TMDB",
			},
			{
				href: "//filmaffinity.com/es/search.php?stext=" + nombre,
				src: "/imagenes/0-Logos/BD-FA.jpg",
				alt: "FA",
			},
			{
				href: "//imdb.com/find?q=" + nombre,
				src: "/imagenes/0-Logos/BD-IMDB.jpg",
				alt: "IMDB",
			},
			{
				href: "//google.com/search?q=" + nombre + "&tbm=isch&tbs=isz:l&hl=es-419",
				src: "/imagenes/0-Logos/BD-Google.jpg",
				alt: "Google",
			},
		];
	},

	// Vistas
	vistaInicio: {nombre: "fa-house", link: "/", titulo: "Ir a 'Inicio'"},
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
