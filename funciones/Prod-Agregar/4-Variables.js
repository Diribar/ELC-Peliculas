// **** Requires ***********
let BD_varias = require("../BD/varias");

module.exports = {
	camposDD1: () => {
		return [
			{
				titulo: "Título original",
				campo: "nombre_original",
				peliculas: true,
				colecciones: true,
			},
			{
				titulo: "Título en castellano",
				campo: "nombre_castellano",
				peliculas: true,
				colecciones: true,
			},
			{
				titulo: "Temporadas",
				campo: "cant_temporadas",
				numero: true,
				peliculas: false,
				colecciones: true,
			},
			{
				titulo: "Capítulos",
				campo: "cant_capitulos",
				numero: true,
				peliculas: false,
				colecciones: true,
			},
			{
				titulo: "Año de estreno",
				campo: "ano_estreno",
				numero: true,
				peliculas: true,
				colecciones: true,
			},
			{
				titulo: "Año de finalización",
				campo: "ano_fin",
				numero: true,
				peliculas: false,
				colecciones: true,
			},
			{
				titulo: "Duración (minutos)",
				campo: "duracion",
				numero: true,
				peliculas: true,
				colecciones: false,
			},
		];
	},

	camposDD2: () => {
		return [
			{titulo: "Dirección", campo: "direccion", peliculas: true, colecciones: true},
			{titulo: "Guión", campo: "guion", peliculas: true, colecciones: true},
			{titulo: "Música", campo: "musica", peliculas: true, colecciones: true},
			{titulo: "Actuación", campo: "actuacion", peliculas: true, colecciones: true},
			{titulo: "Producción", campo: "produccion", peliculas: true, colecciones: true},
		];
	},

	datosPersSelect: async () => {
		return [
			{
				titulo: "Existe una versión en castellano",
				campo: "en_castellano_id",
				valores: await BD_varias.obtenerTodos("si_no_parcial", "id"),
				peliculas: true,
				colecciones: true,
				mensajePeli: [
					'Para poner "SI", estate seguro de que hayas escuchado LA PELÍCULA ENTERA en ese idioma. No te guíes por el trailer.',
				],
				mensajeColec: [
					'En caso de que algunos capítulos estén en castellano y otros no, elegí "Parcial"',
				],
			},
			{
				titulo: "Es a Color",
				campo: "en_color_id",
				valores: await BD_varias.obtenerTodos("si_no_parcial", "id"),
				peliculas: true,
				colecciones: true,
				mensajePeli: ["SI: es a color.", "NO: es en blanco y negro."],
				mensajeColec: [
					'En caso de que algunos capítulos sean a color y otros no, elegí "Parcial"',
				],
			},
			{
				titulo: "Categoría",
				campo: "categoria_id",
				valores: await BD_varias.obtenerTodos("categorias", "orden"),
				peliculas: true,
				colecciones: true,
				mensajes: [
					'"Centradas en la Fe Católica", significa que el rol de la Fe Católica es protagónico.',
					'Si es cristiana pero no católica, se pone como "Valores Presentes en la Cultura".',
					'Para ponerla como "Valores Presentes en la Cultura", los buenos valores deben ser evidentes.',
				],
			},
			{
				titulo: "Sub-categoría",
				campo: "subcategoria_id",
				valores: await BD_varias.obtenerTodos("subcategorias", "orden"),
				peliculas: true,
				colecciones: true,
				mensajes: ["Elegí la subcategoría que mejor represente el tema."],
			},
			{
				titulo: "Público sugerido",
				campo: "publico_sugerido_id",
				valores: await BD_varias.obtenerTodos("publicos_sugeridos", "orden"),
				peliculas: true,
				colecciones: true,
				mensajes: [
					"Mayores solamente: sensualidad o crueldad explícita, puede dañar la sensibilidad de un niño de 12 años.",
					"Mayores apto familia: para mayores, sin dañar la sensibilidad de un niño.",
					"Familia: ideal para compartir en familia y que todos disfruten",
					"Menores apto familia: para menores, también la puede disfrutar un adulto.",
					"Menores solamente: apuntado a un público solamente infantil.",
				],
			},
			{
				titulo: "Inspira fe y/o valores",
				campo: "fe_valores_id",
				valores: await BD_varias.obtenerTodos("fe_valores", "orden"),
				peliculas: true,
				colecciones: true,
				mensajes: ["¿Considerás que deja algo positivo en el corazón?"],
			},
			{
				titulo: "Entretiene",
				campo: "entretiene_id",
				valores: await BD_varias.obtenerTodos("entretiene", "orden"),
				peliculas: true,
				colecciones: true,
				mensajes: ["Se disfruta el rato viéndola"],
			},
			{
				titulo: "Calidad sonora y visual",
				campo: "calidad_tecnica_id",
				valores: await BD_varias.obtenerTodos("calidad_tecnica", "orden"),
				peliculas: true,
				colecciones: true,
				mensajes: ["Tené en cuenta la calidad del audio y de la imagen"],
			},
			{
				titulo: "Personaje histórico",
				campo: "personaje_historico_id",
				valores: await BD_varias.obtenerTodos("historicos_personajes", "nombre"),
				peliculas: true,
				colecciones: true,
				mensajes: [
					"Podés ingresar un registro nuevo, haciendo click en el ícono de al lado.",
					"Si son varias las personas, podés poner la más representativa, o ninguna si es una colección y luego se especifica en los capítulos",
				],
				link: "historicos_personajes",
			},
			{
				titulo: "Hecho histórico",
				campo: "hecho_historico_id",
				valores: await BD_varias.obtenerTodos("historicos_hechos", "nombre"),
				peliculas: true,
				colecciones: true,
				mensajes: [
					"Podés ingresar un registro nuevo, haciendo click en el ícono de al lado.",
					"Si son varios los hechos, podés poner el más representativo, o ninguno si es una colección y luego se especifica en los capítulos",
				],
				link: "historicos_hechos",
			},
		];
	},

	datosPersInput: () => {
		return [
			{
				tituloPeli: "Link de un trailer",
				tituloColec: "Link de un trailer",
				campo: "link_trailer",
				peliculas: true,
				colecciones: true,
				mensajes: [
					"Nos interesa el trailer del primer capítulo.",
					"Debe ser de un sitio seguro, sin virus.",
					"Es ideal si vincula a un link de You Tube.",
				],
			},
			{
				tituloPeli: "Link de la película",
				campo: "link_pelicula",
				peliculas: true,
				colecciones: false,
				mensajes: [
					"Nos interesa el link del primer capítulo.",
					"Debe ser de un sitio seguro, sin virus.",
					"Debe ser de un sitio con política de respeto al copyright. Ej: You Tube.",
					"Pedimos un link con una antigüedad mayor a 3 meses.",
					"En lo posible, elegí un link en castellano y de buena calidad.",
				],
			},
		];
	},
};
