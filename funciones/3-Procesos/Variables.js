"use strict";
// Definir variables
const BD_genericas = require("../2-BD/Genericas");

module.exports = {
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
	],
	camposDP: async (userID) => {
		// Funcion
		let funcionRegistrosRCLV = (userID) => {
			// Obtiene los registros RCLV en status 'aprobado' y 'creado' (del usuario)
			// Variables
			let entidadRCLV = ["personajes", "hechos", "valores"];
			let registrosRCLV = {};
			// Rutina por entidadRCLV
			entidadRCLV.forEach(async (campo) => {
				let aprobados = await BD_genericas.obtenerTodosConInclude(campo, "status_registro").then(
					(n) => n.filter((n) => n.status_registro.aprobado)
				);
				let creados = [];
				if (userID)
					creados = await BD_genericas.obtenerTodosConInclude(campo, "status_registro").then((n) =>
						n.filter((n) => n.status_registro.creado && n.creado_por_id == userID)
					);
				let registros = [...creados, ...aprobados];
				registros.sort((a, b) => (a.nombre < b.nombre ? -1 : a.nombre > b.nombre ? 1 : 0));
				registrosRCLV[campo] = registros;
			});
			// Fin
			return registrosRCLV
		};
		// Variables
		let registrosRCLV = funcionRegistrosRCLV(userID);
		return [
			{
				titulo: "Existe una versión en castellano",
				nombre: "en_castellano_id",
				valores: userID ? await BD_genericas.obtenerTodos("si_no_parcial", "id") : [],
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
				valores: userID ? await BD_genericas.obtenerTodos("si_no_parcial", "id") : [],
				mensajePeli: ["SI - es a color.", "NO - es en blanco y negro."],
				mensajeColec: ["En caso de que algunos capítulos sean a color y otros no, elegí PARCIAL"],
				angosto: true,
			},
			{
				titulo: "Público sugerido",
				nombre: "publico_sugerido_id",
				valores: userID ? await BD_genericas.obtenerTodos("publicos_sugeridos", "orden") : [],
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
				valores: userID ? await BD_genericas.obtenerTodos("categorias", "orden") : [],
				mensajes: [
					"CENTRADAS EN LA FE CATÓLICA - significa que el rol de la Fe Católica es protagónico.",
					"VALORES PRESENTES EN LA CULTURA - los buenos valores deben ser evidentes.",
					"Si la fe es cristiana pero no católica, se pone como Valores Presentes en la Cultura.",
				],
			},
			{
				titulo: "Sub-categoría",
				nombre: "subcategoria_id",
				valores: userID ? await BD_genericas.obtenerTodos("subcategorias", "orden") : [],
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
				valores: userID ? await BD_genericas.obtenerTodos("fe_valores", "orden") : [],
				mensajes: ["¿Considerás que deja una huella positiva en el corazón?"],
				angosto: true,
				grupo: "calificala",
			},
			{
				titulo: "Entretiene",
				nombre: "entretiene_id",
				valores: userID ? await BD_genericas.obtenerTodos("entretiene", "orden") : [],
				mensajes: ["¿Se disfruta el rato viéndola?"],
				angosto: true,
				grupo: "calificala",
			},
			{
				titulo: "Calidad sonora y visual",
				nombre: "calidad_tecnica_id",
				valores: userID ? await BD_genericas.obtenerTodos("calidad_tecnica", "orden") : [],
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
			{titulo: "Avatar (archivo)", nombre: "avatar_archivo"},
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
		links: [
			{nombre: "calidad"},
			{nombre: "castellano"},
			{nombre: "gratuito"},
			{nombre: "tipo_id"},
			{nombre: "completo"},
			{nombre: "parte"},
		],
	},

	// Entorno Mostrar Productos
	menuOpciones: [
		{
			nombre: "Sugeridas para el momento del año",
			url: "sugeridas",
			titulo: "Sugeridas",
			vista: "1-Listado",
			comentario: "Las películas más afines con la época del año",
		},
		{
			nombre: "Todas las Películas",
			url: "listado",
			titulo: "Listado",
			vista: "1-Listado",
			comentario: "Todas las películas de nuestra Base de Datos",
		},
		{
			nombre: "Un paseo por CFC",
			url: "cfc",
			titulo: "CFC",
			vista: "2-CFC",
			comentario: "Películas Centradas en la Fe Católica (CFC)",
		},
		{
			nombre: "Un paseo por VPC",
			url: "vpc",
			titulo: "VPC",
			vista: "3-VPC",
			comentario: "Películas con Valores Presentes en nuestra Cultura (VPC)",
		},
	],
	subMenuOpciones: [
		{nombre: "Por mejor calificación", url: "calificacion"},
		{nombre: "Por año de estreno más reciente", url: "estreno"},
		{nombre: "Por incorporación más reciente", url: "incorporacion"},
		{nombre: "Por orden de visita más reciente", url: "visita"},
	],

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
