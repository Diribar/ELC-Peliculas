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
	camposDP: async () => {
		return [
			{
				titulo: "Existe una versión en castellano",
				nombreDelCampo: "en_castellano_id",
				valores: await BD_genericas.obtenerTodos("si_no_parcial", "id"),
				mensajePeli: [
					"Para poner 'SI', escuchá la película entera y asegurate de que sea el idioma principal.",
					"Si la película es subtitulada en castellano, a los fines de preservar la sencillez, corresponde decir 'SI'. Luego en los links, se podrá especificar que es subtitulada.",
				],
				mensajeColec: [
					"Para poner 'SI', debe ser el idioma principal de los capítulos. En paso contrario elegí 'PARCIAL'",
					"Si los capítulos son subtitulados en castellano, a los fines de preservar la sencillez, corresponde decir 'SI'. Luego en los links, se podrá especificar que son subtitulados.",
					"En caso de que algunos capítulos estén en castellano y otros no, elegí 'PARCIAL'",
				],
				angosto: true,
			},
			{
				titulo: "Es a Color",
				nombreDelCampo: "en_color_id",
				valores: await BD_genericas.obtenerTodos("si_no_parcial", "id"),
				mensajePeli: ["SI: es a color.", "NO: es en blanco y negro."],
				mensajeColec: ['En caso de que algunos capítulos sean a color y otros no, elegí "Parcial"'],
				angosto: true,
			},
			{
				titulo: "Categoría",
				nombreDelCampo: "categoria_id",
				valores: await BD_genericas.obtenerTodos("categorias", "orden"),
				mensajes: [
					'"Centradas en la Fe Católica", significa que el rol de la Fe Católica es protagónico.',
					'Si es cristiana pero no católica, se pone como "Valores Presentes en la Cultura".',
					'Para ponerla como "Valores Presentes en la Cultura", los buenos valores deben ser evidentes.',
				],
			},
			{
				titulo: "Sub-categoría",
				nombreDelCampo: "subcategoria_id",
				valores: await BD_genericas.obtenerTodos("subcategorias", "orden"),
				mensajes: ["Elegí la subcategoría que mejor represente el tema."],
			},
			{
				titulo: "Público sugerido",
				nombreDelCampo: "publico_sugerido_id",
				valores: await BD_genericas.obtenerTodos("publicos_sugeridos", "orden"),
				mensajes: [
					"Mayores solamente: violencia o sensualidad, que pueden dañar la sensibilidad de un niño de 12 años.",
					"Mayores apto familia: para mayores, y niños si están acompañados por sus padres.",
					"Familia: ideal para compartir en familia y que todos disfruten",
					"Menores apto familia: para menores, también la puede disfrutar un adulto.",
					"Menores solamente: apuntado a un público solamente infantil.",
				],
			},
			{
				titulo: "Inspira fe y/o valores",
				nombreDelCampo: "fe_valores_id",
				valores: await BD_genericas.obtenerTodos("fe_valores", "orden"),
				mensajes: ["¿Considerás que deja una huella positiva en el corazón?"],
				angosto: true,
				grupo: "calificala",
			},
			{
				titulo: "Entretiene",
				nombreDelCampo: "entretiene_id",
				valores: await BD_genericas.obtenerTodos("entretiene", "orden"),
				mensajes: ["Se disfruta el rato viéndola"],
				angosto: true,
				grupo: "calificala",
			},
			{
				titulo: "Calidad sonora y visual",
				nombreDelCampo: "calidad_tecnica_id",
				valores: await BD_genericas.obtenerTodos("calidad_tecnica", "orden"),
				mensajes: ["Tené en cuenta la calidad del audio y de la imagen"],
				angosto: true,
				grupo: "calificala",
			},
			{
				titulo: "Personaje histórico",
				nombreDelCampo: "personaje_id",
				valores: await BD_genericas.obtenerTodos("personajes", "nombre"),
				mensajes: [
					"Podés ingresar un registro nuevo, haciendo click en el ícono de al lado.",
					"Si son varias las personas, podés poner la más representativa, o 'varios' si es una colección y luego se especifica en los capítulos.",
				],
				link: "personajes",
				grupo: "RCLV",
			},
			{
				titulo: "Hecho histórico",
				nombreDelCampo: "hecho_id",
				valores: await BD_genericas.obtenerTodos("hechos", "nombre"),
				mensajes: [
					"Podés ingresar un registro nuevo, haciendo click en el ícono de al lado.",
					"Si son varios los hechos, podés poner el más representativo, o 'varios' si es una colección y luego se especifica en los capítulos.",
				],
				link: "hechos",
				grupo: "RCLV",
			},
			{
				titulo: "Valor principal",
				nombreDelCampo: "valor_id",
				valores: await BD_genericas.obtenerTodos("valores", "nombre"),
				mensajes: [
					"Poné el valor más representativo.",
					"Si no lo encontrás en el listado, elegí la primera opción y lo podrás sugerir en 'edición'.",
				],
				grupo: "RCLV",
			},
		];
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
			{titulo: "Título original", nombreDelCampo: "nombre_original", input: true},
			{titulo: "Título en castellano", nombreDelCampo: "nombre_castellano", input: true},
			{titulo: "Año de estreno", nombreDelCampo: "ano_estreno", angosto: true, input: true},
			{titulo: "Año de finalización", nombreDelCampo: "ano_fin", angosto: true, input: true},
			{titulo: "Duración", nombreDelCampo: "duracion", angosto: true, input: true},
			{titulo: "País/es", nombreDelCampo: "paises_id"},
			{
				titulo: "Idioma Original",
				nombreDelCampo: "idioma_original_id",
				asociacion1: "idioma_original.nombre",
				asociacion2: "nombre",
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
				asociacion1: "en_castellano",
				asociacion2: "productos",
			},
			{
				titulo: "Es a Color",
				nombreDelCampo: "en_color_id",
				asociacion1: "en_color",
				asociacion2: "productos",
			},
			{
				titulo: "Categoría",
				nombreDelCampo: "categoria_id",
				asociacion1: "categoria",
				asociacion2: "nombre",
			},
			{
				titulo: "Sub-categoría",
				nombreDelCampo: "subcategoria_id",
				asociacion1: "subcategoria",
				asociacion2: "nombre",
			},
			{
				titulo: "Público sugerido",
				nombreDelCampo: "publico_sugerido_id",
				asociacion1: "publico_sugerido",
				asociacion2: "nombre",
			},
			{
				titulo: "Personaje histórico",
				nombreDelCampo: "personaje_id",
				asociacion1: "personaje",
				asociacion2: "nombre",
				rclv: true,
				input: true,
			},
			{
				titulo: "Hecho histórico",
				nombreDelCampo: "hecho_id",
				asociacion1: "hecho",
				asociacion2: "nombre",
				rclv: true,
				input: true,
			},
			{
				titulo: "Valor principal",
				nombreDelCampo: "valor_id",
				asociacion1: "valor",
				asociacion2: "nombre",
				rclv: true,
				input: true,
			},
		];
	},
	camposRevisarLinks: () => {
		return [
			{nombreDelCampo: "calidad"},
			{nombreDelCampo: "tipo_id"},
			{nombreDelCampo: "completo"},
			{nombreDelCampo: "parte"},
			{nombreDelCampo: "gratuito"},
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

	// Varios
	vistaAnterior: (urlAnterior) => {
		return {
			nombre: "fa-circle-left",
			link: urlAnterior ? urlAnterior : "/",
			titulo: "Ir a la vista anterior",
		};
	},
	vistaTablero: () => {
		return {
			nombre: "fa-spell-check",
			link: "/revision/tablero-de-control",
			titulo: "Ir al 'Tablero de Control' de Revisiones",
		};
	},
	vistaInicio: () => {
		return {nombre: "fa-house", link: "/", titulo: "Ir a 'Inicio'"};
	},
};
