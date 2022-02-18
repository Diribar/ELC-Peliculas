// **** Requires ***********
let BD_varias = require("../BD/varias");

// *********** Para exportar ***********
module.exports = {
	camposDD: () => {
		return [
			{
				titulo: "Título original",
				campo: "nombre_original",
				peliculas: true,
				colecciones: true,
				antesDePais: true,
			},
			{
				titulo: "Título en castellano",
				campo: "nombre_castellano",
				peliculas: true,
				colecciones: true,
				antesDePais: true,
			},
			{
				titulo: "Año de estreno",
				campo: "ano_estreno",
				numero: true,
				peliculas: true,
				colecciones: true,
				antesDePais: true,
			},
			{
				titulo: "Año de finalización",
				campo: "ano_fin",
				numero: true,
				peliculas: false,
				colecciones: true,
				antesDePais: true,
			},
			{
				titulo: "Duración (minutos)",
				campo: "duracion",
				numero: true,
				peliculas: true,
				colecciones: false,
				antesDePais: true,
			},
			{
				campo: "paises_id",
				peliculas: true,
				colecciones: true,
				omitirRutinaVista: true,
			},
			{
				campo: "idioma_original_id",
				peliculas: true,
				colecciones: true,
				omitirRutinaVista: true,
			},
			{titulo: "Dirección", campo: "direccion", peliculas: true, colecciones: true},
			{titulo: "Guión", campo: "guion", peliculas: true, colecciones: true},
			{titulo: "Música", campo: "musica", peliculas: true, colecciones: true},
			{titulo: "Actuación", campo: "actuacion", peliculas: true, colecciones: true},
			{titulo: "Producción", campo: "produccion", peliculas: true, colecciones: true},
			{campo: "sinopsis", peliculas: true, colecciones: true, omitirRutinaVista: true},
			{campo: "avatar", peliculas: true, colecciones: true, omitirRutinaVista: true},
		];
	},

	camposDP: async () => {
		return [
			{
				titulo: "Existe una versión en castellano",
				campo: "en_castellano_id",
				valores: await BD_varias.obtenerTodos("si_no_parcial", "id"),
				mensajePeli: [
					'Para poner "SI", estate seguro de que hayas escuchado LA PELÍCULA ENTERA en ese idioma. No te guíes por el trailer.',
				],
				mensajeColec: [
					'En caso de que algunos capítulos estén en castellano y otros no, elegí "Parcial"',
				],
				clase: "angosto",
			},
			{
				titulo: "Es a Color",
				campo: "en_color_id",
				valores: await BD_varias.obtenerTodos("si_no_parcial", "id"),
				mensajePeli: ["SI: es a color.", "NO: es en blanco y negro."],
				mensajeColec: [
					'En caso de que algunos capítulos sean a color y otros no, elegí "Parcial"',
				],
				clase: "angosto",
			},
			{
				titulo: "Categoría",
				campo: "categoria_id",
				valores: await BD_varias.obtenerTodos("categorias", "orden"),
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
				mensajes: ["Elegí la subcategoría que mejor represente el tema."],
			},
			{
				titulo: "Público sugerido",
				campo: "publico_sugerido_id",
				valores: await BD_varias.obtenerTodos("publicos_sugeridos", "orden"),
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
				mensajes: ["¿Considerás que deja una huella positiva en el corazón?"],
				clase: "angosto",
			},
			{
				titulo: "Entretiene",
				campo: "entretiene_id",
				valores: await BD_varias.obtenerTodos("entretiene", "orden"),
				mensajes: ["Se disfruta el rato viéndola"],
				clase: "angosto",
			},
			{
				titulo: "Calidad sonora y visual",
				campo: "calidad_tecnica_id",
				valores: await BD_varias.obtenerTodos("calidad_tecnica", "orden"),
				mensajes: ["Tené en cuenta la calidad del audio y de la imagen"],
				clase: "angosto",
			},
			{
				titulo: "Personaje histórico",
				campo: "personaje_historico_id",
				valores: await BD_varias.obtenerTodos("RCLV_personajes_historicos", "nombre"),
				mensajes: [
					"Podés ingresar un registro nuevo, haciendo click en el ícono de al lado.",
					"Si son varias las personas, podés poner la más representativa, o 'varios' si es una colección y luego se especifica en los capítulos.",
				],
				link: "RCLV_personajes_historicos",
				RCLV: true,
			},
			{
				titulo: "Hecho histórico",
				campo: "hecho_historico_id",
				valores: await BD_varias.obtenerTodos("RCLV_hechos_historicos", "nombre"),
				mensajes: [
					"Podés ingresar un registro nuevo, haciendo click en el ícono de al lado.",
					"Si son varios los hechos, podés poner el más representativo, o 'varios' si es una colección y luego se especifica en los capítulos.",
				],
				link: "RCLV_hechos_historicos",
				RCLV: true,
			},
			{
				titulo: "Valor principal",
				campo: "valor_id",
				valores: await BD_varias.obtenerTodos("RCLV_valores", "nombre"),
				mensajes: [
					"Poné el valor más representativo.",
					"Si no lo encontrás en el listado, elegí la primera opción y lo podrás sugerir en 'edición'.",
				],
				RCLV: true,
			},
		];
	},

	provs_que_no_respetan_copyright: () => {
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

	provs_lista_negra: ()=> {
		return [
			"youporn",
			"pornhub",
		]
	}
};
