const db = require("../../bases_de_datos/modelos");
const entidad = db.peliculas;
const { Op } = require("sequelize");

module.exports = {
	ObtenerTodos: () => {
		return entidad.findAll({
			include: ["coleccion_pelicula", "categoria", "subcategoria"],
			where: { borrado: false },
		});
	},

	ObtenerPorParametro: (parametro, valor) => {
		return entidad.findOne({
			include: ["coleccion_pelicula", "categoria", "subcategoria"],
			where: { [parametro]: valor },
		});
	},

	TituloOriginalYaExistente: (nombre_original, peliculaID) => {
		return entidad.count({
			where: {
				id: { [Op.ne]: peliculaID },
				nombre_original: nombre_original,
			},
		});
	},
};
