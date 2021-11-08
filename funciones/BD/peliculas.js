const db = require("../../base_de_datos/modelos");
const entidad = db.peliculas;
//const { Op } = require("sequelize");

module.exports = {
	obtenerTodos: () => {
		return entidad.findAll({
			include: ["coleccion_pelicula", "categoria", "subcategoria"],
			where: { borrado: false },
		});
	},

	obtenerPorParametro: (parametro, valor) => {
		return entidad.findOne({
			where: { [parametro]: valor },
		});
	},

	obtenerPorID: (ID) => {
		return entidad.findByPk(ID, {
			include: ["coleccion_pelicula", "categoria", "subcategoria"],
		});
	},

	NombreOriginalYaExistente: (nombre_original) => {
		return entidad.findOne({
			where: { nombre_original: nombre_original },
		});
	},

	agregarPelicula: (datos) => {
		return entidad.create(datos);
	},
};
