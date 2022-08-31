"use strict";
// Definir variables
const BD_genericas = require("../2-BD/Genericas");

module.exports = {
	// Entorno Agregar Productos
	camposDD: () => {
		return [
			{
				titulo: "Título original",
				nombreDelCampo: "nombre_original",
				peliculas: true,
				colecciones: true,
				capitulos: true,
				antesDePais: true,
			},
			{
				titulo: "Título en castellano",
				nombreDelCampo: "nombre_castellano",
				peliculas: true,
				colecciones: true,
				capitulos: true,
				antesDePais: true,
			},
			{
				titulo: "Año de estreno",
				nombreDelCampo: "ano_estreno",
				numero: true,
				peliculas: true,
				colecciones: true,
				capitulos: true,
				antesDePais: true,
			},
			{
				titulo: "Año de finalización",
				nombreDelCampo: "ano_fin",
				numero: true,
				peliculas: false,
				colecciones: true,
				capitulos: false,
				antesDePais: true,
			},
			{
				titulo: "Duración (minutos)",
				nombreDelCampo: "duracion",
				numero: true,
				peliculas: true,
				colecciones: false,
				capitulos: true,
				antesDePais: true,
			},
			{
				nombreDelCampo: "paises_id",
				peliculas: true,
				colecciones: true,
				capitulos: true,
				omitirRutinaVista: true,
			},
			{
				nombreDelCampo: "idioma_original_id",
				peliculas: true,
				colecciones: true,
				capitulos: true,
				omitirRutinaVista: true,
			},
			{
				titulo: "Dirección",
				nombreDelCampo: "direccion",
				peliculas: true,
				colecciones: true,
				capitulos: true,
			},
			{
				titulo: "Guión",
				nombreDelCampo: "guion",
				peliculas: true,
				colecciones: true,
				capitulos: true,
			},
			{
				titulo: "Música",
				nombreDelCampo: "musica",
				peliculas: true,
				colecciones: true,
				capitulos: true,
			},
			{
				titulo: "Actuación",
				nombreDelCampo: "actuacion",
				peliculas: true,
				colecciones: true,
				capitulos: true,
			},
			{
				titulo: "Producción",
				nombreDelCampo: "produccion",
				peliculas: true,
				colecciones: true,
				capitulos: true,
			},
			{
				nombreDelCampo: "sinopsis",
				peliculas: true,
				colecciones: true,
				capitulos: true,
				omitirRutinaVista: true,
			},
			{
				nombreDelCampo: "avatar",
				peliculas: true,
				colecciones: true,
				capitulos: true,
				omitirRutinaVista: true,
			},
		];
	},
	camposDP: async (userID) => {
		// Variables
		let camposRCLV = ["personajes", "hechos", "valores"];
		let registrosRCLV = {};
		// Obtener los registros en status 'aprobado' y 'creado' (del usuario)
		if (userID)
			camposRCLV.forEach(async (campo) => {
				let aux = await BD_genericas.obtenerTodosConInclude(campo, "status_registro").then((n) =>
					n.filter(
						(n) =>
							n.status_registro.aprobado ||
							(n.status_registro.creado && n.creado_por_id == userID)
					)
				);
				if (!Array.isArray(aux)) console.log(131, campo, aux);
				aux.sort((a, b) => (a.nombre < b.nombre ? -1 : a.nombre > b.nombre ? 1 : 0));
				registrosRCLV[campo] = aux;
				if (!Array.isArray(aux)) console.log(134, campo, aux);
			});
		return [
			{
				titulo: "Existe una versión en castellano",
				nombreDelCampo: "en_castellano_id",
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
				nombreDelCampo: "en_color_id",
				valores: userID ? await BD_genericas.obtenerTodos("si_no_parcial", "id") : [],
				mensajePeli: ["SI - es a color.", "NO - es en blanco y negro."],
				mensajeColec: ["En caso de que algunos capítulos sean a color y otros no, elegí PARCIAL"],
				angosto: true,
			},
			{
				titulo: "Público sugerido",
				nombreDelCampo: "publico_sugerido_id",
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
				nombreDelCampo: "categoria_id",
				valores: userID ? await BD_genericas.obtenerTodos("categorias", "orden") : [],
				mensajes: [
					"CENTRADAS EN LA FE CATÓLICA - significa que el rol de la Fe Católica es protagónico.",
					"VALORES PRESENTES EN LA CULTURA - los buenos valores deben ser evidentes.",
					"Si la fe es cristiana pero no católica, se pone como Valores Presentes en la Cultura.",
				],
			},
			{
				titulo: "Sub-categoría",
				nombreDelCampo: "subcategoria_id",
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
				nombreDelCampo: "personaje_id",
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
				nombreDelCampo: "hecho_id",
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
				nombreDelCampo: "valor_id",
				valores: userID ? registrosRCLV.valores : [],
				mensajes: [
					"Podés ingresar un registro nuevo o modificar el actual, haciendo click en los íconos de al lado.",
					"Poné el más representativo.",
				],
				grupo: "RCLV",
			},
			{
				titulo: "Inspira fe y/o valores",
				nombreDelCampo: "fe_valores_id",
				valores: userID ? await BD_genericas.obtenerTodos("fe_valores", "orden") : [],
				mensajes: ["¿Considerás que deja una huella positiva en el corazón?"],
				angosto: true,
				grupo: "calificala",
			},
			{
				titulo: "Entretiene",
				nombreDelCampo: "entretiene_id",
				valores: userID ? await BD_genericas.obtenerTodos("entretiene", "orden") : [],
				mensajes: ["¿Se disfruta el rato viéndola?"],
				angosto: true,
				grupo: "calificala",
			},
			{
				titulo: "Calidad sonora y visual",
				nombreDelCampo: "calidad_tecnica_id",
				valores: userID ? await BD_genericas.obtenerTodos("calidad_tecnica", "orden") : [],
				mensajes: ["Tené en cuenta la calidad del audio y de la imagen"],
				angosto: true,
				grupo: "calificala",
			},
		];
	},

	// Entorno RCLV
	camposRCLV: () => {
		return {
			personajes: [
				"nombre",
				"dia_del_ano_id",
				"ano",
				"categoria_id",
				"subcategoria_id",
				"ap_mar_id",
				"proceso_id",
				"rol_iglesia_id",
			],
			hechos: ["nombre", "dia_del_ano_id", "ano", "solo_cfc", "jss", "cnt", "exclusivo", "ap_mar"],
			valores: ["nombre", "dia_del_ano_id"],
		};
	},

	// Entorno RUD - Links
	provsQueNoRespetanCopyright: () => {
		return [
			{nombre: "Gloria TV", url: "gloria.tv"},
			{nombre: "Cuevana", url: "cuevana"},
		];
	},
	provsListaNegra: () => {
		return ["youporn", "pornhub"];
	},

	// Entorno Revisiones
	camposRevisarProd: () => {
		return [
			{titulo: "Avatar", nombreDelCampo: "avatar"},
			{titulo: "Avatar (archivo)", nombreDelCampo: "avatar_archivo"},
			{titulo: "Título original", nombreDelCampo: "nombre_original", input: true},
			{titulo: "Título en castellano", nombreDelCampo: "nombre_castellano", input: true},
			{titulo: "Año de estreno", nombreDelCampo: "ano_estreno", angosto: true, input: true},
			{titulo: "Año de finalización", nombreDelCampo: "ano_fin", angosto: true, input: true},
			{titulo: "Duración", nombreDelCampo: "duracion", angosto: true, input: true},
			{titulo: "País/es", nombreDelCampo: "paises_id"},
			{
				titulo: "Idioma Original",
				nombreDelCampo: "idioma_original_id",
				relac_include: "idioma_original.nombre",
				campo_include: "nombre",
			},
			{titulo: "Dirección", nombreDelCampo: "direccion", input: true},
			{titulo: "Guión", nombreDelCampo: "guion", input: true},
			{titulo: "Música", nombreDelCampo: "musica", input: true},
			{titulo: "Actuación", nombreDelCampo: "actuacion", input: true},
			{titulo: "Producción", nombreDelCampo: "produccion", input: true},
			{titulo: "Sinopsis", nombreDelCampo: "sinopsis", input: true},
			{
				titulo: "Versión en castellano",
				nombreDelCampo: "en_castellano_id",
				relac_include: "en_castellano",
				campo_include: "productos",
			},
			{
				titulo: "Es a Color",
				nombreDelCampo: "en_color_id",
				relac_include: "en_color",
				campo_include: "productos",
			},
			{
				titulo: "Categoría",
				nombreDelCampo: "categoria_id",
				relac_include: "categoria",
				campo_include: "nombre",
			},
			{
				titulo: "Sub-categoría",
				nombreDelCampo: "subcategoria_id",
				relac_include: "subcategoria",
				campo_include: "nombre",
			},
			{
				titulo: "Público sugerido",
				nombreDelCampo: "publico_sugerido_id",
				relac_include: "publico_sugerido",
				campo_include: "nombre",
			},
			{
				titulo: "Personaje histórico",
				nombreDelCampo: "personaje_id",
				relac_include: "personaje",
				campo_include: "nombre",
				rclv: true,
				input: true,
			},
			{
				titulo: "Hecho histórico",
				nombreDelCampo: "hecho_id",
				relac_include: "hecho",
				campo_include: "nombre",
				rclv: true,
				input: true,
			},
			{
				titulo: "Valor principal",
				nombreDelCampo: "valor_id",
				relac_include: "valor",
				campo_include: "nombre",
				rclv: true,
				input: true,
			},
		];
	},
	camposRevisarLinks: () => {
		return [
			{nombreDelCampo: "calidad"},
			{nombreDelCampo: "castellano"},
			{nombreDelCampo: "gratuito"},
			{nombreDelCampo: "tipo_id"},
			{nombreDelCampo: "completo"},
			{nombreDelCampo: "parte"},
		];
	},

	// Entorno Mostrar Productos
	menuOpciones: () => {
		return [
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
		];
	},
	subMenuOpciones: () => {
		return [
			{nombre: "Por mejor calificación", url: "calificacion"},
			{nombre: "Por año de estreno más reciente", url: "estreno"},
			{nombre: "Por incorporación más reciente", url: "incorporacion"},
			{nombre: "Por orden de visita más reciente", url: "visita"},
		];
	},

	// Vistas
	vistaInicio: () => {
		return {nombre: "fa-house", link: "/", titulo: "Ir a 'Inicio'"};
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
						"&origen=tablero",
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
	vistaTablero: () => {
		return {
			nombre: "fa-spell-check",
			link: "/revision/tablero-de-control",
			titulo: "Ir al 'Tablero de Control' de Revisiones",
		};
	},
	vistaEntendido: (url) => {
		return {nombre: "fa-thumbs-up", link: url ? url : "/", titulo: "Entendido"};
	},
};
