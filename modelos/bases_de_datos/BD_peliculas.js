const db = require("../../bases_de_datos/modelos");
const entidad = db.peliculas;
//const { Op } = require("sequelize");

module.exports = {
	ObtenerTodos: () => {
		return entidad.findAll({
			include: ["coleccion_pelicula", "categoria", "subcategoria"],
			where: { borrado: false },
		});
	},

	ObtenerPorParametro: (parametro, valor) => {
		return entidad.findOne({
			where: { [parametro]: valor },
		});
	},

	AveriguarSiYaEnBD: (parametro, valor) => {
		return entidad
			.count({where: { [parametro]: valor }})
			.then((n) => n > 0);
	},

	ObtenerPorID: (ID) => {
		return entidad.findByPk(ID, {
			include: ["coleccion_pelicula", "categoria", "subcategoria"],
		});
	},

	NombreOriginalYaExistente: (nombre_original) => {
		return entidad.findOne({
			where: { nombre_original: nombre_original },
		});
	},
};
