const db = require("../../bases_de_datos/modelos");
const entidad = db.colecciones_cabecera;
//const { Op } = require("sequelize");

module.exports = {
	ObtenerTodos: () => {
		return entidad.findAll({
			include: ["coleccion_peliculas"],
			where: { borrado: false },
		});
	},

	ObtenerPorParametro: (parametro, valor) => {
		return entidad.findOne({
			where: { [parametro]: valor },
		});
	},

	ObtenerPorID: (ID) => {
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
