const db = require("../../base_de_datos/modelos");
const entidad = db.colecciones;
//const { Op } = require("sequelize");

module.exports = {
	obtenerTodos: () => {
		return entidad.findAll({
			include: ["coleccion_peliculas"],
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
			include: ["coleccion_peliculas"],
		});
	},

	NombreOriginalYaExistente: (nombre_original) => {
		return entidad.findOne({
			where: { nombre_original: nombre_original },
		});
	},
};
