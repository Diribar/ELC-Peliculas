"use strict";
// Definir variables
const BD_genericas = require("../BD/Genericas");

module.exports = {
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
				valores: await BD_genericas.obtenerTodos("RCLV_personajes", "nombre"),
				mensajes: [
					"Podés ingresar un registro nuevo, haciendo click en el ícono de al lado.",
					"Si son varias las personas, podés poner la más representativa, o 'varios' si es una colección y luego se especifica en los capítulos.",
				],
				link: "RCLV_personajes",
				grupo: "RCLV",
			},
			{
				titulo: "Hecho histórico",
				nombreDelCampo: "hecho_id",
				valores: await BD_genericas.obtenerTodos("RCLV_hechos", "nombre"),
				mensajes: [
					"Podés ingresar un registro nuevo, haciendo click en el ícono de al lado.",
					"Si son varios los hechos, podés poner el más representativo, o 'varios' si es una colección y luego se especifica en los capítulos.",
				],
				link: "RCLV_hechos",
				grupo: "RCLV",
			},
			{
				titulo: "Valor principal",
				nombreDelCampo: "valor_id",
				valores: await BD_genericas.obtenerTodos("RCLV_valores", "nombre"),
				mensajes: [
					"Poné el valor más representativo.",
					"Si no lo encontrás en el listado, elegí la primera opción y lo podrás sugerir en 'edición'.",
				],
				grupo: "RCLV",
			},
		];
	},

	camposRevisarEdic: () => {
		return [
			{
				titulo: "Título original",
				nombreDelCampo: "nombre_original",
			},
			{
				titulo: "Título en castellano",
				nombreDelCampo: "nombre_castellano",
			},
			{
				titulo: "Año de estreno",
				nombreDelCampo: "ano_estreno",
				angosto: true,
			},
			{
				titulo: "Año de finalización",
				nombreDelCampo: "ano_fin",
				angosto: true,
			},
			{
				titulo: "Duración",
				nombreDelCampo: "duracion",
				angosto: true,
			},
			{
				titulo: "País/es",
				nombreDelCampo: "paises_id",
			},
			{
				titulo: "Idioma Original",
				nombreDelCampo: "idioma_original_id",
				asociacion1: "idioma_original.nombre",
				asociacion2:"nombre",
			},
			{
				titulo: "Dirección",
				nombreDelCampo: "direccion",
			},
			{
				titulo: "Guión",
				nombreDelCampo: "guion",
			},
			{
				titulo: "Música",
				nombreDelCampo: "musica",
			},
			{
				titulo: "Actuación",
				nombreDelCampo: "actuacion",
			},
			{
				titulo: "Producción",
				nombreDelCampo: "produccion",
			},
			{
				titulo: "Sinopsis",
				nombreDelCampo: "sinopsis",
			},
			{
				titulo: "Existe una versión en castellano",
				nombreDelCampo: "en_castellano_id",
				asociacion1: "en_castellano",
				asociacion2:"productos",
			},
			{
				titulo: "Es a Color",
				nombreDelCampo: "en_color_id",
				asociacion1: "en_color",
				asociacion2:"productos",
			},
			{
				titulo: "Categoría",
				nombreDelCampo: "categoria_id",
				asociacion1: "categoria",
				asociacion2:"nombre",
			},
			{
				titulo: "Sub-categoría",
				nombreDelCampo: "subcategoria_id",
				asociacion1: "subcategoria",
				asociacion2:"nombre",
			},
			{
				titulo: "Público sugerido",
				nombreDelCampo: "publico_sugerido_id",
				asociacion1: "publico_sugerido",
				asociacion2:"nombre",
			},
			{
				titulo: "Personaje histórico",
				nombreDelCampo: "personaje_id",
				asociacion1: "personaje",
				asociacion2:"nombre",
				rclv: true,
			},
			{
				titulo: "Hecho histórico",
				nombreDelCampo: "hecho_id",
				asociacion1: "hecho",
				asociacion2:"nombre",
				rclv: true,
			},
			{
				titulo: "Valor principal",
				nombreDelCampo: "valor_id",
				asociacion1: "valor",
				asociacion2:"nombre",
				rclv: true,
			},
		];
	},

	provsQueNoRespetanCopyright: () => {
		return [
			{
				nombre: "Gloria TV",
				url: "gloria.tv",
			},
			{
				nombre: "Cuevana",
				url: "cuevana",
			},
		];
	},

	provsListaNegra: () => {
		return ["youporn", "pornhub"];
	},
	meses: () => {
		return ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
	},
};
