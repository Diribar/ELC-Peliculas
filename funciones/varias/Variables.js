// **** Requires ***********
let BD_varias = require("../BD/Varias");

// *********** Para exportar ***********
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
				valores: await BD_varias.obtenerTodos("si_no_parcial", "id").then((n) =>
					n.map((m) => m.toJSON())
				),
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
				valores: await BD_varias.obtenerTodos("si_no_parcial", "id").then((n) =>
					n.map((m) => m.toJSON())
				),
				mensajePeli: ["SI: es a color.", "NO: es en blanco y negro."],
				mensajeColec: ['En caso de que algunos capítulos sean a color y otros no, elegí "Parcial"'],
				angosto: true,
			},
			{
				titulo: "Categoría",
				nombreDelCampo: "categoria_id",
				valores: await BD_varias.obtenerTodos("categorias", "orden").then((n) =>
					n.map((m) => m.toJSON())
				),
				mensajes: [
					'"Centradas en la Fe Católica", significa que el rol de la Fe Católica es protagónico.',
					'Si es cristiana pero no católica, se pone como "Valores Presentes en la Cultura".',
					'Para ponerla como "Valores Presentes en la Cultura", los buenos valores deben ser evidentes.',
				],
			},
			{
				titulo: "Sub-categoría",
				nombreDelCampo: "subcategoria_id",
				valores: await BD_varias.obtenerTodos("subcategorias", "orden").then((n) =>
					n.map((m) => m.toJSON())
				),
				mensajes: ["Elegí la subcategoría que mejor represente el tema."],
			},
			{
				titulo: "Público sugerido",
				nombreDelCampo: "publico_sugerido_id",
				valores: await BD_varias.obtenerTodos("publicos_sugeridos", "orden").then((n) =>
					n.map((m) => m.toJSON())
				),
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
				valores: await BD_varias.obtenerTodos("fe_valores", "orden").then((n) =>
					n.map((m) => m.toJSON())
				),
				mensajes: ["¿Considerás que deja una huella positiva en el corazón?"],
				angosto: true,
				grupo: "calificala",
			},
			{
				titulo: "Entretiene",
				nombreDelCampo: "entretiene_id",
				valores: await BD_varias.obtenerTodos("entretiene", "orden").then((n) =>
					n.map((m) => m.toJSON())
				),
				mensajes: ["Se disfruta el rato viéndola"],
				angosto: true,
				grupo: "calificala",
			},
			{
				titulo: "Calidad sonora y visual",
				nombreDelCampo: "calidad_tecnica_id",
				valores: await BD_varias.obtenerTodos("calidad_tecnica", "orden").then((n) =>
					n.map((m) => m.toJSON())
				),
				mensajes: ["Tené en cuenta la calidad del audio y de la imagen"],
				angosto: true,
				grupo: "calificala",
			},
			{
				titulo: "Personaje histórico",
				nombreDelCampo: "personaje_id",
				valores: await BD_varias.obtenerTodos("RCLV_personajes", "nombre").then((n) =>
					n.map((m) => m.toJSON())
				),
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
				valores: await BD_varias.obtenerTodos("RCLV_hechos", "nombre").then((n) =>
					n.map((m) => m.toJSON())
				),
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
				valores: await BD_varias.obtenerTodos("RCLV_valores", "nombre").then((n) =>
					n.map((m) => m.toJSON())
				),
				mensajes: [
					"Poné el valor más representativo.",
					"Si no lo encontrás en el listado, elegí la primera opción y lo podrás sugerir en 'edición'.",
				],
				grupo: "RCLV",
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
};
